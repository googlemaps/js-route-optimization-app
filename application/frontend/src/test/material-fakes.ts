/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { SafeResourceUrl } from '@angular/platform-browser';
import { IconOptions } from '@angular/material/icon';
import { Observable, EMPTY } from 'rxjs';

export class FakeMatIconRegistry {
  addSvgIcon(iconName: string, url: SafeResourceUrl, options?: IconOptions): this {
    return this;
  }

  getNamedSvgIcon(name: string, namespace: string = ''): Observable<SVGElement> {
    return EMPTY;
  }

  getDefaultFontSetClass(): string {
    return '';
  }
}
