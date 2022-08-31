/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { joinLabel, splitLabel, getEntityName } from '.';

describe('util', () => {
  describe('joinLabel', () => {
    it('should join labels', () => {
      expect(joinLabel(['one', 'two', 'three'])).toBe('one,two,three');
    });
    it('should return null', () => {
      expect(joinLabel([])).toBe(null);
    });
    it('should return null with null input', () => {
      expect(joinLabel(null)).toBe(null);
    });
  });
  describe('splitLabel', () => {
    it('should do nothing', () => {
      expect(splitLabel('one')).toEqual(['one']);
    });
    it('should not split', () => {
      expect(splitLabel('one.two')).toEqual(['one.two']);
    });
    it('should return empty array', () => {
      expect(splitLabel('')).toEqual([]);
    });
    it('should return empty array 2', () => {
      expect(splitLabel(',')).toEqual([]);
    });
    it('should return null', () => {
      expect(splitLabel(null)).toEqual(null);
    });
    it('should split labels', () => {
      expect(splitLabel('one,two')).toEqual(['one', 'two']);
    });
  });
  describe('getEntityName', () => {
    it('should return label', () => {
      expect(getEntityName({ id: 123, label: 'test-label' })).toBe('test-label');
    });
    it('label is blank', () => {
      expect(getEntityName({ id: 123, label: '' })).toBe(' #123');
    });
    it('label is null', () => {
      expect(getEntityName({ id: 123 })).toBe(' #123');
    });
    it('label is null id 0', () => {
      expect(getEntityName({ id: 0 })).toBe(' #0');
    });
    it('should return label has prefix', () => {
      expect(getEntityName({ id: 123, label: 'test-label' }, 'Prefix')).toBe('test-label');
    });
    it('label is blank has prefix', () => {
      expect(getEntityName({ id: 123, label: '' }, 'Prefix')).toBe('Prefix #123');
    });
    it('label is null has prefix', () => {
      expect(getEntityName({ id: 123 }, 'Prefix')).toBe('Prefix #123');
    });
    it('label is null id 0 has prefix', () => {
      expect(getEntityName({ id: 0 }, 'Prefix')).toBe('Prefix #0');
    });
  });
});
