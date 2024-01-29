/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
