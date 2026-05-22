import { wrapIndex } from './number';

describe('number util', () => {
  describe('wrapIndex', () => {
    it('should leave in-range indices unmodified', () => {
      const arr = [1, 2, 3, 4, 5];

      expect(wrapIndex(0, arr.length)).toBe(0);
      expect(arr[wrapIndex(0, arr.length)]).toBe(1);

      expect(wrapIndex(4, arr.length)).toBe(4);
      expect(arr[wrapIndex(4, arr.length)]).toBe(5);
    });

    it('should wrap numbers around array bounds', () => {
      const arr = [1, 2, 3, 4, 5];

      expect(wrapIndex(5, arr.length)).toBe(0);
      expect(arr[wrapIndex(5, arr.length)]).toBe(1);

      expect(wrapIndex(9, arr.length)).toBe(4);
      expect(arr[wrapIndex(9, arr.length)]).toBe(5);
    });
  });
});
