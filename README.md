# Rubric

Declaratively define rules for string equivalence.

## Usage

```js
rubric = require('.')

rubric.match('a', 'a')
{ isMatch: true }

rubric.match('a', 'A')
{ isMatch: false }

rubric.doesntMatter(rubric.CAPITALIZATION)

rubric.match('a', 'A')
{ isMatch: true }

rubric.match('Hot-dog', 'hotdog')
{ isMatch: false }

rubric.doesntMatter(rubric.en.COMMON_PUNCTUATION)
rubric.match('Hot-dog', 'hotdog')
{ isMatch: true }

rubric.match('Go away, fly!', 'Go away; fly!')
{ isMatch: true }

rubric.matters(',;')

rubric.match('Go away, fly!', 'Go away; fly!')
{ isMatch: false }
```
