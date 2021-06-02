// A set of predefined rules that are especially applicable to English strings.

const { FunctionRule, RemoveRule } = require('./rules');
const normalize = require('./normalize');

// These two lists contain all ASCII symbols, where symbol is defined as a
// printable ASCII character not matching [ 0-9a-zA-z].
const ASCII_PUNCTUATION_STR = `!"',-.:;?\``;
const ASCII_PUNCTUATION = new RemoveRule(ASCII_PUNCTUATION_STR, {
  name: 'ascii punctuation',
});
const ASCII_SYMBOLS_STR = `$#&%()*+/\\<=>@[]^_{|}~`;
const ASCII_SYMBOLS = new RemoveRule(ASCII_SYMBOLS_STR, {
  name: 'ascii symbols',
});

const COMMON_NONASCII_PUNCTUATION_STR = `…“”‘’´`;
const COMMON_NONASCII_PUNCTUATION = new RemoveRule(
  COMMON_NONASCII_PUNCTUATION_STR,
  {
    name: 'common non-ASCII punctuation',
  }
);
const COMMON_PUNCTUATION_STR =
  ASCII_PUNCTUATION_STR + COMMON_NONASCII_PUNCTUATION_STR;
const COMMON_PUNCTUATION = new RemoveRule(COMMON_PUNCTUATION_STR, {
  name: 'common punctuation',
});
const COMMON_SYMBOLS_STR = ASCII_SYMBOLS_STR;
const COMMON_SYMBOLS = new RemoveRule(COMMON_SYMBOLS_STR, {
  name: 'common symbols',
});

const COMMON_PUNCTUATION_AND_SYMBOLS_STR = COMMON_PUNCTUATION_STR + COMMON_SYMBOLS_STR;
const COMMON_PUNCTUATION_AND_SYMBOLS = new RemoveRule(COMMON_PUNCTUATION_AND_SYMBOLS_STR, {
  name: 'common punctuation and symbols'
});

const INFINITIVE_VERBS = new FunctionRule(
  (s1, s2) => {
    let s1prime = normalize(s1, 'NFD');
    let s2prime = normalize(s2, 'NFD');

    const RE_BEGINS_WITH_TO = /^[\s]*to[\s]+/i;

    return [
      s1prime.replace(RE_BEGINS_WITH_TO, ''),
      s2prime.replace(RE_BEGINS_WITH_TO, ''),
    ];
  },
  { name: 'infinitive verbs' }
);

module.exports = {
  ASCII_PUNCTUATION_STR,
  ASCII_PUNCTUATION,
  ASCII_SYMBOLS_STR,
  ASCII_SYMBOLS,
  COMMON_PUNCTUATION_STR,
  COMMON_NONASCII_PUNCTUATION_STR,
  COMMON_NONASCII_PUNCTUATION,
  COMMON_PUNCTUATION,
  COMMON_SYMBOLS_STR,
  COMMON_SYMBOLS,
  COMMON_PUNCTUATION_AND_SYMBOLS,
  INFINITIVE_VERBS,
};
