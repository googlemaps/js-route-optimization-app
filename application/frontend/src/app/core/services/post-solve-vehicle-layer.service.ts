/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable, NgZone } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { MapService } from './map.service';
import {
  selectFilteredVehicles,
  selectFilteredVehiclesSelected,
} from '../selectors/post-solve-vehicle-layer.selectors';
import { BaseVehicleLayer } from './base-vehicle-layer.service';

@Injectable({
  providedIn: 'root',
})
export class PostSolveVehicleLayer extends BaseVehicleLayer {
  constructor(mapService: MapService, store: Store<State>, zone: NgZone) {
    super(mapService, store, zone);
    this.store.pipe(select(selectFilteredVehicles)).subscribe((vehicles) => {
      this.onDataFiltered(vehicles);
    });

    this.store.pipe(select(selectFilteredVehiclesSelected)).subscribe((vehicles) => {
      this.onDataSelected(vehicles);
    });
  }

  layerId = 'post-solve-vehicles';
}
