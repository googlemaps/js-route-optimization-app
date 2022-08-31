/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  getCapacityQuantityRoot,
  getCapacityQuantityUnit,
  getFullUnitFromAbbrevation,
  getUnitAbbreviation,
} from './capacity-quantity';

describe('capacity quantity', () => {
  describe('getCapacityQuantityRoot', () => {
    it('should return undefined for non-string parameters', () => {
      expect(getCapacityQuantityRoot(100 as any)).toBeUndefined();
      expect(getCapacityQuantityRoot(true as any)).toBeUndefined();
      expect(getCapacityQuantityRoot(null as any)).toBeUndefined();
      expect(getCapacityQuantityRoot(undefined as any)).toBeUndefined();
      expect(getCapacityQuantityRoot({} as any)).toBeUndefined();
      expect(getCapacityQuantityRoot([] as any)).toBeUndefined();
    });

    it('should return itself for a blank string', () => {
      expect(getCapacityQuantityRoot('')).toBe('');
    });

    it('should return blank for a string starting with an underscore', () => {
      expect(getCapacityQuantityRoot('_capacity')).toBe('');
    });

    it('should return itself for a string with no underscores', () => {
      expect(getCapacityQuantityRoot('capacity')).toBe('capacity');
    });

    it('should split string at first underscore', () => {
      expect(getCapacityQuantityRoot('weight_lb')).toBe('weight');
      expect(getCapacityQuantityRoot('volume_meters_squared')).toBe('volume');
    });
  });

  describe('getCapacityQuantityUnit', () => {
    it('should return undefined for non-string parameters', () => {
      expect(getCapacityQuantityUnit(100 as any)).toBeUndefined();
      expect(getCapacityQuantityUnit(true as any)).toBeUndefined();
      expect(getCapacityQuantityUnit(null as any)).toBeUndefined();
      expect(getCapacityQuantityUnit(undefined as any)).toBeUndefined();
      expect(getCapacityQuantityUnit({} as any)).toBeUndefined();
      expect(getCapacityQuantityUnit([] as any)).toBeUndefined();
    });

    it('should return itself for a blank string', () => {
      expect(getCapacityQuantityUnit('')).toBe('');
    });

    it('should return undefined for a string with no underscores', () => {
      expect(getCapacityQuantityUnit('weightLb')).toBeUndefined();
    });

    it('should return all text after first underscore', () => {
      expect(getCapacityQuantityUnit('weight_lb')).toBe('lb');
      expect(getCapacityQuantityUnit('volume_meters_squared')).toBe('meters_squared');
    });
  });

  describe('getUnitAbbreviation', () => {
    it('should return undefined for non-string parameters', () => {
      expect(getUnitAbbreviation(100 as any)).toBeUndefined();
      expect(getUnitAbbreviation(true as any)).toBeUndefined();
      expect(getUnitAbbreviation(null as any)).toBeUndefined();
      expect(getUnitAbbreviation(undefined as any)).toBeUndefined();
      expect(getUnitAbbreviation({} as any)).toBeUndefined();
      expect(getUnitAbbreviation([] as any)).toBeUndefined();
    });

    it('should return the unit when no abbreviations are given', () => {
      expect(getUnitAbbreviation('unit')).toBe('unit');
    });

    it('should return the unit when abbreviation lookup fails', () => {
      expect(getUnitAbbreviation('weight', {})).toBe('weight');
      expect(getUnitAbbreviation('weight', { volume: 'v' })).toBe('weight');
    });

    it('should return abbreviation', () => {
      expect(getUnitAbbreviation('weight', { volume: 'v', weight: 'wt' })).toBe('wt');
      expect(getUnitAbbreviation('WEIGHT', { volume: 'v', weight: 'wt' })).toBe('wt');
    });
  });

  describe('getFullUnitFromAbbrevation', () => {
    it('should return undefined for non-string parameters', () => {
      expect(getFullUnitFromAbbrevation(100 as any)).toBeUndefined();
      expect(getFullUnitFromAbbrevation(true as any)).toBeUndefined();
      expect(getFullUnitFromAbbrevation(null as any)).toBeUndefined();
      expect(getFullUnitFromAbbrevation(undefined as any)).toBeUndefined();
      expect(getFullUnitFromAbbrevation({} as any)).toBeUndefined();
      expect(getFullUnitFromAbbrevation([] as any)).toBeUndefined();
    });

    it('should return the abbreviation when no unit lookups are given', () => {
      expect(getFullUnitFromAbbrevation('unit')).toBe('unit');
    });

    it('should return the unit from an abbreviation', () => {
      expect(getFullUnitFromAbbrevation('w', { weight: 'w' })).toBe('weight');
    });

    it('should return the abbreviation when lookup fails', () => {
      expect(getFullUnitFromAbbrevation('m', { weight: 'w' })).toBe('m');
    });
  });
});
