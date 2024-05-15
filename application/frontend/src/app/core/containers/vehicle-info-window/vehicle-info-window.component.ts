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

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from 'src/app/reducers';
import { MapActions } from '../../actions';
import { ShipmentRoute, Vehicle } from '../../models';
import ShipmentRouteSelectors from '../../selectors/shipment-route.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { map } from 'rxjs/operators';
import * as fromConfig from '../../selectors/config.selectors';

@Component({
  selector: 'app-vehicle-info-window',
  templateUrl: './vehicle-info-window.component.html',
  styleUrls: ['./vehicle-info-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleInfoWindowComponent implements OnInit {
  @Input() vehicleId: number;

  route$: Observable<ShipmentRoute>;
  vehicle$: Observable<Vehicle>;
  shipmentCount$: Observable<number>;
  timezoneOffset$: Observable<number>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.route$ = this.store.pipe(
      select(ShipmentRouteSelectors.selectRoutesByIds([this.vehicleId])),
      map((routes) => routes[this.vehicleId])
    );
    this.vehicle$ = this.store.pipe(select(fromVehicle.selectById(this.vehicleId)));
    this.shipmentCount$ = this.store.pipe(
      select(ShipmentRouteSelectors.selectRouteShipmentCount(this.vehicleId))
    );
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
  }

  onVehicleClick(vehicle: Vehicle): void {
    this.store.dispatch(MapActions.editPreSolveVehicle({ vehicleId: vehicle.id }));
  }
}
