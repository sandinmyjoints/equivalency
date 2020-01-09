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

class Rule {
  constructor(opts) {
    this.opts = opts;
    // Because optimizations and browsers may not preserve
    // instance.constructor.name, we cannot rely on it for discovering type.
    this.type = 'Rule';
    this.name = opts.name || 'unnamed';
  }
}

Rule.from = (candidateRule, givenName) => {
  if (candidateRule instanceof Rule || /Rule/.test(candidateRule.type))
    return candidateRule;
  let name;
  if (givenName) {
    name = givenName;
  } else if (candidateRule.name) {
    name = candidateRule.name;
  } else if (typeof candidateRule === 'string') {
    name = candidateRule;
  }

  let newRule;
  if (isString(candidateRule)) {
    newRule = new MapRule(mapFromString(candidateRule), { name });
  } else if (isMap(candidateRule)) {
    newRule = new MapRule(candidateRule, { name });
  } else if (isFunction(candidateRule)) {
    newRule = new FunctionRule(candidateRule, { name });
  } else {
    throw new Error(`expected a String, Function, or Map: ${candidateRule}`);
  }
  return newRule;
};

class FunctionRule extends Rule {
  constructor(fn, opts = { modifiesCharacters: true }) {
    if (!opts.name) opts.name = fn.toString();
    super(opts);
    this.fn = fn;
    this.type = 'FunctionRule';
  }

  apply(s1, s2) {
    return this.fn(s1, s2);
  }
}

// TODO: ideally, MapRule would mixin Map.
class MapRule extends Rule {
  constructor(map, opts = { modifiesCharacters: false }) {
    if (!opts.name) opts.name = map.toString();
    super(opts);
    assert(
      map instanceof Map,
      `${map} is not an instance of Map (is ${map.constructor})`
    );
    this.map = map;
    this.type = 'MapRule';
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

class RemoveRule extends MapRule {
  constructor(str, opts = { modifiesCharacters: false }) {
    assert(
      typeof str === 'string',
      `${str} is not a string (is ${str.constructor})`
    );
    const map = mapFromString(str);
    super(map, opts);
  }
}

module.exports = {
  assert,
  replaceAll,
  Rule,
  FunctionRule,
  MapRule,
  RemoveRule,
};
