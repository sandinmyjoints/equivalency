const expect = require('expect');
const equivalency = require('.');
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

  describe('en', () => {
    const enEquivalency = new Equivalency()
      .doesntMatter(Equivalency.UNICODE_NORMALIZATION)
      .doesntMatter(Equivalency.WHITESPACE_DIFFERENCES)
      .doesntMatter(Equivalency.CAPITALIZATION)
      .doesntMatter(Equivalency.en.COMMON_PUNCTUATION)
      .doesntMatter(Equivalency.en.COMMON_SYMBOLS)
      .doesntMatter(Equivalency.ACCENTS)
      .matters('-');

    it('should mark candidates equivalent that want to count as equivalent', () => {
      const theCorrectAnswer = 'How are you today?';

      const candidates = [
        'how are you, today?',
        'HOW ARE YOU  TODAY',
        'how aré you today',
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
  });
});
