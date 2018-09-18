const { Rubric } = require('.');

describe('Rubric', () => {
  describe('match (default rules)', () => {
    test('it should return false when inputs are not byte-equal', () => {
      const inputs = [['a', 'b']];
      const instance = new Rubric();
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
