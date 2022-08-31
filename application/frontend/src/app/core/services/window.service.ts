/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';

/**
 * Responsible for access to the native Window object
 */
@Injectable({
  providedIn: 'root',
})
export class WindowService {
  get nativeWindow(): Window | object {
    return window || {};
  }
}
