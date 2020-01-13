const combinatorics = require('js-combinatorics');
const { Rule, identityRule } = require('./lib');
const dl = require('damerau-levenshtein');

/**
 * A class to represent Equivalence.
 *
 */

class Equivalency {
  constructor() {
    // Holds one object per rule, consisting of the rule and whether or not it
    // matters.
    this._ruleList = [];
  }

  doesntMatter(_rule) {
    this._ruleList.push({ rule: Rule.from(_rule), matters: false });
    return this;
  }

  matters(_rule) {
    this._ruleList.push({ rule: Rule.from(_rule), matters: true });
    return this;
  }

  _collapseRules(rules) {
    // identity is always the final rule.
    if (rules.length === 0 || rules[rules.length - 1].rule !== identityRule) {
      rules.push({ rule: identityRule, matters: true });
    }

    // Collapse rules into finalMap and a set of functions.
    let collapsedMap = new Map();
    let ruleFns = new Set();

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
            Array.from(rule.keys()).forEach(key => {
              collapsedMap.delete(key);
            });
          }
          break;
        }
        case 'FunctionRule': {
          if (!matters) {
            ruleFns.add(rule);
          } else if (matters) {
            ruleFns.delete(rule);
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
  }

  _compareWithRules(s1, s2, map, ruleFns) {
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
  }

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

  equivalent(s1, s2, options = null) {
    // Ensure identity is the final and only the final rlue.
    if (
      this._ruleList.length === 0 ||
      this._ruleList[this._ruleList.length - 1].rule !== identityRule
    )
      this._ruleList.push({ rule: identityRule, matters: true });

    const [finalMap, ruleFns] = this._collapseRules(this._ruleList);

    const { isEquivalent, s1prime, s2prime } = this._compareWithRules(
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
        const reasons = new Set();
        const indices = new Set();

        // First, make all the matters rules doesntMatter. If it still fails,
        // then push identity and we're done.
        const indexesOfRulesThatMatter = this._ruleList
          .map((r, idx) => idx)
          .filter(idx => this._ruleList[idx].matters);

        const allDoesntMatterRules = this._ruleList.map((rule, idx) => {
          if (
            indexesOfRulesThatMatter.includes(idx) &&
            rule.rule !== identityRule
          ) {
            rule.matters = false;
          }
          return rule;
        });
        const [finalMap, ruleFns] = this._collapseRules(allDoesntMatterRules);
        const { isEquivalent } = this._compareWithRules(
          s1,
          s2,
          finalMap,
          ruleFns
        );
        if (!isEquivalent) {
          reasons.add(identityRule);
        }

        // restore
        this._ruleList.forEach((rule, idx) => {
          if (
            indexesOfRulesThatMatter.includes(idx) &&
            rule.rule !== identityRule
          ) {
            rule.matters = true;
          }
        });

        if (reasons.size !== 1) {
          // If it passed, then one or more of the matters rules are why it is
          // failing, so find out which one(s).

          // TODO: Do all singles ones first, then for the combinations, only do
          // them if all of them are not in the set yet, meaning that the
          // combination of them is what has an effect.
          // OR, record the combination itself instead of both of the rules inside of the combination?
          const combinations = combinatorics
            .permutationCombination(indexesOfRulesThatMatter)
            .toArray();

          // Can't use filter here b/c we need the index into this._rules.
          combinations.forEach(indexesOfRulesUnderTest => {
            for (const idx of indexesOfRulesThatMatter) {
              if (Array.from(indices).includes(idx)) {
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
            const [finalMap, ruleFns] = this._collapseRules(rulesSwitched);
            const { isEquivalent } = this._compareWithRules(
              s1,
              s2,
              finalMap,
              ruleFns
            );

            if (isEquivalent && indexesOfRulesUnderTest.length === 1) {
              indexesOfRulesUnderTest.forEach(idxOfRuleUnderTest => {
                if (
                  rulesSwitched[idxOfRuleUnderTest].rule.name === 'identity'
                ) {
                  indices.add(idxOfRuleUnderTest);
                  reasons.add(rulesSwitched[idxOfRuleUnderTest].rule);
                }
              });
            }
            if (isEquivalent) {
              indexesOfRulesUnderTest.forEach(idxOfRuleUnderTest => {
                indices.add(idxOfRuleUnderTest);
                reasons.add(rulesSwitched[idxOfRuleUnderTest].rule);
              });
            }
            // Restore.
            indexesOfRulesUnderTest.forEach(
              indexOfRuleUnderTest =>
                (rulesSwitched[indexOfRuleUnderTest].matters = true)
            );
          });
        }

        results.reasons = Array.from(reasons).map(rule => {
          return {
            name: rule.name,
          };
        });
      }
    }

    return results;
  }

  rules() {
    return this._ruleList;
  }

  clone() {
    const clone = new Equivalency();
    clone._ruleList = this.rules().slice();
    return clone;
  }
}

Object.assign(Equivalency, require('./lib'));
Object.assign(Equivalency.prototype, require('./lib'));

const instance = new Equivalency();
instance.Equivalency = Equivalency;

module.exports = instance;
