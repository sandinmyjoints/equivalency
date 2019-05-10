# Equivalency

## Focus on the differences that matter.

Equivalency lets you declaratively define rules for string equivalence. Can optionally return the edit distance between two transformed strings using the [damerau-levenshtein](https://www.npmjs.com/package/damerau-levenshtein) algorithm.

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
```

## Tests

[![BrowserStack Status](https://www.browserstack.com/automate/badge.svg?badge_key=b1pkZFN2ejJFVzFDZHhNeHUydk9HSlRxUUk1M1ZGRzZidDZKUU9NTksxdz0tLUI2MFRlazFhUW8rQU82MmxTMDdvNUE9PQ==--c1cd245939097acf9f1b9399a2db0661b6738e7d)](https://www.browserstack.com/automate/public-build/b1pkZFN2ejJFVzFDZHhNeHUydk9HSlRxUUk1M1ZGRzZidDZKUU9NTksxdz0tLUI2MFRlazFhUW8rQU82MmxTMDdvNUE9PQ==--c1cd245939097acf9f1b9399a2db0661b6738e7d)

## Release steps

See [the release doc](./docs/release.md).
