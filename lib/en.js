const { replaceAll, FunctionRule } = require('./definitions');
const normalize = require('./normalize');

// These two lists contain all ASCII symbols, where symbol is defined as a
// printable ASCII character not matching [ 0-9a-zA-z].
const ASCII_PUNCTUATION = `!"',-.:;?\``;
const ASCII_SYMBOLS = `$#&%()*+/\\<=>@[]^_{|}~`;

const COMMON_NONASCII_PUNCTUATION = `…“”‘’`;
const COMMON_PUNCTUATION = ASCII_PUNCTUATION + COMMON_NONASCII_PUNCTUATION;
const COMMON_SYMBOLS = ASCII_SYMBOLS;

const commonCombiningDiacritics = [
  '\u0300', // grave accent
  '\u0301', // acute accent
  '\u0302', // circumflex
  '\u0303', // tilde
  '\u0308', // diaresis
  '\u0327', // cedilla
];

const COMMON_DIACRITICS = new FunctionRule((s1, s2) => {
  let s1prime = normalize(s1, 'NFD');
  let s2prime = normalize(s2, 'NFD');

  commonCombiningDiacritics.forEach(c => {
    s1prime = replaceAll(s1prime, c);
    s2prime = replaceAll(s2prime, c);
  });

  // FIXME: should be restored to whatever normalization they came in with.
  return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
});

const INFINITIVE_VERBS = new FunctionRule((s1, s2) => {
  let s1prime = normalize(s1, 'NFD');
  let s2prime = normalize(s2, 'NFD');

  const RE_BEGINS_WITH_TO = /^[\s]*(to)[\s]*/i;

  return [
    s1prime.replace(RE_BEGINS_WITH_TO, ''),
    s2prime.replace(RE_BEGINS_WITH_TO, ''),
  ];
});

module.exports = {
  ASCII_PUNCTUATION,
  ASCII_SYMBOLS,
  COMMON_PUNCTUATION,
  COMMON_SYMBOLS,
  COMMON_DIACRITICS,
  INFINITIVE_VERBS
};
