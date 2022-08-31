/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DialogPosition } from '@angular/material/dialog';
import { positionTopLeftRelativeToTopLeft, positionTopLeftRelativeToTopRight } from '.';

describe('util', () => {
  const dialogPosition: DialogPosition = { top: '4px', left: '0px' };
  const htmlElement = document.createElement('div');
  describe('positionTopLeftRelativeToTopRight', () => {
    it('should return null', () => {
      expect(positionTopLeftRelativeToTopRight(null)).toBe(null);
    });
    it('should return position', () => {
      expect(positionTopLeftRelativeToTopRight(htmlElement)).toEqual(dialogPosition);
    });
  });
  describe('positionTopLeftRelativeToTopLeft', () => {
    it('should return null', () => {
      expect(positionTopLeftRelativeToTopLeft(null)).toBe(null);
    });
    it('should return position', () => {
      expect(positionTopLeftRelativeToTopLeft(htmlElement)).toEqual(dialogPosition);
    });
  });
});
