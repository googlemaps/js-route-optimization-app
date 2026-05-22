/*
Copyright 2026 Google LLC

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
