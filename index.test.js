const expect = require('expect');
const equivalency = require('./index');
const { Equivalency } = equivalency;
const { MapRule } = require('./lib');

describe('equivalency instance', () => {
  it('should be an instance of Equivalency', () => {
    expect(equivalency).toBeInstanceOf(Equivalency);
  });
});

describe('Equivalency', () => {
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

  describe('isEquivalent', () => {
    describe('equivalent (default rules)', () => {
      it('should return false when inputs are not byte-equal', () => {
        const instance = new Equivalency();
        const inputs = [['a', 'b']];
        inputs.forEach(([s1, s2]) => {
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
        });
      });

      it('should return true when inputs are byte-equal', () => {
        const instance = new Equivalency();
        const inputs = [['a', 'a'], ['💩', '\u{1F4A9}']];
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
          expect(instance.equivalent(s1, s2)).toEqual({ isEquivalent: false });
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
        expect(editDistance).toEqual(1);
      });
    });

    it('should not return an editDistance when calculateEditDistance is false', () => {
      const instance = new Equivalency();
      const inputs = [['a', 'b']];
      const options = { calculateEditDistance: false };
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = instance.equivalent(s1, s2, options);
        expect(editDistance).toEqual(undefined);
      });
    });

    it('should not return an editDistance when calculateEditDistance is not provided', () => {
      const instance = new Equivalency();
      const inputs = [['a', 'b']];
      const options = {};
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = instance.equivalent(s1, s2, options);
        expect(editDistance).toEqual(undefined);
      });
    });
  });
});

describe('Real-world usage', () => {
  describe('es equivalency', () => {
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
          candidate,
          theCorrectAnswer
        );
        expect(isEquivalent).toBe(true);
      });
    });

    it('should mark candidates inequivalent that we dont want to count as equivalent', () => {
      const theCorrectAnswer = '¿Cómo se dice...?';

      const candidates = ['¿Como se dice...?', 'Cómosedice'];

      candidates.forEach(candidate => {
        const { isEquivalent } = esEquivalency.equivalent(
          candidate,
          theCorrectAnswer
        );
        expect(isEquivalent).toBe(false);
      });
    });
  });

  describe('en equivalency', () => {
    const enEquivalency = new Equivalency()
      .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
      .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
      .doesntMatter(Equivalency.CAPITALIZATION)
      .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
      .doesntMatter(Equivalency.en.COMMON_SYMBOLS)
      .doesntMatter(Equivalency.COMMON_DIACRITICS)
      .matters('-');

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

    it('should mark candidates inequivalent that we dont want to count as equivalent', () => {
      const theCorrectAnswer = 'How are you today?';

      const candidates = ['how are you, to-day?'];

      candidates.forEach(candidate => {
        const { isEquivalent } = enEquivalency.equivalent(
          candidate,
          theCorrectAnswer
        );
        expect(isEquivalent).toBe(false);
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

  describe('es edit distance (do not care about diacritics', () => {
    const esEquivalency = new Equivalency()
      .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
      .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
      .doesntMatter(Equivalency.CAPITALIZATION)
      .doesntMatter(Equivalency.es.COMMON_PUNCTUATION)
      .doesntMatter(Equivalency.es.COMMON_SYMBOLS)
      .doesntMatter(Equivalency.COMMON_DIACRITICS)

      .matters('-');

    it('should return correct edit distance 1', () => {
      const inputs = [['como se dice', '¿Cómo se dice?']];
      const options = { calculateEditDistance: true };
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = esEquivalency.equivalent(s1, s2, options);
        expect(editDistance).toEqual(0);
      });
    });

    it('should return correct edit distance 2', () => {
      const inputs = [['estoy bien y tu', 'estoy bien, ¿y tú?']];
      const options = { calculateEditDistance: true };
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = esEquivalency.equivalent(s1, s2, options);
        expect(editDistance).toEqual(0);
      });
    });

    it('should return correct edit distance 3', () => {
      const inputs = [['estoy bien y tu', 'estoy bien, ¿y tú?']];
      const options = { calculateEditDistance: true };
      inputs.forEach(([s1, s2]) => {
        const { editDistance } = esEquivalency.equivalent(s1, s2, options);
        expect(editDistance).toEqual(0);
      });
    });

    //   - "e lcombinado" is edit distance 1 from "el combinado" due to swap of significant (single) whitespace and "l"
    // - "e  l combinado" is edit distance 1 because the two contiguous whitespaces get collapsed into one before computing edistance
    // - "e l c ombinado" is edit distance 2 due to insertion of 2 extraneous characters (both are whitespace in this instance)
    // - "el cobminado" is edit distance 1 due to adjacent swap
    // - "el comdinabo" is not edit distance 1 due to non-adjacent swap

    it('should return correct edit distance cases', () => {
      const inputs = [
        ['e lcombinado', 'el combinado'],
        ['e  l combinado', 'el combinado'],
        ['e l c ombinado', 'el combinado'],
        ['el cobminado', 'el combinado'],
        ['el comdinabo', 'el combinado'],
      ];
      const distances = [1, 1, 2, 1, 2];
      const options = { calculateEditDistance: true };
      inputs.forEach(([s1, s2], index) => {
        const { editDistance } = enEquivalency.equivalent(s1, s2, options);
        expect(editDistance).toEqual(distances[index]);
      });
    });
  });

  describe('en edit distance (do not care about diacritics', () => {
    const enEquivalency = new Equivalency()
      .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
      .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
      .doesntMatter(Equivalency.CAPITALIZATION)
      .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
      .doesntMatter(Equivalency.en.COMMON_SYMBOLS)
      .doesntMatter(Equivalency.COMMON_DIACRITICS)
      .matters('-');

    it.only('should return correct edit distance 1', () => {
      const inputs = [
        ['more hardworking than', 'more hard-working than'],
        ['- more hard working than', 'more hard-working than'], // this differs from epic
        ['mre hard-wrking than', 'more hard-working than'],
      ];
      const distances = [1, 3, 2];
      const options = { calculateEditDistance: true };
      inputs.forEach(([s1, s2], index) => {
        const { editDistance } = enEquivalency.equivalent(s1, s2, options);
        expect(editDistance).toEqual(distances[index]);
      });
    });

    it('should return correct edit distance 2', () => {
      const inputs = [['Im well and you', "I'm well, and you?"]];
      const distances = [0];
      const options = { calculateEditDistance: true };
      inputs.forEach(([s1, s2], index) => {
        const { editDistance } = enEquivalency.equivalent(s1, s2, options);
        expect(editDistance).toEqual(distances[index]);
      });
    });
  });
});
