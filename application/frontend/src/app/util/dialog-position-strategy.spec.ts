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

import { LegacyDialogPosition as DialogPosition } from '@angular/material/legacy-dialog';
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
