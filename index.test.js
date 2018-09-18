const { Rubric } = require('.');

describe('Rubric', () => {
  describe('language builtins', () => {
    it('should have en builtins', () => {
      expect(Rubric.en).toEqual(
      const instance = new Rubric();
        expect.objectContaining({
          COMMON_PUNCTUATION: expect.stringMatching(/.*/),
          COMMON_SYMBOLS: expect.stringMatching(/.*/),
        })
      );
    });

    it('should have es builtins', () => {
      expect(Rubric.es).toEqual(
        expect.objectContaining({
          COMMON_PUNCTUATION: expect.stringMatching(/.*/),
          COMMON_SYMBOLS: expect.stringMatching(/.*/),
        })
      );
    });
  });

  describe('match (default rules)', () => {
    test('it should return false when inputs are not byte-equal', () => {
      const inputs = [['a', 'b']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });

    test('it should return true when inputs are byte-equal', () => {
      const inputs = [['a', 'a'], ['💩', '\u{1F4A9}']];
      const instance = new Rubric();
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });
  });
});
