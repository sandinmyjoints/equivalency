// A set of predefined rules that are especially applicable to Spanish strings.

const en = require('./rules-en');
const { RemoveRule, ReplaceRule} = require('./rules');

// See https://www.spanishdict.com/guide/spanish-punctuation
const COMMON_PUNCTUATION_STR = en.COMMON_PUNCTUATION_STR + `¿¡«»`;
const COMMON_PUNCTUATION = new RemoveRule(COMMON_PUNCTUATION_STR, {
  name: 'common punctuation',
});
const COMMON_SYMBOLS_STR = en.COMMON_SYMBOLS_STR + `€`;
const COMMON_SYMBOLS = new RemoveRule(COMMON_SYMBOLS_STR, {
  name: 'common symbols',
});

const COMMON_PUNCTUATION_AND_SYMBOLS_STR = COMMON_PUNCTUATION_STR + COMMON_SYMBOLS_STR;
const COMMON_PUNCTUATION_AND_SYMBOLS = new RemoveRule(COMMON_PUNCTUATION_AND_SYMBOLS_STR, {
  name: 'common punctuation and symbols'
});

const PUNCTUATION_AS_WHITESPACE = new ReplaceRule(COMMON_PUNCTUATION_STR.replace(/['`-]/g, ''), ' ');

module.exports = {
  COMMON_PUNCTUATION_STR,
  COMMON_PUNCTUATION,
  COMMON_SYMBOLS_STR,
  COMMON_SYMBOLS,
  COMMON_PUNCTUATION_AND_SYMBOLS,
  PUNCTUATION_AS_WHITESPACE
};
