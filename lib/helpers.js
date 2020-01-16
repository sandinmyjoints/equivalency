const assert = (condition, msg = 'assertion failed') => {
  if (!condition) {
    throw new Error(msg);
  }
};

// FIXME: use in `match`.
function replaceAll(str, char, replacement = '') {
  let _str;
  do {
    _str = str;
    str = str.replace(char, replacement);
  } while (str != _str);
  return str;
}

function isMap(obj) {
  return obj instanceof Map;
}

function isFunction(obj) {
  return typeof obj === 'function';
}

function mapFromString(s) {
  const iterable = s.split('').map(c => [c, '']);
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
  isMap,
  isFunction,
  mapFromString,
  powerSet,
};
