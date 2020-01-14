# Equivalency

## Focus on the differences that matter.

Equivalency lets you declaratively define rules for string equivalence.

- Several useful rules are provided out of the box, for example, Unicode
  normalization, capitalization, common puncutation and diacritical marks.
- Custom rules can be created using plain strings, regexes, or functions.
- Comparing two strings via an equivalency returns whether the two strings are
  equivalent according to that equivalency's ruleset, and can optionally
  return
  - the edit distance between the two fully transformed strings using the
  [damerau-levenshtein](https://www.npmjs.com/package/damerau-levenshtein)
  algorithm
  - reasons why the strings differ
- Equivalency instances can be cloned, making it easy to start with a root
  equivalency that takes care of universal concerns like Unicode
  normalization, then derive more specific equivlancies that are tailored to
  specific cases, like case- or punctuation-sensitivity.

## Usage

```js
const checker = require('equivalency');
const { Equivalency } = checker;

// Default rule is byte-equality.
checker.equivalent('a', 'a');
// { isEquivalent: true }

checker.equivalent('a', 'A');
// { isEquivalent: false }

// Specify which differences matter/don't matter.
checker.doesntMatter(Equivalency.CAPITALIZATION);
checker.equivalent('a', 'A');
// { isEquivalent: true }

checker.equivalent('Hot-dog', 'hotdog');
// { isEquivalent: false }

checker.doesntMatter(Equivalency.en.COMMON_PUNCTUATION);
checker.equivalent('Hot-dog', 'hotdog');
// { isEquivalent: true }

checker.equivalent('Go away, fly!', 'Go away; fly!');
// { isEquivalent: true }

checker.matters(',;');
checker.equivalent('Go away, fly!', 'Go away; fly!');
// { isEquivalent: false }

// Return edit distance
const options = { calculateEditDistance: true };
checker.equivalent('show', 'shoe', options);
// { isEquivalent: false, editDistance: 1 }

const esChecker = new Equivalency();
esChecker.equivalent('adiós', 'adios');
// { isEquivalent: false }

const enChecker = new Equivalency();
enChecker.doesntMatter(Equivalency.ACCENTS);
enChecker.equivalent('adiós', 'adios');
// { isEquivalent: true }

// Root equivalency: normalizes Unicode, whitespace differences, and case.
const root = new Equivalency()
  .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
  .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
  .doesntMatter(Equivalency.CAPITALIZATION)

// Diacritic-blind equivalency cloned from root equivalency.
const equivalencyForDiacriticWarning = root
  .clone()
  .doesntMatter(Equivalency.COMMON_DIACRITICS);

const isMatch = root.equivalent(
  providedAnswer,
  expectedAnswer
).isEquivalent;

const isMatchExceptForDiacritics = equivalencyForDiacriticWarning.equivalent(
  providedAnswer,
  expectedAnswer
).isEquivalent;
```

## Tests

[![BrowserStack
Status](https://www.browserstack.com/automate/badge.svg?badge_key=b1pkZFN2ejJFVzFDZHhNeHUydk9HSlRxUUk1M1ZGRzZidDZKUU9NTksxdz0tLUI2MFRlazFhUW8rQU82MmxTMDdvNUE9PQ==--c1cd245939097acf9f1b9399a2db0661b6738e7d)](https://www.browserstack.com/automate/public-build/b1pkZFN2ejJFVzFDZHhNeHUydk9HSlRxUUk1M1ZGRzZidDZKUU9NTksxdz0tLUI2MFRlazFhUW8rQU82MmxTMDdvNUE9PQ==--c1cd245939097acf9f1b9399a2db0661b6738e7d)

### Running tests

- local: `yarn test`
- Browserstack (for browser compatability, particular IE 11): `BROWSER_STACK_ACCESS_KEY=<key> yarn run test:karma`

## Release steps

See [the release doc](./docs/release.md).
