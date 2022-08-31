/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from 'src/app/reducers';
import { MapActions } from '../../actions';
import { Vehicle } from '../../models';
import ShipmentRouteSelectors from '../../selectors/shipment-route.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';

@Component({
  selector: 'app-vehicle-info-window',
  templateUrl: './vehicle-info-window.component.html',
  styleUrls: ['./vehicle-info-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleInfoWindowComponent implements OnInit {
  @Input() vehicleId: number;

  vehicle$: Observable<Vehicle>;
  shipmentCount$: Observable<number>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.vehicle$ = this.store.pipe(select(fromVehicle.selectById(this.vehicleId)));
    this.shipmentCount$ = this.store.pipe(
      select(ShipmentRouteSelectors.selectRouteShipmentCount(this.vehicleId))
    );
  }

  onVehicleClick(vehicle: Vehicle): void {
    this.store.dispatch(MapActions.editPreSolveVehicle({ vehicleId: vehicle.id }));
  }
}
