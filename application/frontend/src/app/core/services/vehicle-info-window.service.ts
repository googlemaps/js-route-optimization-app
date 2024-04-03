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

import { ApplicationRef, EnvironmentInjector, Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { mapVehicleClicked } from '../actions/ui.actions';
import { VehicleInfoWindowComponent } from '../containers/vehicle-info-window/vehicle-info-window.component';
import { selectInfoWindowVehicle } from '../selectors/map.selectors';
import { BaseInfoWindowService } from './base-info-window.service';
import { MapService } from './map.service';

/** Manages lifecycle of vehicle info windows */
@Injectable({
  providedIn: 'root',
})
export class VehicleInfoWindowService extends BaseInfoWindowService<VehicleInfoWindowComponent> {
  constructor(
    injector: EnvironmentInjector,
    applicationRef: ApplicationRef,
    private mapService: MapService,
    private store: Store<State>
  ) {
    super(injector, applicationRef);

    this.store.pipe(select(selectInfoWindowVehicle)).subscribe((vehicle) => this.open(vehicle));
  }

  open(vehicle?: { id: number; position: google.maps.LatLng }): void {
    if (vehicle) {
      this.create(VehicleInfoWindowComponent);
      this.componentRef.instance.vehicleId = vehicle.id;
      this.infoWindow.setPosition(vehicle.position);
      this.infoWindow.open(this.mapService.map);
    } else {
      this.clear();
    }
  }

  onClose(): void {
    this.store.dispatch(mapVehicleClicked({ id: null }));
    super.onClose();
  }
}
