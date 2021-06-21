require('string.fromcodepoint');
const inherits = require('inherits');
const isString = require('is-string');

const {
  mapFromString,
  isMap,
  isFunction,
  replaceAll,
  assert,
} = require('./helpers');
const normalize = require('./normalize');

/**
 * A class to represent a transform operation on strings.
 * @param {object} opts - Options hash.
 */
function Rule(opts) {
  this.opts = opts;
  // Because optimizations and browsers may not preserve
  // instance.constructor.name, we cannot rely on it for discovering type.
  this.type = 'Rule';
  this.name = opts.name || 'unnamed';
}

/**
 * Convenience method for creating a rule.
 * @param {Rule|string|Function} ((candidateRule)) - New rule.
 * @param {string} givenName - An optional name for the rule. If not
 * provided, it will be inferred.
 * @returns {Rule} The created rule.
 * @throws {Error} Thrown if `candidateRule` is something that it doesn't know
 * how to create a rule from.
 */
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

function FunctionRule(fn, opts = { modifiesCharacters: true }) {
  if (!opts.name) opts.name = fn.toString();
  Rule.call(this, opts);
  this.fn = fn;
  this.type = 'FunctionRule';
}
inherits(FunctionRule, Rule);

FunctionRule.prototype.apply = function(s1, s2) {
  return this.fn(s1, s2);
};

// TODO: ideally, MapRule would mixin Map.
function MapRule(map, opts = { modifiesCharacters: false }) {
  if (!opts.name) opts.name = map.toString();
  Rule.call(this, opts);
  assert(
    map instanceof Map,
    `${map} is not an instance of Map (is ${map.constructor})`
  );
  this.map = map;
  this.type = 'MapRule';
}
inherits(MapRule, Rule);

MapRule.prototype.apply = function() {
  throw new Error('MapRules cannot be directly applied.');
};

MapRule.prototype.entries = function() {
  return this.map.entries();
};

MapRule.prototype.keys = function() {
  return this.map.keys();
};

// Proxy to this.map for iteration.
MapRule.prototype[Symbol.iterator] = function() {
  return this.map.entries();
};

function RemoveRule(str, opts = { modifiesCharacters: false }) {
  assert(
    typeof str === 'string',
    `${str} is not a string (is ${str.constructor})`
  );
  const map = mapFromString(str);
  MapRule.call(this, map, opts);
  this.type = 'RemoveRule';
}
inherits(RemoveRule, MapRule);

// Define several general rules that may apply to strings from any language.

// Identity rule is a noop. It is always the last rule applied in every
// Equivalence instance.
const identity = (s1, s2) => [s1, s2];
const identityRule = new FunctionRule(identity, { name: 'identity' });

// Capitalization rule lowercases its inputs.
const capitalization = (s1, s2) => {
  return [s1.toLowerCase(), s2.toLowerCase()];
};
const capitalizationRule = new FunctionRule(capitalization, {
  name: 'capitalization',
});

// Unicode normalization rule transforms inputs to NFC form.
const unicodeNormalization = (s1, s2) => {
  return [normalize(s1, 'NFC'), normalize(s2, 'NFC')];
};
const unicodeNormalizationRule = new FunctionRule(unicodeNormalization, {
  name: 'unicodeNormalization',
});

// Whitespace differences rule transforms all sequences of whitespaces to a
// single SPACE.
const RE_ANY_WHITESPACE = /[\s]+/g;
const whitespaceDifferences = (s1, s2) => {
  return [
    s1.trim().replace(RE_ANY_WHITESPACE, ' '),
    s2.trim().replace(RE_ANY_WHITESPACE, ' '),
  ];
};
const whitespaceDifferencesRule = new FunctionRule(whitespaceDifferences, {
  name: 'whitespaceDifferences',
});

// The following rules transform various diacritical characters, particluar
// those that are relevant to English and Spanish words.
const acuteAccentCombining = '\u0301';
// Note that Unicode calls this "diaresis", see
// https://en.wikipedia.org/wiki/Diaeresis_(diacritic)
const umlautCombining = '\u0308';
const tildeCombining = '\u0303';

