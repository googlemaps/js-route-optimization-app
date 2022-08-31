/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { formatDispatcherLatLng } from 'src/app/util';
import { google } from '@google-cloud/optimization/build/protos/protos';

/** Formats a CFR lat lng value */
@Pipe({ name: 'formatLatLng' })
export class FormatLatLngPipe implements PipeTransform {
  transform(value: google.type.ILatLng): string {
    return formatDispatcherLatLng(value);
  }
}
