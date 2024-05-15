/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
