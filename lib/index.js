const isString = require('is-string');
const assert = require('assert');

class Rule {
  constructor(opts) {
    this.opts = opts;
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
  }

  apply(s1, s2) {
    return this.fn(s1, s2);
  }
}

class MapRule extends Rule {
  constructor(map, opts = { modifiesCharacters: false }) {
    super(opts);
    assert(map instanceof Map);
    this.map = map;
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
  return [s1.normalize('NFC'), s2.normalize('NFC')];
};
const unicodeNormalizationRule = new FunctionRule(unicodeNormalization);

const RE_WHITESPACE = /[\s]+/g;
const whitespaceDifferences = (s1, s2) => {
  return [s1.replace(RE_WHITESPACE, ' '), s2.replace(RE_WHITESPACE, ' ')];
};
const whitespaceDifferencesRule = new FunctionRule(whitespaceDifferences);

const en = require('./en');
Object.keys(en).forEach(k => (en[k] = Rule.from(en[k])));

const es = require('./es');
Object.keys(es).forEach(k => (es[k] = Rule.from(es[k])));

module.exports = {
  Rule,
  MapRule,
  en,
  es,
  CAPITALIZATION: capitalizationRule,
  UNICODE_NORMALIZATION: unicodeNormalizationRule,
  WHITESPACE_DIFFERENCES: whitespaceDifferencesRule,
};
