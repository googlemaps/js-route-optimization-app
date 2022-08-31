/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { google } from '@google-cloud/optimization/build/protos/protos';

export interface ExtendedConversionOptions extends protobuf.IConversionOptions {
  canonical?: boolean;
}

export function isCanonicalDuration(object: google.protobuf.IDuration): boolean {
  return typeof object === 'string';
}

export function isCanonicalTimestamp(object: google.protobuf.ITimestamp): boolean {
  return typeof object === 'string';
}
