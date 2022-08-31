/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { splitLabel } from 'src/app/util';

/** Splits a label */
@Pipe({ name: 'splitLabel' })
export class SplitLabelPipe implements PipeTransform {
  transform(value: string): string[] {
    return splitLabel(value) || [];
  }
}
