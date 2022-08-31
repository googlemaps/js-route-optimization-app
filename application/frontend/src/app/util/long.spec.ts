/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Long from 'long';
import { minLong, maxLong } from '.';

describe('util', () => {
  describe('maxLong', () => {
    it('maxLong a null', () => {
      expect(maxLong(null, Long.ONE)).toBe(Long.ONE);
    });
    it('maxLong b null', () => {
      expect(maxLong(Long.ZERO, null)).toBe(Long.ZERO);
    });
    it('maxLong both null', () => {
      expect(maxLong()).toEqual(undefined);
    });
    it('maxLong should return a', () => {
      expect(maxLong(Long.ZERO, Long.NEG_ONE)).toBe(Long.ZERO);
    });
    it('maxLong should return b', () => {
      expect(maxLong(Long.ZERO, Long.ONE)).toBe(Long.ONE);
    });
  });
  describe('minLong', () => {
    it('minLong a null', () => {
      expect(minLong(null, Long.ONE)).toBe(Long.ONE);
    });
    it('minLong b null', () => {
      expect(minLong(Long.ZERO, null)).toBe(Long.ZERO);
    });
    it('minLong both null', () => {
      expect(minLong()).toEqual(undefined);
    });
    it('minLong should return a', () => {
      expect(minLong(Long.ZERO, Long.ONE)).toBe(Long.ZERO);
    });
    it('minLong should return b', () => {
      expect(minLong(Long.ZERO, Long.NEG_ONE)).toBe(Long.NEG_ONE);
    });
  });
});
