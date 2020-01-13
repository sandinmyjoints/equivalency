const {
  replaceAll,
  assert,
  Rule,
  FunctionRule,
  MapRule,
} = require('./definitions');
const normalize = require('./normalize');

const identity = (s1, s2) => [s1, s2];
const identityRule = new FunctionRule(identity, { name: 'identity' });

const capitalization = (s1, s2) => {
  return [s1.toLowerCase(), s2.toLowerCase()];
};
const capitalizationRule = new FunctionRule(capitalization, {
  name: 'capitalization',
});

const unicodeNormalization = (s1, s2) => {
  return [normalize(s1, 'NFC'), normalize(s2, 'NFC')];
};
const unicodeNormalizationRule = new FunctionRule(unicodeNormalization, {
  name: 'unicodeNormalization',
});

const RE_ANY_WHITESPACE = /[\s]+/g;
const whitespaceDifferences = (s1, s2) => {
  return [
    s1.trim().replace(RE_ANY_WHITESPACE, ' '),
    s2.trim().replace(RE_ANY_WHITESPACE, ' '),
  ];
};
const whitespaceDifferencesRule = new FunctionRule(whitespaceDifferences, {
  name: 'whitespaceDifferences',
});

const acuteAccentCombining = '\u0301';
// Note that Unicode calls this "diaresis", see
// https://en.wikipedia.org/wiki/Diaeresis_(diacritic)
const umlautCombining = '\u0308';

// https://www.fileformat.info/info/unicode/block/combining_diacritical_marks/list.htm
// U+0300–U+036F
const startOfCombiningDiacriticsBlock = 0x300;
const endOfCombiningDiacriticsBlock = 0x36f;
const combiningDiacriticsBlock = new Array(
  endOfCombiningDiacriticsBlock - startOfCombiningDiacriticsBlock
)
  .fill(undefined)
  .map((_, idx) => String.fromCodePoint(idx + startOfCombiningDiacriticsBlock));

const commonCombiningDiacritics = [
  '\u0300', // grave accent
  acuteAccentCombining, // acute accent
  '\u0302', // circumflex
  '\u0303', // tilde
  umlautCombining, // diaresis, aka umlaut
  '\u0327', // cedilla
];

// pass in an array of strings
const codepointRuleGenerator = (codepoints, name) => {
  return new FunctionRule(
    (s1, s2) => {
      let s1prime = normalize(s1, 'NFD');
      let s2prime = normalize(s2, 'NFD');

      codepoints.forEach(c => {
        s1prime = replaceAll(s1prime, c);
        s2prime = replaceAll(s2prime, c);
      });

      // FIXME: should be restored to whatever normalization they came in with.
      return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
    },
    { name }
  );
};

const commonDiacriticsRule = codepointRuleGenerator(
  commonCombiningDiacritics,
  'common diacritics'
);

const acuteAccentRule = codepointRuleGenerator(
  [acuteAccentCombining],
  'acute accent'
);

const umlautRule = codepointRuleGenerator([umlautCombining], 'umlaut');

const combiningDiacriticsBlockRule = codepointRuleGenerator(
  combiningDiacriticsBlock,
  'combining diacritics block'
);

const combiningDiacriticsBlockExceptAcuteAndUmlautRule = codepointRuleGenerator(
  combiningDiacriticsBlock
    .filter(codepoint => codepoint !== acuteAccentCombining)
    .filter(codepoint => codepoint !== umlautCombining),
  'combining diacritics block except acute and umlaut'
);

const wordPrefixRuleCreator = word =>
  new FunctionRule(
    (s1, s2) => {
      const regexp = new RegExp(`^${word}\\s+`);
      return [s1.replace(regexp, ''), s2.replace(regexp, '')];
    },
    { name: `wordPrefixRule '${word}'` }
  );

const en = require('./en');
const enExport = Object.keys(en).reduce((accum, k) => {
  accum[k] = Rule.from(en[k]);
  return accum;
}, {});

const es = require('./es');
const esExport = Object.keys(es).reduce((accum, k) => {
  accum[k] = Rule.from(es[k]);
  return accum;
}, {});

module.exports = {
  assert,
  Rule,
  MapRule,
  identityRule,
  en: enExport,
  es: esExport,
  CAPITALIZATION: capitalizationRule,
  UNICODE_NORMALIZATION: unicodeNormalizationRule,
  WHITESPACE_DIFFERENCES: whitespaceDifferencesRule,
  COMMON_DIACRITICS: commonDiacriticsRule,
  ACUTE_ACCENT: acuteAccentRule,
  UMLAUT: umlautRule,
  COMBINING_DIACRITICS_BLOCK: combiningDiacriticsBlockRule,
  COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT: combiningDiacriticsBlockExceptAcuteAndUmlautRule,
  wordPrefix: wordPrefixRuleCreator,
};
