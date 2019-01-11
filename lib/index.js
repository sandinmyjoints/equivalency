const {
  replaceAll,
  assert,
  Rule,
  FunctionRule,
  MapRule,
} = require('./definitions');
const normalize = require('./normalize');

const capitalization = (s1, s2) => {
  return [s1.toLowerCase(), s2.toLowerCase()];
};
const capitalizationRule = new FunctionRule(capitalization);

const unicodeNormalization = (s1, s2) => {
  return [normalize(s1, 'NFC'), normalize(s2, 'NFC')];
};
const unicodeNormalizationRule = new FunctionRule(unicodeNormalization);

const RE_ANY_WHITESPACE = /[\s]+/g;
const whitespaceDifferences = (s1, s2) => {
  return [
    s1.trim().replace(RE_ANY_WHITESPACE, ' '),
    s2.trim().replace(RE_ANY_WHITESPACE, ' '),
  ];
};
const whitespaceDifferencesRule = new FunctionRule(whitespaceDifferences);

// TODO: Could generalize to diacritics, i.e., Unicode category "nonspacing
// mark" (see http://www.fileformat.info/info/unicode/category/Mn/list.htm)
const combiningAccents = ['\u0300', '\u0301', '\u0302'];

const accentsRule = new FunctionRule((s1, s2) => {
  let s1prime = normalize(s1, 'NFD');
  let s2prime = normalize(s2, 'NFD');

  combiningAccents.forEach(c => {
    s1prime = replaceAll(s1prime, c);
    s2prime = replaceAll(s2prime, c);
  });

  // FIXME: should be restored to whatever normalization they came in with.
  return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
});

const wordPrefixRuleCreator = word =>
  new FunctionRule((s1, s2) => {
    const regexp = new RegExp(`^${word}\\s+`);
    return [s1.replace(regexp, ''), s2.replace(regexp, '')];
  });

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
  en: enExport,
  es: esExport,
  CAPITALIZATION: capitalizationRule,
  UNICODE_NORMALIZATION: unicodeNormalizationRule,
  WHITESPACE_DIFFERENCES: whitespaceDifferencesRule,
  ACCENTS: accentsRule,
  wordPrefix: wordPrefixRuleCreator,
};
