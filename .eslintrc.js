module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    'jest/globals': true,
    mocha: true,
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:jest/recommended'],
  rules: {
    indent: ['error', 2],
    'linebreak-style': ['error', 'unix'],
    semi: ['error', 'always'],
    'inclusive-language/use-inclusive-words': [
      'error',
      {
        lintStrings: true
      }
    ] 
  },
  plugins: ['prettier', 'jest', 'inclusive-language'],
};
