/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Long from 'long';
import { createTimestamp } from './dispatcher';

describe('dispacter util', () => {
  describe('createTimestamp', () => {
    it('should return null', () => {
      expect(createTimestamp(null)).toBeNull();
    });

    it('should convert number to timestamp', () => {
      expect(createTimestamp(100)).toEqual({ seconds: '100' });
    });

    it('should convert long to timestamp', () => {
      expect(createTimestamp(Long.fromValue(253))).toEqual({ seconds: '253' });
    });
  });
});
