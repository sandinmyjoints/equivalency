const { Rubric } = require('.');

describe('Rubric', () => {
  describe('language builtins', () => {
    it('should have en builtins', () => {
      expect(Rubric.en).toEqual(
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
    const instance = new Rubric();
    it('should return false when inputs are not byte-equal', () => {
      const inputs = [['a', 'b']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });

    it('should return true when inputs are byte-equal', () => {
      const inputs = [['a', 'a'], ['💩', '\u{1F4A9}']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });
  });

  describe('match (builtin doesnt matter)', () => {
    const instance = new Rubric();
    instance.doesntMatter(Rubric.en.COMMON_PUNCTUATION);

    it("should return true when inputs differ solely by characters that don't matter", () => {
      const inputs = [['what, you did', 'what you did']];
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: true });
      });
    });

    it('should return false when inputs differ by characters that do matter', () => {
      const inputs = [['what he did', 'what you did']];
      const instance = new Rubric();
      inputs.forEach(([s1, s2]) => {
        expect(instance.match(s1, s2)).toEqual({ isMatch: false });
      });
    });
  });
});
