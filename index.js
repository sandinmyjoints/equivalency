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

  doesntMatter(rule) {
    let map;
    if (isString(rule)) {
      map = mapFromString(rule);
    } else if (isMap(rule)) {
      map = rule;
    } else {
      throw new Error('need string or Map');
    }

    this.rules.push(map);

    return this;
  }

  matters() {
    return this;
  }

  match(s1, s2) {
    let s1prime = s1,
      s2prime = s2;

    this.rules.forEach(rule => {
      assert(rule instanceof Map);
      rule.forEach((v, k) => {
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