// https://www.fileformat.info/info/unicode/block/combining_diacritical_marks/list.htm
// U+0300–U+036F
const startOfCombiningDiacriticsBlock = 0x300;
const endOfCombiningDiacriticsBlock = 0x36f;

// Array.prototype.fill and String.prototype.repeat aren't available in IE 11.
const arr = [];
for (
  let count = 0;
  count < endOfCombiningDiacriticsBlock - startOfCombiningDiacriticsBlock;
  count++
) {
  arr.push(null);
}
const combiningDiacriticsBlock = arr.map((_, idx) =>
  String.fromCodePoint(idx + startOfCombiningDiacriticsBlock)
);

const commonCombiningDiacritics = [
  '\u0300', // grave accent
  acuteAccentCombining, // acute accent
  '\u0302', // circumflex
  tildeCombining, // tilde
  umlautCombining, // diaresis, aka umlaut
  '\u0327', // cedilla
];

// Generate a remove rule from a list of codepoints to be removed.
const codepointRuleGenerator = (codepoints, name) => {
  return new FunctionRule(
    (s1, s2) => {
      let s1prime = normalize(s1, 'NFD');
      let s2prime = normalize(s2, 'NFD');

      codepoints.forEach(c => {
        s1prime = replaceAll(s1prime, c);
        s2prime = replaceAll(s2prime, c);
      });

      // FIXME: should be restored to whatever normalization they came in with.
      return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
    },
    { name }
  );
};

const commonDiacriticsRule = codepointRuleGenerator(
  commonCombiningDiacritics,
  'common diacritics'
);

const acuteAccentRule = codepointRuleGenerator(
  [acuteAccentCombining],
  'acute accent'
);

const tildeRule = codepointRuleGenerator([tildeCombining], 'tilde');

const nTildeRule = new FunctionRule(
  (s1, s2) => {
    let s1prime = normalize(s1, 'NFD');
    let s2prime = normalize(s2, 'NFD');

    // ñ
    s1prime = replaceAll(s1prime, 'n\u0303', 'n');
    s2prime = replaceAll(s2prime, 'n\u0303', 'n');

    // Ñ
    s1prime = replaceAll(s1prime, 'N\u0303', 'N');
    s2prime = replaceAll(s2prime, 'N\u0303', 'N');

    return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
  },
  { name: 'ñ' }
);

const umlautRule = codepointRuleGenerator([umlautCombining], 'umlaut');

const combiningDiacriticsBlockExceptAcuteAndUmlautRule = codepointRuleGenerator(
  combiningDiacriticsBlock
    .filter(codepoint => codepoint !== acuteAccentCombining)
    .filter(codepoint => codepoint !== umlautCombining),
  'combining diacritics block except acute and umlaut'
);

const combiningDiacriticsBlockExceptAcuteAndUmlautAndTildeRule = codepointRuleGenerator(
  combiningDiacriticsBlock
    .filter(codepoint => codepoint !== acuteAccentCombining)
    .filter(codepoint => codepoint !== umlautCombining)
    .filter(codepoint => codepoint !== tildeCombining),
  'combining diacritics block except acute and umlaut and tilde'
);

const combiningDiacriticsBlockExceptAcuateAndUmlautAndNTilde = [
  ...combiningDiacriticsBlock
    .filter(codepoint => codepoint !== acuteAccentCombining)
    .filter(codepoint => codepoint !== umlautCombining)
    .filter(codepoint => codepoint !== tildeCombining),
];
const combiningDiacriticsBlockExceptAcuteAndUmlautRuleAndNTildeRe = new RegExp(
  `[${combiningDiacriticsBlockExceptAcuateAndUmlautAndNTilde.join('')}]`,
  'g'
);

