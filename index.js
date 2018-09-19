const assert = require('assert');
const { Rule, MapRule } = require('./lib');

class Rubric {
  constructor() {
    this.rules = [];
    this.finalMap = null;
  }

  doesntMatter(_rule) {
    const rule = Rule.from(_rule);
    this.rules.push({ rule, type: 0 });
    return this;
  }

  matters(_rule) {
    const rule = Rule.from(_rule);
    this.rules.push({ rule, type: 1 });
    return this;
  }

  match(s1, s2) {
    // TODO: collapse rules and antirules into one map
    let s1prime = s1,
      s2prime = s2;

    // collapse rules into finalMap
    this.finalMap = new Map();
    this.ruleFns = new Set();
    this.rules.forEach(({ rule, type }) => {
      assert(rule instanceof Rule);
      assert(typeof type === 'number');
      assert(0 <= type <= 1);

      /* eslint-disable indent */
      switch (rule.constructor.name) {
        case 'MapRule': {
          if (type === 0) {
            this.finalMap = new Map([
              ...this.finalMap.entries(),
              ...rule.entries(),
            ]);
          } else if (type === 1) {
            Array.from(rule.keys()).forEach(key => {
              this.finalMap.delete(key);
            });
          }
          break;
        }
        case 'FunctionRule': {
          if (type === 0) {
            this.ruleFns.add(rule);
          } else if (type === 1) {
            this.ruleFns.remove(rule);
          }
          break;
        }
        default: {
          throw new Error(`Unknown rule type ${rule.constructor.name}`);
        }
      }
      /* eslint-enable indent */
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

    // apply rule functions
    this.ruleFns.forEach(functionRule => {
      [s1prime, s2prime] = functionRule.apply(s1prime, s2prime);
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
