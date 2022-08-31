/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { boundHasOwnProperty, hasOwnProperty } from '.';

describe('util', () => {
  describe('boundHasOwnProperty', () => {
    it('should return true', () => {
      expect(boundHasOwnProperty({ id: '' }, 'id')).toBe(true);
    });
    it('should return false', () => {
      expect(boundHasOwnProperty({ id: '' }, 'label')).toBe(false);
    });
    it('empty object should return false', () => {
      expect(boundHasOwnProperty({}, 'id')).toBe(false);
    });
  });
  describe('hasOwnProperty', () => {
    it('should return true', () => {
      expect(hasOwnProperty({ id: '' }, 'id')).toBe(true);
    });
    it('should return false', () => {
      expect(hasOwnProperty({ id: '' }, 'label')).toBe(false);
    });
    it('empty object should return false', () => {
      expect(hasOwnProperty({}, 'id')).toBe(false);
    });
  });
});
