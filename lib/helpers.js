const memoize = require('memoizerific');

const assert = (condition, msg = 'assertion failed') => {
  if (!condition) {
    throw new Error(msg);
  }
};

// FIXME: use in `match`.
/**
 * Replace all occurences of replacee in str.
 * @param {string} str
 * @param {string} replacee
 * @param {string} replacement
 * @returns {string}
 */
function replaceAll(str, replacee, replacement = '') {
  let _str;
  do {
    _str = str;
    str = str.replace(replacee, replacement);
  } while (str !== _str);
  return str;
}

/**
 * Replace all occurences of codepoints in str.
 * @param {string} str
 * @param {string[]} codepoints
 * @param {string} replacement
 * @returns {string}
 */
function replaceAllCodepoints(str, codepoints, replacement = '') {
  const re = new RegExp(`[${codepoints.join('')}]`, 'g');
  return str.replace(re, replacement);
}

function isMap(obj) {
  return obj instanceof Map;
}

function isFunction(obj) {
  return typeof obj === 'function';
}

function mapFromString(s, mapTo= '') {
  const iterable = s.split('').map(c => [c, mapTo]);
  return new Map(iterable);
}

function powerSet(seq) {
  // Older browsers lack the exponent operator: const size = 2 ** seq.length;
  const size = seq.reduce(accum => accum * 2, 1);
  const _powerSet = [];
  for (let counter = 0; counter < size; counter++) {
    let subset = [];
    for (let i = 0; i < seq.length; i++) {
      // If ith bit in counter is set, add seq[i] to this subset.
      const mask = seq.slice(0, i).reduce(accum => accum * 2, 1);
      if (counter & mask) subset.push(seq[i]);
    }
    _powerSet.push(subset);
  }
  return _powerSet;
}

module.exports = {
  assert,
  replaceAll,
  replaceAllCodepoints,
  isMap,
  isFunction,
  mapFromString,
  powerSet: memoize(1000)(powerSet),
};
