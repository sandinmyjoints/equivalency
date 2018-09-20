# Equivalency

Declaratively define rules for string equivalence.

## Usage

```js
equivalency = require('equivalency')

equivalency.match('a', 'a')
{ isEquivalent: true }

equivalency.match('a', 'A')
{ isEquivalent: false }

equivalency.doesntMatter(equivalency.CAPITALIZATION)

equivalency.match('a', 'A')
{ isEquivalent: true }

equivalency.match('Hot-dog', 'hotdog')
{ isEquivalent: false }

equivalency.doesntMatter(equivalency.en.COMMON_PUNCTUATION)
equivalency.match('Hot-dog', 'hotdog')
{ isEquivalent: true }

equivalency.match('Go away, fly!', 'Go away; fly!')
{ isEquivalent: true }

equivalency.matters(',;')

equivalency.match('Go away, fly!', 'Go away; fly!')
{ isEquivalent: false }
```
