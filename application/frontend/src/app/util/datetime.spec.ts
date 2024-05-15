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

import { getNormalTimeString, isValidTimeString } from './datetime';

describe('datetime utils', () => {
  describe('isValidTimeString', () => {
    it('returns false for non-string values', () => {
      expect(isValidTimeString(100 as any)).toBe(false);
      expect(isValidTimeString(true as any)).toBe(false);
      expect(isValidTimeString(null as any)).toBe(false);
      expect(isValidTimeString(undefined as any)).toBe(false);
      expect(isValidTimeString({} as any)).toBe(false);
      expect(isValidTimeString([] as any)).toBe(false);
    });

    it('returns false for unmatched strings', () => {
      expect(isValidTimeString('hello there!')).toBe(false);
      expect(isValidTimeString('2022_01_01')).toBe(false);
      expect(isValidTimeString('1/3/2012')).toBe(false);
      expect(isValidTimeString('10-31 pm')).toBe(false);
      expect(isValidTimeString('10 am')).toBe(false);
      expect(isValidTimeString('2019-10-02T22:39:00.000Z')).toBe(false);
      expect(isValidTimeString('time: 10:01am')).toBe(false);
      expect(isValidTimeString('1a:01am')).toBe(false);
      expect(isValidTimeString('101:01am')).toBe(false);
      expect(isValidTimeString('10:1am')).toBe(false);
      expect(isValidTimeString('10:231am')).toBe(false);
      expect(isValidTimeString('101:501pm')).toBe(false);
      expect(isValidTimeString('10:01pm time')).toBe(false);
    });

    it('returns false for timestamps with invalid minutes', () => {
      expect(isValidTimeString('10:76 am')).toBe(false);
      expect(isValidTimeString('10:-32 am')).toBe(false);
    });

    it('returns false for timestamps with invalid hours', () => {
      expect(isValidTimeString('55:06pm')).toBe(false);
      expect(isValidTimeString('14:06pm')).toBe(false);
      expect(isValidTimeString('13:00am')).toBe(false);
      expect(isValidTimeString('-1:00am')).toBe(false);
      expect(isValidTimeString('24:00')).toBe(false);
      expect(isValidTimeString('00:00am')).toBe(false);
    });

    it('returns true for valid timestamps', () => {
      expect(isValidTimeString('10:00am')).toBe(true);
      expect(isValidTimeString('2:34pm')).toBe(true);
      expect(isValidTimeString('15:01')).toBe(true);
      expect(isValidTimeString('00:00')).toBe(true);
    });
  });

  describe('getNormalTimeString', () => {
    it('should return empty string for invalid timestrings', () => {
      expect(getNormalTimeString(100 as any)).toBe('');
      expect(getNormalTimeString(true as any)).toBe('');
      expect(getNormalTimeString(null as any)).toBe('');
      expect(getNormalTimeString(undefined as any)).toBe('');
      expect(getNormalTimeString({} as any)).toBe('');
      expect(getNormalTimeString([] as any)).toBe('');
      expect(getNormalTimeString('hello there!')).toBe('');
      expect(getNormalTimeString('2022_01_01')).toBe('');
      expect(getNormalTimeString('1/3/2012')).toBe('');
      expect(getNormalTimeString('10-31 pm')).toBe('');
      expect(getNormalTimeString('10 am')).toBe('');
      expect(getNormalTimeString('2019-10-02T22:39:00.000Z')).toBe('');
      expect(getNormalTimeString('time: 10:01am')).toBe('');
      expect(getNormalTimeString('1a:01am')).toBe('');
      expect(getNormalTimeString('101:01am')).toBe('');
      expect(getNormalTimeString('10:1am')).toBe('');
      expect(getNormalTimeString('10:231am')).toBe('');
      expect(getNormalTimeString('101:501pm')).toBe('');
      expect(getNormalTimeString('10:01pm time')).toBe('');
      expect(getNormalTimeString('10:76 am')).toBe('');
      expect(getNormalTimeString('10:-32 am')).toBe('');
      expect(getNormalTimeString('55:06pm')).toBe('');
      expect(getNormalTimeString('14:06pm')).toBe('');
      expect(getNormalTimeString('13:00am')).toBe('');
      expect(getNormalTimeString('-1:00am')).toBe('');
      expect(getNormalTimeString('24:00')).toBe('');
      expect(getNormalTimeString('00:00am')).toBe('');
    });

    it('should return normalized timestring', () => {
      expect(getNormalTimeString('1:00am')).toBe('01:00');
      expect(getNormalTimeString('3:01pm')).toBe('15:01');
      expect(getNormalTimeString('03:00')).toBe('03:00');
      expect(getNormalTimeString('20:39')).toBe('20:39');
    });
  });
});
