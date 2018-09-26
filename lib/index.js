const isString = require('is-string');
const assert = (condition, msg = 'assertion failed') => {
  if (!condition) {
    throw new Error(msg);
  }
};

const normalize = require('./normalize');

class Rule {
  constructor(opts) {
    this.opts = opts;
    // Because optimizations and browsers may not preserve
    // instance.constructor.name.
    this.name = 'Rule';
  }
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

Rule.from = candidateRule => {
  if (candidateRule instanceof Rule) return candidateRule;
  let newRule;
  if (isString(candidateRule)) {
    newRule = new MapRule(mapFromString(candidateRule));
  } else if (isMap(candidateRule)) {
    newRule = new MapRule(candidateRule);
  } else if (isFunction(candidateRule)) {
    newRule = new FunctionRule(candidateRule);
  } else {
    throw new Error(`expected a String, Function, or Map: ${candidateRule}`);
  }
  return newRule;
};

class FunctionRule extends Rule {
  constructor(fn, opts = { modifiesCharacters: true }) {
    super(opts);
    this.fn = fn;
    this.name = 'FunctionRule';
  }

  apply(s1, s2) {
    return this.fn(s1, s2);
  }
}

// TODO: ideally, MapRule would mixin Map.
class MapRule extends Rule {
  constructor(map, opts = { modifiesCharacters: false }) {
    super(opts);
    assert(map instanceof Map);
    this.map = map;
    this.name = 'MapRule';
  }

  apply() {
    throw new Error('MapRules cannot be directly applied.');
  }

  entries() {
    return this.map.entries();
  }

  keys() {
    return this.map.keys();
  }
}

const capitalization = (s1, s2) => {
  return [s1.toLowerCase(), s2.toLowerCase()];
};
const capitalizationRule = new FunctionRule(capitalization);

const unicodeNormalization = (s1, s2) => {
  return [normalize(s1, 'NFC'), normalize(s2, 'NFC')];
};
const unicodeNormalizationRule = new FunctionRule(unicodeNormalization);

const RE_WHITESPACE = /[\s]+/g;
const whitespaceDifferences = (s1, s2) => {
  return [s1.replace(RE_WHITESPACE, ' '), s2.replace(RE_WHITESPACE, ' ')];
};
const whitespaceDifferencesRule = new FunctionRule(whitespaceDifferences);

// TODO: Could generalize to diacritics, i.e., Unicode category "nonspacing
// mark" (see http://www.fileformat.info/info/unicode/category/Mn/list.htm)
const combiningAccents = ['\u0300', '\u0301', '\u0302'];

// FIXME: use in `match`.
function replaceAll(str, char, replacement = '') {
  let _str;
  do {
    _str = str;
    str = str.replace(char, replacement);
  } while (str != _str);
  return str;
}

const accentsRule = new FunctionRule((s1, s2) => {
  let s1prime = normalize(s1, 'NFD');
  let s2prime = normalize(s2, 'NFD');

  combiningAccents.forEach(c => {
    s1prime = replaceAll(s1prime, c);
    s2prime = replaceAll(s2prime, c);
  });

  // FIXME: should be restored to whatever normalization they came in with.
  return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
});

const en = require('./en');
const enExport = Object.keys(en).reduce((accum, k) => {
  accum[k] = Rule.from(en[k]);
  return accum;
}, {});

const es = require('./es');
const esExport = Object.keys(es).reduce((accum, k) => {
  accum[k] = Rule.from(es[k]);
  return accum;
}, {});

module.exports = {
  assert: assert,
  Rule,
  MapRule,
  en: enExport,
  es: esExport,
  CAPITALIZATION: capitalizationRule,
  UNICODE_NORMALIZATION: unicodeNormalizationRule,
  WHITESPACE_DIFFERENCES: whitespaceDifferencesRule,
  ACCENTS: accentsRule,
};
