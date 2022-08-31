/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DomPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { onMapReady } from 'src/app/util';
import { MapService } from './map.service';

@Injectable({ providedIn: 'root' })
export class PdfMapService extends MapService {
  domPortal: DomPortal<any>;

  updateBounds(bounds: google.maps.LatLngBounds, callback?: () => void): void {
    onMapReady(
      this.map,
      () => {
        this.setBounds(bounds);
        callback?.apply(null);
      },
      250
    );
  }
}
