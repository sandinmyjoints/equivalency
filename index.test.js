const expect = require('expect');
const equivalency = require('./index');
const { Equivalency } = equivalency;
const { MapRule } = require('./lib');

describe('default instance', () => {
  it('should be an instance of Equivalency', () => {
    expect(equivalency).toBeInstanceOf(Equivalency);
  });
});

describe('Equivalency statics', () => {
  describe('language builtins', () => {
    it('should have en builtins', () => {
      expect(Equivalency.en).toEqual(
        expect.objectContaining({
          COMMON_PUNCTUATION: expect.any(MapRule),
          COMMON_SYMBOLS: expect.any(MapRule),
        })
      );
    });

    it('should have es builtins', () => {
      expect(Equivalency.es).toEqual(
        expect.objectContaining({
          COMMON_PUNCTUATION: expect.any(MapRule),
          COMMON_SYMBOLS: expect.any(MapRule),
        })
      );
    });
  });
});

describe('instance', () => {
  describe('isEquivalent', () => {
    describe('equivalent (default rules)', () => {
      it('should return false when inputs are not byte-equal', () => {
        const instance = new Equivalency();
        const inputs = [['a', 'b']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });

      it('should give reasons', () => {
        const instance = new Equivalency();
        const inputs = [['a', 'b']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2, { giveReasons: true })).toEqual({
            isEquivalent: false,
            reasons: [{ name: 'identity' }],
          });
        });
      });

      it('should return true when inputs are byte-equal', () => {
        const instance = new Equivalency();
        const inputs = [['a', 'a'], ['💩', '\u{1F4A9}']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('should respect remove rules', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.en.ASCII_PUNCTUATION
        );
        const inputs = [["it's", 'its']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('adding then removing the same rule should be the same as default rules ', () => {
        const instance = new Equivalency()
          .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
          .matters(Equivalency.en.COMMON_PUNCTUATION);
        const inputs = [['what he did.', 'what he did?']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2, { giveReasons: true })).toEqual({
            isEquivalent: false,
            reasons: [{ name: 'common punctuation' }],
          });
        });
      });

      it('doesnt throw when asked to give reasons for 15 matters rules and not explicitly told to do so', () => {
        const instance = new Equivalency()
          .matters('a')
          .matters('b')
          .matters('c')
          .matters('d')
          .matters('e')
          .matters('f')
          .matters('g')
          .matters('h')
          .matters('i')
          .matters('j')
          .matters('k')
          .matters('l')
          .matters('m')
          .matters('n')
          .matters('o')
          .matters('p'); // 16 matters rules, about 75 ms on an 8th-gen i7.
        expect(instance.equivalent('a', 'ab', { giveReasons: true })).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'b' }],
        });
      });

      it('throws when asked to give reasons for >16 matters rules and not explicitly told to do so', () => {
        const instance = new Equivalency()
          .matters('a')
          .matters('b')
          .matters('c')
          .matters('d')
          .matters('e')
          .matters('f')
          .matters('g')
          .matters('h')
          .matters('i')
          .matters('j')
          .matters('k')
          .matters('l')
          .matters('m')
          .matters('n')
          .matters('o')
          .matters('p')
          .matters('q');
        expect(() =>
          instance.equivalent('a', 'b', { giveReasons: true })
        ).toThrow(
          'To give reasons for >16 matters rules, set opts.giveReasonsUnlimitedRules to true.'
        );
      });

      it('gives reasons when asked to give reasons for >16 matters rules and explicitly told to do so', () => {
        const instance = new Equivalency()
          .matters('a')
          .matters('b')
          .matters('c')
          .matters('d')
          .matters('e')
          .matters('f')
          .matters('g')
          .matters('h')
          .matters('i')
          .matters('j')
          .matters('k')
          .matters('l')
          .matters('m')
          .matters('n')
          .matters('o')
          .matters('p')
          .matters('q'); // 17 matters rules, about 150 ms on an 8th-gen i7.

        expect(
          instance.equivalent('a', 'ab', {
            giveReasons: true,
            giveReasonsUnlimitedRules: true,
          })
        ).toEqual({ isEquivalent: false, reasons: [{ name: 'b' }] });
      });

      it('identifies remove rules when giving reasons', () => {
        const instance = new Equivalency().matters(
          Equivalency.en.ASCII_PUNCTUATION
        );
        const inputs = [["it's", 'its']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2, { giveReasons: true })).toEqual({
            isEquivalent: false,
            reasons: [{ name: 'ascii punctuation' }],
          });
        });
      });

      it('identifies multiple rules that are reasons (punctuation and symbols)', () => {
        const instance = new Equivalency()
          .matters(Equivalency.en.COMMON_PUNCTUATION)
          .matters(Equivalency.en.COMMON_SYMBOLS)
          .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES);
        const correctAnswer = 'you and me';

        expect(
          instance.equivalent(correctAnswer, 'you and me!', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'common punctuation' }],
        });

        expect(
          instance.equivalent(correctAnswer, 'you &and me', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'common symbols' }],
        });

        // If these are applied together, passes, else doesn't.
        expect(
          instance.equivalent(correctAnswer, 'you &and me!', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'common punctuation' }, { name: 'common symbols' }],
        });

        expect(
          instance.equivalent(correctAnswer, 'you and I', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'identity' }],
        });

        expect(
          instance.equivalent(correctAnswer, 'you &and I!', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'identity' }],
        });
      });

      it('gives empty array of reasons when giveReasons: true and isEquivalent: true', () => {
        const instance = new Equivalency()
          .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
          .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES);
        const correctAnswer = 'aeiou';

        expect(
          instance.equivalent(correctAnswer, 'aeiou', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: true,
          reasons: [],
        });
      });

      it('identifies multiple rules that are reasons (grave accent, umlaut, other diacritic)', () => {
        const instance = new Equivalency()
          .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
          .matters(Equivalency.ACUTE_ACCENT)
          .matters(Equivalency.UMLAUT)
          .matters(
            Equivalency.COMBINING_DIACRITICS_BLOCK_EXCEPT_ACUTE_AND_UMLAUT
          );
        const correctAnswer = 'aeiou';

        expect(
          instance.equivalent(correctAnswer, 'áeiou', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'acute accent' }],
        });

        expect(
          instance.equivalent(correctAnswer, 'aeioü', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'umlaut' }],
        });

        expect(
          instance.equivalent(correctAnswer, 'aeĭou', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [
            { name: 'combining diacritics block except acute and umlaut' },
          ],
        });

        expect(
          instance.equivalent(correctAnswer, 'áeioü', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [{ name: 'acute accent' }, { name: 'umlaut' }],
        });

        expect(
          instance.equivalent(correctAnswer, 'áeĭoü', {
            giveReasons: true,
          })
        ).toEqual({
          isEquivalent: false,
          reasons: [
            { name: 'acute accent' },
            { name: 'umlaut' },
            { name: 'combining diacritics block except acute and umlaut' },
          ],
        });
      });
    });

    describe('equivalent (builtin doesnt matter)', () => {
      it("should return true when inputs differ solely by characters that don't matter", () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.en.COMMON_PUNCTUATION
        );
        const inputs = [
          ['what, you did', 'what you did'],
          ['fire-fly light', 'firefly light'],
        ];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('should return false when inputs differ by characters that do matter', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.en.COMMON_PUNCTUATION
        );
        const inputs = [['what he did', 'what you did']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });
    });

    describe('equivalent (chain doesnMatter + matter)', () => {
      it("should return true when inputs differ solely by characters that don't matter", () => {
        const instance = new Equivalency()
          .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
          .matters('-');
        const inputs = [['what, you did', 'what you did']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('should return false when inputs differ by characters that do matter', () => {
        const instance = new Equivalency()
          .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
          .matters('-');
        const inputs = [['fire-fly light', 'firefly light']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });

      it('should return false when inputs differ by characters that do matter (give reasons)', () => {
        const instance = new Equivalency()
          .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
          .matters('-');
        const inputs = [['fire-fly light', 'firefly light']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2, { giveReasons: true })).toEqual({
            isEquivalent: false,
            reasons: [{ name: '-' }],
          });
        });
      });
    });

    describe('equivalent (capitalization doesnt matter)', () => {
      it('should return true when inputs differ solely by capitalization', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.CAPITALIZATION
        );
        const inputs = [['us', 'US']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('should return false when inputs differ other than by capitalization', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.CAPITALIZATION
        );
        const inputs = [['us', 'usa']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });
    });

    describe('equivalent (whitespace doesnt matter)', () => {
      it('should return true when inputs differ solely by shape of whitespaces', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.WHITESPACE_DIFFERENCES
        );
        const inputs = [['the us of a', 'the	us   of\u2028\u2029a']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('should return false when inputs differ other than by shape of whitespaces', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.WHITESPACE_DIFFERENCES
        );
        const inputs = [['the us of a', 'The	us   of\u2028\u2029a']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });
    });

    describe('equivalent (common diacritics)', () => {
      it('should return true when inputs differ solely by common diacritics', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.COMMON_DIACRITICS
        );
        const inputs = [['â', 'a']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('should return false when inputs differ other than by common diacritics', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.COMMON_DIACRITICS
        );
        const inputs = [['âb', 'âc']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });

      it('should return true for more complex inputs', () => {
        const enEquivalency = new Equivalency()
          .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
          .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
          .doesntMatter(Equivalency.CAPITALIZATION)
          .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
          .doesntMatter(Equivalency.en.COMMON_SYMBOLS)
          .doesntMatter(Equivalency.COMMON_DIACRITICS);

        const { isEquivalent } = enEquivalency.equivalent(
          'àâäçèéêíïîñóöüÀÂÄÇÈÉÊÍÏÎÑÓÖÜ',
          'aaaceeeiiinoouAAACEEEIIINOOU'
        );
        expect(isEquivalent).toBe(true);
      });
    });

    describe('equivalent (unicode normalization doesnt matter)', () => {
      it('should return true when inputs differ solely by unicode normalization', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.UNICODE_NORMALIZATION
        );
        // composed and decomposed forms of é
        const inputs = [['\u00e9', '\u0065\u0301']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });

      it('should return false when inputs differ other than by unicode normalization', () => {
        const instance = new Equivalency().doesntMatter(
          Equivalency.UNICODE_NORMALIZATION
        );
        // lowercase n \u006e and uppercase N \u004e with combining tilde \u0303
        const inputs = [['\u006e\u0303', '\u004e\u0303']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });
    });

    describe('equivalent (arbitrary word prefix)', () => {
      it('should be true when rule does not matter', () => {
        const beginsWithExcuseMe = equivalency.wordPrefix('Excuse me,');
        const instance = new Equivalency().doesntMatter(beginsWithExcuseMe);

        const inputs = [
          [
            'Excuse me, could I borrow some Grey Poupon?',
            'could I borrow some Grey Poupon?',
          ],
          [
            'Excuse me, could I borrow some Grey Poupon?',
            'Excuse me, could I borrow some Grey Poupon?',
          ],
          ["I'm terribly sorry.", "Excuse me, I'm terribly sorry."],
          ["I'm terribly sorry.", "Excuse me,      I'm terribly sorry."],
        ];

        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: true });
        });
      });
    });
  });

  describe('editDistance', () => {
    it('should return an editDistance when calculateEditDistance is true', () => {
      const instance = new Equivalency();
      const inputs = [['a', 'b']];
      const options = { calculateEditDistance: true };
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = instance.equivalent(s1, s2, options);
        expect(editDistance).toBeDefined();
      });
    });

    it('should not return an editDistance when calculateEditDistance is false', () => {
      const instance = new Equivalency();
      const inputs = [['a', 'b']];
      const options = { calculateEditDistance: false };
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = instance.equivalent(s1, s2, options);
        expect(editDistance).toBeUndefined();
      });
    });

    it('should not return an editDistance when calculateEditDistance is not provided', () => {
      const instance = new Equivalency();
      const inputs = [['a', 'b']];
      const options = {};
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = instance.equivalent(s1, s2, options);
        expect(editDistance).toBeUndefined();
      });
    });
  });

  describe('clone', () => {
    it('should clone', () => {
      const inputs = [
        ['what he did.', 'what he did?', [true, false, false]],
        ['what he did', 'what he did?', [true, false, false]],
        ['what he did.', 'what he did', [true, false, true]],
      ];
      const original = new Equivalency().doesntMatter(
        Equivalency.en.COMMON_PUNCTUATION
      );
      const clone1 = original
        .clone()
        .matters(Equivalency.en.COMMON_PUNCTUATION);
      const clone2 = original.clone().matters('?');

      inputs.forEach(
        ([s1, s2, [originalExpected, clone1Expected, clone2Expected]]) => {
          expect(original.equivalent(s1, s2)).toEqual({
            isEquivalent: originalExpected,
          });
          expect(clone1.equivalent(s1, s2)).toEqual({
            isEquivalent: clone1Expected,
          });
          expect(clone2.equivalent(s1, s2)).toEqual({
            isEquivalent: clone2Expected,
          });
        }
      );
    });
  });
});

