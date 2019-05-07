const { FunctionRule } = require('./definitions');
const normalize = require('./normalize');

// These two lists contain all ASCII symbols, where symbol is defined as a
// printable ASCII character not matching [ 0-9a-zA-z].
const ASCII_PUNCTUATION = `!"',-.:;?\``;
const ASCII_SYMBOLS = `$#&%()*+/\\<=>@[]^_{|}~`;

const COMMON_NONASCII_PUNCTUATION = `…“”‘’`;
const COMMON_PUNCTUATION = ASCII_PUNCTUATION + COMMON_NONASCII_PUNCTUATION;
const COMMON_SYMBOLS = ASCII_SYMBOLS;

const INFINITIVE_VERBS = new FunctionRule((s1, s2) => {
  let s1prime = normalize(s1, 'NFD');
  let s2prime = normalize(s2, 'NFD');

  const RE_BEGINS_WITH_TO = /^[\s]*to[\s]+/i;

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
  INFINITIVE_VERBS,
};
