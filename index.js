require('es6-symbol/implement');
Array.from = require('array-from');
const Map = require('es6-map');
const dl = require('damerau-levenshtein');
const { Rule, identityRule } = require('./lib');
const { powerSet } = require('./lib/helpers');

/**
 * A class to represent Equivalence.
 *
 */

function Equivalency() {
  // Holds one object per rule, consisting of the rule and whether or not it
  // matters.
  this._ruleList = [];
}

Equivalency.prototype.doesntMatter = function(_rule) {
  this._ruleList.push({ rule: Rule.from(_rule), matters: false });
  return this;
};

Equivalency.prototype.matters = function(_rule) {
  this._ruleList.push({ rule: Rule.from(_rule), matters: true });
  return this;
};

Equivalency._collapseRules = function(rules) {
  // identity is always the final rule.
  if (rules.length === 0 || rules[rules.length - 1].rule !== identityRule) {
    rules.push({ rule: identityRule, matters: true });
  }

  // Collapse rules into finalMap and a set of functions.
  let collapsedMap = new Map();
  let ruleFns = [];

  rules.forEach(({ rule, matters }) => {
    /* eslint-disable indent */
    switch (rule.type) {
      case 'MapRule': {
        if (!matters) {
          collapsedMap = new Map([
            ...collapsedMap.entries(),
            ...rule.entries(),
          ]);
        } else if (matters) {
          for (const key of rule.keys()) {
            collapsedMap.delete(key);
          }
        }
        break;
      }
      case 'FunctionRule': {
        if (!matters) {
          if (ruleFns.indexOf(rule) === -1) ruleFns.push(rule);
        } else if (matters) {
          if (ruleFns.indexOf(rule) >= -1)
            ruleFns = ruleFns.filter(r => r !== rule);
        }
        break;
      }
      default: {
        let ruleType;
        try {
          ruleType = rule.type || rule.constructor.type;
        } catch (ex) {
          ruleType = 'unknown type';
        }
        throw new Error(`Unknown rule type '${ruleType}'`);
      }
    }
    /* eslint-enable indent */
  });
  return [collapsedMap, ruleFns];
};

