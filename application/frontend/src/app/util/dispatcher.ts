/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { google } from '@google-cloud/optimization/build/protos/protos';
import * as Long from 'long';

const toObjectOptions = { longs: String };

export function createTimestamp(seconds: number | Long): google.protobuf.ITimestamp {
  if (seconds == null) {
    return null;
  }
  const message = google.protobuf.Timestamp.fromObject({ seconds });
  return message && google.protobuf.Timestamp.toObject(message, toObjectOptions);
}
