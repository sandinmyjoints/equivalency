const inherits = require('inherits');
const isString = require('is-string');

const {
  mapFromString,
  isMap,
  isFunction,
  replaceAll,
  assert,
} = require('./helpers');
const normalize = require('./normalize');

function Rule(opts) {
  this.opts = opts;
  // Because optimizations and browsers may not preserve
  // instance.constructor.name, we cannot rely on it for discovering type.
  this.type = 'Rule';
  this.name = opts.name || 'unnamed';
}

Rule.from = (candidateRule, givenName) => {
  if (candidateRule instanceof Rule || /Rule/.test(candidateRule.type))
    return candidateRule;
  let name;
  if (givenName) {
    name = givenName;
  } else if (candidateRule.name) {
    name = candidateRule.name;
  } else if (typeof candidateRule === 'string') {
    name = candidateRule;
  }

  let newRule;
  if (isString(candidateRule)) {
    newRule = new MapRule(mapFromString(candidateRule), { name });
  } else if (isMap(candidateRule)) {
    newRule = new MapRule(candidateRule, { name });
  } else if (isFunction(candidateRule)) {
    newRule = new FunctionRule(candidateRule, { name });
  } else {
    throw new Error(`expected a String, Function, or Map: ${candidateRule}`);
  }
  return newRule;
};

function FunctionRule(fn, opts = { modifiesCharacters: true }) {
  if (!opts.name) opts.name = fn.toString();
  Rule.call(this, opts);
  this.fn = fn;
  this.type = 'FunctionRule';
}
inherits(FunctionRule, Rule);

FunctionRule.prototype.apply = function(s1, s2) {
  return this.fn(s1, s2);
};

// TODO: ideally, MapRule would mixin Map.
function MapRule(map, opts = { modifiesCharacters: false }) {
  if (!opts.name) opts.name = map.toString();
  Rule.call(this, opts);
  assert(
    map instanceof Map,
    `${map} is not an instance of Map (is ${map.constructor})`
  );
  this.map = map;
  this.type = 'MapRule';
}
inherits(MapRule, Rule);

MapRule.prototype.apply = function() {
  throw new Error('MapRules cannot be directly applied.');
};

MapRule.prototype.entries = function() {
  return this.map.entries();
};

MapRule.prototype.keys = function() {
  return this.map.keys();
};

function RemoveRule(str, opts = { modifiesCharacters: false }) {
  assert(
    typeof str === 'string',
    `${str} is not a string (is ${str.constructor})`
  );
  const map = mapFromString(str);
  MapRule.call(this, map, opts);
}
inherits(RemoveRule, MapRule);

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

module.exports = {
  assert,
  Rule,
  MapRule,
  FunctionRule,
  RemoveRule,
  identityRule,
  CAPITALIZATION: capitalizationRule,
  UNICODE_NORMALIZATION: unicodeNormalizationRule,
  WHITESPACE_DIFFERENCES: whitespaceDifferencesRule,
  COMMON_DIACRITICS: commonDiacriticsRule,
  ACUTE_ACCENT: acuteAccentRule,
  UMLAUT: umlautRule,
  COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT: combiningDiacriticsBlockExceptAcuteAndUmlautRule,
  wordPrefix: wordPrefixRuleCreator,
};
