const rules = require('./rules');

module.exports = {
  assert: rules.assert,
  Rule: rules.Rule,
  MapRule: rules.MapRule,
  FunctionRule: rules.FunctionRule,
  RemoveRule: rules.RemoveRule,
  identityRule: rules.identityRule,
  CAPITALIZATION: rules.CAPITALIZATION,
  UNICODE_NORMALIZATION: rules.UNICODE_NORMALIZATION,
  WHITESPACE_DIFFERENCES: rules.WHITESPACE_DIFFERENCES,
  COMMON_DIACRITICS: rules.COMMON_DIACRITICS,
  ACUTE_ACCENT: rules.ACUTE_ACCENT,
  UMLAUT: rules.UMLAUT,
  COMBINING_DIACRITICS_BLOCK: rules.COMBINING_DIACRITICS_BLOCK,
  COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT:
    rules.COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT,
  wordPrefix: rules.wordPrefix,
  en: require('./rules-en'),
  es: require('./rules-es'),
};
