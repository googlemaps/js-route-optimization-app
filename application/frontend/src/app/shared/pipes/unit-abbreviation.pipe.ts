/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { getUnitAbbreviation } from 'src/app/util';

@Pipe({ name: 'unitAbbreviation' })
export class UnitAbbreviationPipe implements PipeTransform {
  transform(unit: string, abbreviations?: { [unit: string]: string }): string {
    return getUnitAbbreviation(unit, abbreviations);
  }
}
