# Equivalency

## Focus on the differences that matter.

Equivalency lets you declaratively define rules for string equivalence.

## Usage

```js
const checker = require('equivalency')
const { Equivalency } = checker

// Default rule is byte-equality.
checker.equivalent('a', 'a')
// { isEquivalent: true }

checker.equivalent('a', 'A')
// { isEquivalent: false }

// Specify which differences matter/don't matter.
checker.doesntMatter(Equivalency.CAPITALIZATION)
checker.equivalent('a', 'A')
// { isEquivalent: true }

checker.equivalent('Hot-dog', 'hotdog')
// { isEquivalent: false }

checker.doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
checker.equivalent('Hot-dog', 'hotdog')
// { isEquivalent: true }

checker.equivalent('Go away, fly!', 'Go away; fly!')
// { isEquivalent: true }

checker.matters(',;')
checker.equivalent('Go away, fly!', 'Go away; fly!')
// { isEquivalent: false }

const esChecker = new Equivalency()
esChecker.equivalent('adiós', 'adios')
// { isEquivalent: false }

const enChecker = new Equivalency()
enChecker.doesntMatter(Equivalency.ACCENTS)
enChecker.equivalent('adiós', 'adios')
// { isEquivalent: true }
```