describe('Real-world usage', () => {
  describe('isEquivalent', () => {
    describe('es', () => {
      const esEquivalency = new Equivalency()
        .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
        .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
        .doesntMatter(Equivalency.CAPITALIZATION)
        .doesntMatter(Equivalency.es.COMMON_PUNCTUATION)
        .doesntMatter(Equivalency.es.COMMON_SYMBOLS)
        .matters('-');

      it('should mark candidates equivalent that we want to count as equivalent', () => {
        const theCorrectAnswer = '¿Cómo se dice...?';

        const candidates = [
          '¿Cómo se dice...?',
          'Cómo se dice',
          'C..,.,.??.,.ómo s.......?!?!?!??e dice.....???????????¿¿¿¿¿¿',
        ];

        candidates.forEach(candidate => {
          const { isEquivalent } = esEquivalency.equivalent(
            theCorrectAnswer,
            candidate
          );
          expect(isEquivalent).toBe(true);
        });
      });

      it('should mark candidates inequivalent that we dont want to count as equivalent', () => {
        const theCorrectAnswer = '¿Cómo se dice...?';

        const candidates = ['¿Como se dice...?', 'Cómosedice'];

        candidates.forEach(candidate => {
          const { isEquivalent } = esEquivalency.equivalent(
            theCorrectAnswer,
            candidate
          );
          expect(isEquivalent).toBe(false);
        });
      });
    });

    describe('en', () => {
      const enEquivalency = new Equivalency()
        .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
        .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
        .doesntMatter(Equivalency.CAPITALIZATION)
        .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
        .matters('-')
        .doesntMatter(Equivalency.en.COMMON_SYMBOLS)
        .doesntMatter(Equivalency.COMMON_DIACRITICS)
        .doesntMatter(Equivalency.HYPHENS_OMITTED_OR_REPLACED_WITH_SPACES);

      it('should handle hyphens correctly', () => {
        const target = 'over-the-moon cow';

        const correct = [
          'over the moon cow', // spaces for hyphens
          'overthemoon cow', // omitted hyphens
          'over--the-moon cow', // extra hyphens where there should be one hyphen
          'over    the moon cow', // many spaces where there should be one hyphen
        ];

        const incorrect = [
          'over-the-moon-cow', // hyphens instead of spaces
          'overthemooncow', // missing spaces
        ];

        correct.forEach(test => {
          const { isEquivalent } = enEquivalency.equivalent(target, test);
          expect(isEquivalent).toBe(true);
        });

        incorrect.forEach(test => {
          const { isEquivalent } = enEquivalency.equivalent(target, test);
          expect(isEquivalent).toBe(false);
        });
      });

      it('should mark candidates equivalent that we want to count as equivalent', () => {
        const theCorrectAnswer = 'How are you today?';

        const candidates = [
          'how are you, today?',
          'HOW ARE YOU  TODAY',
          'how aré you today',
          '  how aré you today  ',
        ];

        candidates.forEach(candidate => {
          const { isEquivalent } = enEquivalency.equivalent(
            candidate,
            theCorrectAnswer
          );
          expect(isEquivalent).toBe(true);
        });
      });

      describe('INFINITIVE_VERBS', () => {
        let equivalency = null;

        beforeEach(() => {
          equivalency = new Equivalency().doesntMatter(
            Equivalency.en.INFINITIVE_VERBS
          );
        });

        it('should mark infinitive verbs as equivalent', () => {
          const theCorrectAnswer = 'write';

          const candidates = [
            'to write',
            '  to   write',
            ' TO write',
            'TO   write',
            ' tO write',
          ];

          candidates.forEach(candidate => {
            const { isEquivalent } = equivalency.equivalent(
              candidate,
              theCorrectAnswer
            );

            expect(isEquivalent).toBe(true);
          });
        });

        it('should require a space after to in front of verbs', () => {
          const theCorrectAnswer = 'write';

          const candidate = 'towrite';

          const { isEquivalent } = equivalency.equivalent(
            candidate,
            theCorrectAnswer
          );

          expect(isEquivalent).toBe(false);
        });
      });
    });
  });

  describe('editDistance (diacritics agnostic)', () => {
    describe('es', () => {
      const agnosticEsEquivalency = new Equivalency()
        .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
        .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
        .doesntMatter(Equivalency.CAPITALIZATION)
        .doesntMatter(Equivalency.es.COMMON_PUNCTUATION)
        .doesntMatter(Equivalency.es.COMMON_SYMBOLS)
        .doesntMatter(Equivalency.COMMON_DIACRITICS)
        .matters('-');

      it('should return correct editDistance when strings match', () => {
        const inputs = [
          ['estoy bien y tu', 'estoy bien, ¿y tú?'],
          ['como se dice', '¿Cómo se dice?'],
          ['Tengo tres coches.', 'Tengo tres coches.'],
          ['el combinado', 'el combínádo'],
        ];
        const options = { calculateEditDistance: true };
        inputs.forEach(([s1, s2]) => {
          const { editDistance } = agnosticEsEquivalency.equivalent(
            s1,
            s2,
            options
          );
          expect(editDistance).toEqual(0);
        });
      });

      it('should return correct editDistance when strings dont match', () => {
        const inputs = [
          ['e lcombinado', 'el combinado', 1],
          ['e  l combinado', 'el combinado', 1],
          ['e l c ombinado', 'el combinado', 2],
          ['el cobminado', 'el combinado', 1],
          ['el comdinabo', 'el combinado', 2],
          ['manzana', 'manzanas', 1],
          ['niña', 'nino', 1],
        ];
        const options = { calculateEditDistance: true };
        inputs.forEach(([s1, s2, expected]) => {
          const { editDistance } = agnosticEsEquivalency.equivalent(
            s1,
            s2,
            options
          );
          expect(editDistance).toEqual(expected);
        });
      });
    });

    describe('en', () => {
      const enEquivalency = new Equivalency()
        .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
        .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
        .doesntMatter(Equivalency.CAPITALIZATION)
        .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
        .doesntMatter(Equivalency.en.COMMON_SYMBOLS)
        .doesntMatter(Equivalency.COMMON_DIACRITICS)
        .matters('-');

      it('should return correct editDistance when strings match', () => {
        const inputs = [
          ['Im well and you', "I'm well, and you?"],
          ['wheres the money', "Where's the money?"],
          ['I am Iron Man', 'I am Iron Man'],
          ['say cheese', 'Say cheese!'],
        ];
        const options = { calculateEditDistance: true };
        inputs.forEach(([s1, s2]) => {
          const { editDistance } = enEquivalency.equivalent(s1, s2, options);
          expect(editDistance).toEqual(0);
        });
      });

      it('should return correct editDistance when string dont match', () => {
        const inputs = [
          ['more hardworking than', 'more hard-working than'],
          ['- more hard working than', 'more hard-working than'],
          ['mre hard-wrking than', 'more hard-working than'],
          ['one day, Simba', 'one daysimba'],
        ];
        const distances = [1, 3, 2, 1];
        const options = { calculateEditDistance: true };
        inputs.forEach(([s1, s2], index) => {
          const { editDistance } = enEquivalency.equivalent(s1, s2, options);
          expect(editDistance).toEqual(distances[index]);
        });
      });
    });
  });

  describe('HYPHENS_OMITTED_OR_REPLACED_WITH_SPACES', () => {
    let equivalency = null;

    beforeEach(() => {
      equivalency = new Equivalency().doesntMatter(
        Equivalency.HYPHENS_OMITTED_OR_REPLACED_WITH_SPACES
      );
    });

    it('should accept spaces for hyphens', () => {
      const { isEquivalent } = equivalency.equivalent(
        'over-the-moon cow',
        'over the moon cow'
      );
      expect(isEquivalent).toBe(true);
    });

    it('should not accept hyphens for spaces', () => {
      const { isEquivalent } = equivalency.equivalent(
        'over-the-moon cow',
        'over-the-moon-cow'
      );
      expect(isEquivalent).toBe(false);
    });
  });
});
