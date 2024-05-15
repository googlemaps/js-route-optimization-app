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
