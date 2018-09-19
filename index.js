const assert = require('assert');
const isString = require('is-string');

function isMap(obj) {
  return obj instanceof Map;
}

function mapFromString(s) {
  const iterable = Array.from(s).map(c => [c, '']);
  return new Map(iterable);
}

class Rubric {
  constructor() {
    this.rules = [];
    this.finalMap = null;
  }

  _mapFromRule(rule) {
    let map;
    if (isString(rule)) {
      map = mapFromString(rule);
    } else if (isMap(rule)) {
      map = rule;
    } else {
      throw new Error('need string or Map');
    }
    return map;
  }

  doesntMatter(rule) {
    const map = this._mapFromRule(rule);
    map.type = 0;
    this.rules.push(map);
    return this;
  }

  matters(rule) {
    const map = this._mapFromRule(rule);
    map.type = 1;
    this.rules.push(map);
    return this;
  }

  match(s1, s2) {
    // TODO: collapse rules and antirules into one map
    let s1prime = s1,
      s2prime = s2;

    // collapse rules into finalMap
    this.finalMap = new Map();
    this.rules.forEach(rule => {
      assert(rule instanceof Map);
      assert(typeof rule.type === 'number');

      if (rule.type === 0) {
        this.finalMap = new Map([
          ...this.finalMap.entries(),
          ...rule.entries(),
        ]);
      } else if (rule.type === 1) {
        Array.from(rule.keys()).forEach(key => {
          this.finalMap.delete(key);
        });
      }
    });

    // apply finalMap
    this.finalMap.forEach((v, k) => {
      let _s1prime;
      do {
        _s1prime = s1prime;
        s1prime = _s1prime.replace(k, v);
      } while (_s1prime != s1prime);

      let _s2prime;
      do {
        _s2prime = s2prime;
        s2prime = _s2prime.replace(k, v);
      } while (_s2prime != s2prime);
    });

    let isMatch = s1prime === s2prime;
    return { isMatch: isMatch };
  }

  rules() {
    return this.rules;
  }
}

Object.assign(Rubric, require('./lib'));

const instance = new Rubric();
instance.Rubric = Rubric;

module.exports = instance;
