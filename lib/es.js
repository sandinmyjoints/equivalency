const en = require('./en');

// See https://www.spanishdict.com/guide/spanish-punctuation
const COMMON_PUNCTUATION = en.COMMON_PUNCTUATION + `¿¡«»`;
const COMMON_SYMBOLS = en.COMMON_SYMBOLS + `€`;

module.exports = {
  COMMON_PUNCTUATION,
  COMMON_SYMBOLS,
};
