// These two lists contain all ASCII symbols, where symbol is defined as a
// printable ASCII character not matching [ 0-9a-zA-z].
const ASCII_PUNCTUATION = `!"',-.:;?\``;
const ASCII_SYMBOLS = `$#&%()*+/\\<=>@[]^_{|}~`;

const COMMON_NONASCII_PUNCTUATION = `…“”‘’`;
const COMMON_PUNCTUATION = ASCII_PUNCTUATION + COMMON_NONASCII_PUNCTUATION;
const COMMON_SYMBOLS = ASCII_SYMBOLS;

module.exports = {
  ASCII_PUNCTUATION,
  ASCII_SYMBOLS,
  COMMON_PUNCTUATION,
  COMMON_SYMBOLS,
};
