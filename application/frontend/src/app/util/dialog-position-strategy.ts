/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DialogPosition } from '@angular/material/dialog';

export const positionTopLeftRelativeToTopRight = (relativeTo: HTMLElement): DialogPosition => {
  if (relativeTo == null) {
    return null;
  }
  const clientRect = relativeTo.getBoundingClientRect();
  return { top: clientRect.top + 4 + 'px', left: clientRect.right + 'px' };
};

export const positionTopLeftRelativeToTopLeft = (relativeTo: HTMLElement): DialogPosition => {
  if (relativeTo == null) {
    return null;
  }
  const clientRect = relativeTo.getBoundingClientRect();
  return { top: clientRect.top + 4 + 'px', left: clientRect.left + 'px' };
};
