const { powerSet } = require('./helpers');

describe('helpers', () => {
  it('should return power set', () => {
    const seq = [1, 2, 3];
    const exp = [[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]];
    const _powerSet = powerSet(seq);
    expect(_powerSet).toEqual(exp);
  });
});