const combiningDiacriticsBlockExceptAcuteAndUmlautAndNTildeRule = new FunctionRule(
  (s1, s2) => {
    let s1prime = normalize(s1, 'NFD');
    let s2prime = normalize(s2, 'NFD');

    s1prime = s1prime.replace(
      combiningDiacriticsBlockExceptAcuteAndUmlautRuleAndNTildeRe,
      ''
    );
    s2prime = s2prime.replace(
      combiningDiacriticsBlockExceptAcuteAndUmlautRuleAndNTildeRe,
      ''
    );

    // ã
    s1prime = replaceAll(s1prime, 'a\u0303', 'a');
    s2prime = replaceAll(s2prime, 'a\u0303', 'a');

    // Ã
    s1prime = replaceAll(s1prime, 'A\u0303', 'A');
    s2prime = replaceAll(s2prime, 'A\u0303', 'A');

    // õ
    s1prime = replaceAll(s1prime, 'o\u0303', 'o');
    s2prime = replaceAll(s2prime, 'o\u0303', 'o');

    // Õ
    s1prime = replaceAll(s1prime, 'O\u0303', 'O');
    s2prime = replaceAll(s2prime, 'O\u0303', 'O');

    return [normalize(s1prime, 'NFC'), normalize(s2prime, 'NFC')];
  },
  { name: 'combining diacritics block except acute and umlaut and n tilde' }
);

// Generate a remove rule for an arbitrary prefix string.
const wordPrefixRuleCreator = word =>
  new FunctionRule(
    (s1, s2) => {
      const regexp = new RegExp(`^${word}\\s+`);
      return [s1.replace(regexp, ''), s2.replace(regexp, '')];
    },
    { name: `wordPrefixRule '${word}'` }
  );

// Target and test are equivalent if both strings are equivalent without the hyphens.
// If the rule is not set to bidirectional, the strings are equivalent if the target
// string replaced hyphens with spaces is equal to the original test string.
//
// In the unidirectional case, "brother-in-law" is equivalent to "brother in law"
// but "brother in law" is not equivalent to "brother-in-law"
const hyphensOmittedOrReplacedWithSpaces = (bidirectional = true) =>
  new FunctionRule(
    (target, test) => {
      const re = /\s*-\s*/g;

      // If both strings are equal without hyphens, they are considered equal.
      const targetWithoutHyphens = target.replace(re, '');
      const testWithoutHyphens = test.replace(re, '');
      if (targetWithoutHyphens === testWithoutHyphens) {
        return [targetWithoutHyphens, testWithoutHyphens];
      }

      // We also want to accept spaces in `test` in place of hyphens in `target`.
      const targetWithSpacesInsteadOfHyphens = target.replace(re, ' ');
      const testWithSpacesInsteadOfHyphens = test.replace(re, ' ');

      return [
        targetWithSpacesInsteadOfHyphens,
        bidirectional ? testWithSpacesInsteadOfHyphens : test,
      ];
    },
    {
      name: 'hyphens omitted or replaced with spaces',
    }
  );

module.exports = {
  assert,
  Rule,
  MapRule,
  FunctionRule,
  RemoveRule,
  identityRule,
  CAPITALIZATION: capitalizationRule,
  UNICODE_NORMALIZATION: unicodeNormalizationRule,
  WHITESPACE_DIFFERENCES: whitespaceDifferencesRule,
  COMMON_DIACRITICS: commonDiacriticsRule,
  ACUTE_ACCENT: acuteAccentRule,
  N_TILDE: nTildeRule,
  TILDE: tildeRule,
  UMLAUT: umlautRule,
  COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT: combiningDiacriticsBlockExceptAcuteAndUmlautRule,
  COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT_AND_TILDE: combiningDiacriticsBlockExceptAcuteAndUmlautAndTildeRule,
  COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT_AND_NTILDE: combiningDiacriticsBlockExceptAcuteAndUmlautAndNTildeRule,
  wordPrefix: wordPrefixRuleCreator,
  HYPHENS_OMITTED_OR_REPLACED_WITH_SPACES: hyphensOmittedOrReplacedWithSpaces(
    false
  ),
  HYPHENS_OMITTED_OR_REPLACED_WITH_SPACES_BOTH: hyphensOmittedOrReplacedWithSpaces(),
};
