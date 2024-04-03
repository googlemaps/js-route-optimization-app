/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
