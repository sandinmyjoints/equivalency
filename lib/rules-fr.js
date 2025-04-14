// A set of predefined rules that are especially applicable to French strings.

const en = require('./rules-en');
const { RemoveRule, FunctionRule } = require('./rules');
const normalize = require('./normalize');

const COMMON_PUNCTUATION_STR = en.COMMON_PUNCTUATION_STR + `«»`;
const COMMON_SYMBOLS_STR = en.COMMON_SYMBOLS_STR + `€`;
const COMMON_PUNCTUATION_AND_SYMBOLS_STR =
  COMMON_PUNCTUATION_STR + COMMON_SYMBOLS_STR;
const COMMON_PUNCTUATION_AND_SYMBOLS = new RemoveRule(
  COMMON_PUNCTUATION_AND_SYMBOLS_STR,
  {
    name: 'common punctuation and symbols',
  }
);

const replaceLigatures = str => {
  return str
    .replace(/æ/g, 'ae')
    .replace(/Æ/g, 'AE')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'OE');
};

const LIGATURES = new FunctionRule(
  (s1, s2) => {
    return [replaceLigatures(s1), replaceLigatures(s2)];
  },
  { name: 'ligatures replaced' }
);

const DECOMPOSED_ACCENTS = ['́', '̀'];

const isAccentedCharacter = char => {
  const normalized = normalize(char, 'NFD').split('');
  return normalized.slice(1).some(char => DECOMPOSED_ACCENTS.includes(char));
};

const isUppercase = char => {
  return char === char.toUpperCase();
};

const isVowelCharacter = char => {
  return ['A', 'E', 'I', 'O', 'U'].includes(
    normalize(char, 'NFD')[0].toUpperCase()
  );
};

const stripAccents = str => {
  return normalize(str, 'NFC')
    .split('')
    .map(char =>
      normalize(
        normalize(char, 'NFD')
          .split('')
          .filter(char => !DECOMPOSED_ACCENTS.includes(char))
          .join(''),
        'NFC'
      )
    )
    .join('');
};

const asymmetricCapitalVowelAccents = (source, target) => {
  const sourceArr = normalize(source, 'NFC').split('');
  const targetArr = normalize(target, 'NFC').split('');

  const shouldModify = sourceArr
    .filter(char => isVowelCharacter(char) && isUppercase(char))
    .every(char => !isAccentedCharacter(char));

  return shouldModify
    ? targetArr
        .map((char, i) => {
          if (
            sourceArr[i] &&
            isUppercase(sourceArr[i]) &&
            isVowelCharacter(sourceArr[i]) &&
            isVowelCharacter(char) &&
            isAccentedCharacter(char)
          ) {
            return stripAccents(char);
          }
          return char;
        })
        .join('')
    : target;
};

const capitalVowelAccents = (str1, str2) => {
  const res1 = asymmetricCapitalVowelAccents(str2, str1);
  const res2 = asymmetricCapitalVowelAccents(str1, str2);
  return [res1, res2];
};

const capitalVowelAccentsRule = new FunctionRule(capitalVowelAccents, {
  name: 'capital vowel accents',
});

module.exports = {
  CAPITAL_VOWEL_ACCENTS: capitalVowelAccentsRule,
  COMMON_PUNCTUATION_AND_SYMBOLS,
  LIGATURES,
};
