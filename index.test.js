const rubric = require('.');
const { Rubric } = rubric;
const { MapRule } = require('./lib');

describe('rubric instance', () => {
  it('should be an instance of Rubric', () => {
    expect(rubric).toBeInstanceOf(Rubric);
  });
});

describe('Rubric', () => {
  describe('language builtins', () => {
    it('should have en builtins', () => {
      expect(Rubric.en).toEqual(
        expect.objectContaining({
          COMMON_PUNCTUATION: expect.any(MapRule),
          COMMON_SYMBOLS: expect.any(MapRule),
        })
      );
    });

    it('should have es builtins', () => {
      expect(Rubric.es).toEqual(
        expect.objectContaining({
          COMMON_PUNCTUATION: expect.any(MapRule),
          COMMON_SYMBOLS: expect.any(MapRule),
        })
      );
    });
  });

  describe('match (default rules)', () => {
    it('should return false when inputs are not byte-equal', () => {
      const instance = new Rubric();
      const inputs = [['a', 'b']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });

    it('should return true when inputs are byte-equal', () => {
      const instance = new Rubric();
      const inputs = [['a', 'a'], ['💩', '\u{1F4A9}']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });

    it('adding then removing the same rule should be equivalent to default rules ', () => {
      const instance = new Rubric()
        .doesntMatter(Rubric.en.COMMON_PUNCTUATION)
        .matters(Rubric.en.COMMON_PUNCTUATION);
      const inputs = [['what he did.', 'what he did?']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });
  });

  describe('match (builtin doesnt matter)', () => {
    it("should return true when inputs differ solely by characters that don't matter", () => {
      const instance = new Rubric().doesntMatter(Rubric.en.COMMON_PUNCTUATION);
      const inputs = [
        ['what, you did', 'what you did'],
        ['fire-fly light', 'firefly light'],
      ];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });

    it('should return false when inputs differ by characters that do matter', () => {
      const instance = new Rubric().doesntMatter(Rubric.en.COMMON_PUNCTUATION);
      const inputs = [['what he did', 'what you did']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });
  });

  describe('match (chain doesnMatter + matter)', () => {
    it("should return true when inputs differ solely by characters that don't matter", () => {
      const instance = new Rubric()
        .doesntMatter(Rubric.en.COMMON_PUNCTUATION)
        .matters('-');
      const inputs = [['what, you did', 'what you did']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });

    it('should return false when inputs differ by characters that do matter', () => {
      const instance = new Rubric()
        .doesntMatter(Rubric.en.COMMON_PUNCTUATION)
        .matters('-');
      const inputs = [['fire-fly light', 'firefly light']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });
  });

  describe('match (capitalization doesnt matter)', () => {
    it('should return true when inputs differ solely by capitalization', () => {
      const instance = new Rubric().doesntMatter(Rubric.CAPITALIZATION);
      const inputs = [['us', 'US']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });

    it('should return false when inputs differ other than by capitalization', () => {
      const instance = new Rubric().doesntMatter(Rubric.CAPITALIZATION);
      const inputs = [['us', 'usa']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });
  });

  describe('match (whitespace doesnt matter)', () => {
    it('should return true when inputs differ solely by shape of whitespaces', () => {
      const instance = new Rubric().doesntMatter(Rubric.WHITESPACE_DIFFERENCES);
      const inputs = [['the us of a', 'the	us   of\u2028\u2029a']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });

    it('should return false when inputs differ other than by shape of whitespaces', () => {
      const instance = new Rubric().doesntMatter(Rubric.WHITESPACE_DIFFERENCES);
      const inputs = [['the us of a', 'The	us   of\u2028\u2029a']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });
  });

  describe('match (unicode normalization doesnt matter)', () => {
    it('should return true when inputs differ solely by unicode normalization', () => {
      const instance = new Rubric().doesntMatter(Rubric.UNICODE_NORMALIZATION);
      // composed and decomposed forms of é
      const inputs = [['\u00e9', '\u0065\u0301']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });

    it('should return false when inputs differ other than by unicode normalization', () => {
      const instance = new Rubric().doesntMatter(Rubric.UNICODE_NORMALIZATION);
      // lowercase n \u006e and uppercase N \u004e with combining tilde \u0303
      const inputs = [['\u006e\u0303', '\u004e\u0303']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });
  });
});

describe('Real-world usage', () => {
  describe('es rubric', () => {
    const esRubric = new Rubric()
      .doesntMatter(Rubric.UNICODE_NORMALIZATION)
      .doesntMatter(Rubric.WHITESPACE_DIFFERENCES)
      .doesntMatter(Rubric.CAPITALIZATION)
      .doesntMatter(Rubric.es.COMMON_PUNCTUATION)
      .doesntMatter(Rubric.es.COMMON_SYMBOLS)
      .matters('-');

    it('should mark candidates correct that we want to count as correct', () => {
      const theCorrectAnswer = '¿Cómo se dice...?';

      const candidates = [
        '¿Cómo se dice...?',
        'Cómo se dice',
        'C..,.,.??.,.ómo s.......?!?!?!??e dice.....???????????¿¿¿¿¿¿',
      ];

      candidates.forEach(candidate => {
        const { isMatch } = esRubric.match(candidate, theCorrectAnswer);
        expect(isMatch).toBe(true);
      });
    });

    it('should mark candidates incorrect that we dont want to count as correct', () => {
      const theCorrectAnswer = '¿Cómo se dice...?';

      const candidates = ['¿Como se dice...?', 'Cómosedice'];

      candidates.forEach(candidate => {
        const { isMatch } = esRubric.match(candidate, theCorrectAnswer);
        expect(isMatch).toBe(false);
      });
    });
  });

  describe('en rubric', () => {
    const enRubric = new Rubric()
      .doesntMatter(Rubric.UNICODE_NORMALIZATION)
      .doesntMatter(Rubric.WHITESPACE_DIFFERENCES)
      .doesntMatter(Rubric.CAPITALIZATION)
      .doesntMatter(Rubric.en.COMMON_PUNCTUATION)
      .doesntMatter(Rubric.en.COMMON_SYMBOLS)
      .doesntMatter(Rubric.ACCENTS)
      .matters('-');

    it('should mark candidates correct that we want to count as correct', () => {
      const theCorrectAnswer = 'How are you today?';

      const candidates = [
        'how are you, today?',
        'HOW ARE YOU  TODAY',
        'how aré you today',
      ];

      candidates.forEach(candidate => {
        const { isMatch } = enRubric.match(candidate, theCorrectAnswer);
        expect(isMatch).toBe(true);
      });
    });

    it('should mark candidates incorrect that we dont want to count as correct', () => {
      const theCorrectAnswer = 'How are you today?';

      const candidates = ['how are you, to-day?'];

      candidates.forEach(candidate => {
        const { isMatch } = enRubric.match(candidate, theCorrectAnswer);
        expect(isMatch).toBe(false);
      });
    });
  });
});
