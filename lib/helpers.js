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
  const iterable = Array.from(s).map(c => [c, '']);
  return new Map(iterable);
}

module.exports = {
  assert,
  replaceAll,
  isMap,
  isFunction,
  mapFromString,
};
