const { Rule, assert } = require('./lib');
const dl = require('damerau-levenshtein');

/**
 * A class to represent Equivalence.
 *
 */

class Equivalency {
  constructor() {
    this._rules = [];
    this.finalMap = null;
  }

  doesntMatter(_rule) {
    const rule = Rule.from(_rule);
    this._rules.push({ rule, type: 0 });
    return this;
  }

  matters(_rule) {
    const rule = Rule.from(_rule);
    this._rules.push({ rule, type: 1 });
    return this;
  }

  /**
   * Compares two strings for equivalence.
   *
   *
   * @param {string}        s1                              First comparison string
   * @param {string}        s2                              Second comparison string
   * @param {Object}        options                         Options hash
   * @param {bool}          options.calculateEditDistance   If true, return the editDistance of transformed strings with the isEquivalent boolean
   *
   * @return {Object} Returns an object with the following top-level
   *                  properties:
   *                  - isEquivalent
   *                  - editDistance (optional)
   */

  equivalent(s1, s2, options = null) {
    let s1prime = s1,
      s2prime = s2;

    // Collapse rules into finalMap and a set of functions.
    // TODO: track the rules so that matching can be attributed back to rules
    // that had an effect.
    this.finalMap = new Map();
    this.ruleFns = new Set();

    this._rules.forEach(({ rule, type }) => {
      // FIXME: do something more elegant than type 0 means doesnt matter, type
      // 1 means matters.
      assert(typeof type === 'number');
      assert(0 <= type && type <= 1);

      /* eslint-disable indent */
      switch (rule.name) {
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
          let ruleName;
          try {
            ruleName = rule.name || rule.constructor.name;
          } catch (ex) {
            ruleName = 'unknown name';
          }
          throw new Error(`Unknown rule type '${ruleName}'`);
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

    let isEquivalent = s1prime === s2prime;

    let results = { isEquivalent: isEquivalent };

    if (options && options.calculateEditDistance) {
      const editDistance = dl(s1prime, s2prime);
      results.editDistance = editDistance.steps;
    }

    return results;
  }

  rules() {
    return this._rules;
  }

  clone() {
    const clone = new Equivalency();
    clone._rules = this.rules().slice();
    return clone;
  }
}

Object.assign(Equivalency, require('./lib'));
Object.assign(Equivalency.prototype, require('./lib'));

const instance = new Equivalency();
instance.Equivalency = Equivalency;

module.exports = instance;
