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
import { combineLatest, forkJoin } from 'rxjs';
import { selectPostSolveMapLayers } from '../selectors/map.selectors';
import { TravelMode, Vehicle } from '../models';
import { MapLayer, MapLayerId } from '../models/map';

@Injectable({
  providedIn: 'root',
})
export class PostSolveVehicleLayer extends BaseVehicleLayer {
  constructor(mapService: MapService, store: Store<State>, zone: NgZone) {
    super(mapService, store, zone);
    combineLatest([
      this.store.select(selectFilteredVehicles),
      this.store.select(selectPostSolveMapLayers)
    ]).subscribe(([vehicles, mapLayers]) => {
      this.onDataFiltered(vehicles.filter(vehicle => this.isVehicleTravelModeVisible(vehicle, mapLayers)));
    });

    combineLatest([
      this.store.select(selectFilteredVehiclesSelected),
      this.store.select(selectPostSolveMapLayers)
    ]).subscribe(([vehicles, mapLayers]) => {
      this.onDataSelected(vehicles.filter(vehicle => this.isVehicleTravelModeVisible(vehicle, mapLayers)));
    });
  }

  isVehicleTravelModeVisible(vehicle: Vehicle, mapLayers: { [id in MapLayerId]: MapLayer }): boolean {
    return (vehicle.travelMode ?? TravelMode.DRIVING) === TravelMode.DRIVING ? mapLayers[MapLayerId.PostSolveFourWheel].visible : mapLayers[MapLayerId.PostSolveWalking].visible;
  }

  layerId = 'post-solve-vehicles';
}
