const isString = require('is-string');

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
  } else if (
    isFunction(candidateRule) ||
    candidateRule.name === 'FunctionRule'
  ) {
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

module.exports = {
  assert,
  replaceAll,
  Rule,
  FunctionRule,
  MapRule,
};