Equivalency._compareWithRules = function(s1, s2, map, ruleFns) {
  let s1prime = s1,
    s2prime = s2;

  // apply finalMap
  map.forEach((v, k) => {
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
  ruleFns.forEach(functionRule => {
    [s1prime, s2prime] = functionRule.apply(s1prime, s2prime);
  });

  return { isEquivalent: s1prime === s2prime, s1prime, s2prime };
};

/**
 * Compares two strings for equivalence.
 *
 *
 * @param {string}        s1                              First comparison string
 * @param {string}        s2                              Second comparison string
 * @param {Object}        options                         Options hash
 * @param {bool}          options.calculateEditDistance   If true, return the editDistance of transformed strings with the isEquivalent boolean
 * @param {bool}          options.giveReasons             When true, include the reason(s) why the strings aren't equivalent.
 *
 * @return {Object} Returns an object with the following top-level
 *                  properties:
 *                  - isEquivalent
 *                  - editDistance (optional)
 *                  - reasons[] (optional)
 */

Equivalency.prototype.equivalent = function(s1, s2, options = null) {
  // Ensure identity is the final and only the final rlue.
  if (
    this._ruleList.length === 0 ||
    this._ruleList[this._ruleList.length - 1].rule !== identityRule
  )
    this._ruleList.push({ rule: identityRule, matters: true });

  const [finalMap, ruleFns] = Equivalency._collapseRules(this._ruleList);

  const { isEquivalent, s1prime, s2prime } = Equivalency._compareWithRules(
    s1,
    s2,
    finalMap,
    ruleFns
  );
  let results = { isEquivalent: isEquivalent };

  if (options && options.calculateEditDistance) {
    const editDistance = dl(s1prime, s2prime);
    results.editDistance = editDistance.steps;
  }

  if (options && options.giveReasons) {
    if (isEquivalent) {
      results.reasons = [];
    } else {
      const reasons = [];
      const indices = [];

      // First, make all the matters rules doesntMatter. If it still fails,
      // then push identity and we're done.
      const indexesOfRulesThatMatter = this._ruleList
        .map((r, idx) => idx)
        .filter(idx => this._ruleList[idx].matters);

      const allDoesntMatterRules = this._ruleList.map((rule, idx) => {
        if (
          indexesOfRulesThatMatter.indexOf(idx) > -1 &&
          rule.rule !== identityRule
        ) {
          rule.matters = false;
        }
        return rule;
      });
      const [finalMap, ruleFns] = Equivalency._collapseRules(
        allDoesntMatterRules
      );
      const { isEquivalent } = Equivalency._compareWithRules(
        s1,
        s2,
        finalMap,
        ruleFns
      );
      if (!isEquivalent) {
        reasons.push(identityRule);
      }

      // restore
      this._ruleList.forEach((rule, idx) => {
        if (
          indexesOfRulesThatMatter.indexOf(idx) > -1 &&
          rule.rule !== identityRule
        ) {
          rule.matters = true;
        }
      });

      if (reasons.length !== 1) {
        // If identity wasn't the cause of the inequivalence, then one or more
        // of the matters rules are the cause, so find out which one(s).

        // TODO: Do all singles ones first, then for the combinations, only do
        // them if all of them are not in the set yet, meaning that the
        // combination of them is what has an effect.
        // OR, record the combination itself instead of both of the rules inside of the combination?
        const _powerSet = powerSet(indexesOfRulesThatMatter);

        // Can't use filter here b/c we need the index into this._rules.
        _powerSet.forEach(indexesOfRulesUnderTest => {
          for (const idx of indexesOfRulesThatMatter) {
            if (indices.indexOf(idx) > -1) {
              return;
            }
          }
          // TODO: short-circuit if any of the rules in indexOfRuleUnderTest are
          // already in reasons? The ones that matter by themselves, the ones
          // that matter only in combination with others.
          const rulesSwitched = this._ruleList.slice();

          // Switch and test.
          indexesOfRulesUnderTest.forEach(
            indexOfRuleUnderTest =>
              (rulesSwitched[indexOfRuleUnderTest].matters = false)
          );
          const [finalMap, ruleFns] = Equivalency._collapseRules(rulesSwitched);
          const { isEquivalent } = Equivalency._compareWithRules(
            s1,
            s2,
            finalMap,
            ruleFns
          );

          if (isEquivalent && indexesOfRulesUnderTest.length === 1) {
            indexesOfRulesUnderTest.forEach(idxOfRuleUnderTest => {
              if (rulesSwitched[idxOfRuleUnderTest].rule.name === 'identity') {
                indices.push(idxOfRuleUnderTest);
                reasons.push(rulesSwitched[idxOfRuleUnderTest].rule);
              }
            });
          }
          if (isEquivalent) {
            indexesOfRulesUnderTest.forEach(idxOfRuleUnderTest => {
              indices.push(idxOfRuleUnderTest);
              reasons.push(rulesSwitched[idxOfRuleUnderTest].rule);
            });
          }
          // Restore.
          indexesOfRulesUnderTest.forEach(
            indexOfRuleUnderTest =>
              (rulesSwitched[indexOfRuleUnderTest].matters = true)
          );
        });
      }

      results.reasons = reasons.map(rule => {
        return {
          name: rule.name,
        };
      });
    }
  }

  return results;
};

Equivalency.prototype.rules = function() {
  return this._ruleList;
};

Equivalency.prototype.clone = function() {
  const clone = new Equivalency();
  clone._ruleList = this.rules().slice();
  return clone;
};

const lib = require('./lib');
for (let prop in lib) {
  if (Object.prototype.hasOwnProperty.call(lib, prop)) {
    Equivalency[prop] = lib[prop];
  }
}
for (let prop in lib) {
  if (Object.prototype.hasOwnProperty.call(lib, prop)) {
    Equivalency.prototype[prop] = lib[prop];
  }
}

const instance = new Equivalency();
instance.Equivalency = Equivalency;

module.exports = instance;
