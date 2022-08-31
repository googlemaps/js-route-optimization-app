/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { replaceAll } from '.';

describe('util', () => {
  describe('replaceAll', () => {
    it('should do nothing', () => {
      expect(replaceAll('test', '', '')).toBe('test');
    });
    it('should return blank', () => {
      expect(replaceAll('test', 'test', '')).toBe('');
    });
    it('should replace characters', () => {
      expect(replaceAll('test-one', '-', ':')).toBe('test:one');
    });
  });
});
