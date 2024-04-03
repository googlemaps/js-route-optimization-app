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

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable, Subscription } from 'rxjs';
import * as fromRoot from 'src/app/reducers';
import { Shipment, Vehicle, Visit, VisitRequest } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import ShipmentRouteSelectors from '../../selectors/shipment-route.selectors';
import VisitRequestSelectors from 'src/app/core/selectors/visit-request.selectors';
import VisitSelectors from '../../selectors/visit.selectors';
import * as fromPostSolve from '../../selectors/post-solve.selectors';
import { EditVisitActions, MapActions } from '../../actions';
import PreSolveVehicleSelectors from '../../selectors/pre-solve-vehicle.selectors';
import { filter, mergeMap, take } from 'rxjs/operators';
import { selectVisitShipmentRouteChanges } from '../../selectors/edit-visit.selectors';
import * as fromEditVisit from 'src/app/core/selectors/edit-visit.selectors';
import { BaseVisitRequestInfoWindowComponent } from '../../components';

@Component({
  selector: 'app-visit-request-info-window',
  templateUrl: './visit-request-info-window.component.html',
  styleUrls: ['./visit-request-info-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VisitRequestInfoWindowComponent implements OnDestroy, OnInit {
  @ViewChild('baseInfoWindow') baseVisitRequestInfoWindow: BaseVisitRequestInfoWindowComponent;

  @Input() visitRequestId: number;
  @Input() vehicle: any;
  @Output() closeWindow = new EventEmitter();

  visitRequest$: Observable<VisitRequest>;
  shipment$: Observable<Shipment>;
  visit$: Observable<Vehicle>;
  vehicles$: Observable<Vehicle[]>;
  vehicle$: Observable<Vehicle>;
  timezoneOffset$: Observable<number>;
  postSolve$: Observable<boolean>;
  errorSubscription: Subscription;
  savePending$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.shipment$ = this.store.pipe(
      select(VisitRequestSelectors.selectVisitRequestShipment(this.visitRequestId))
    );
    this.visitRequest$ = this.store.pipe(
      select(VisitRequestSelectors.selectById(this.visitRequestId))
    );
    this.visit$ = this.store.pipe(select(VisitSelectors.selectById(this.visitRequestId)));
    this.vehicle$ = this.store.pipe(
      select(ShipmentRouteSelectors.selectVehicleByVisitId(this.visitRequestId))
    );
    this.vehicles$ = this.store.pipe(
      select(PreSolveVehicleSelectors.selectRequestedVehicles),
      take(1)
    );
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
    this.postSolve$ = this.store.pipe(select(fromPostSolve.selectActive));
    this.savePending$ = this.store.pipe(select(fromEditVisit.selectSavePending));

    this.errorSubscription = this.store
      .pipe(select(fromEditVisit.selectSaveError))
      .pipe(filter((err) => err != null))
      .subscribe(() => {
        this.baseVisitRequestInfoWindow?.resetVehicleSelection();
      });
  }

  ngOnDestroy(): void {
    this.errorSubscription?.unsubscribe();
  }

  onShipmentClick(shipment: Shipment): void {
    this.store.dispatch(MapActions.editPreSolveShipment({ shipmentId: shipment.id }));
  }

  onVehicleClick(vehicle: Vehicle): void {
    this.store.dispatch(MapActions.editPreSolveVehicle({ vehicleId: vehicle.id }));
  }

  onVisitClick(visit: Visit): void {
    this.store.dispatch(MapActions.editVisit({ visitId: visit.id }));
  }

  onVehicleAssignmentChange(newVehicle: Vehicle): void {
    this.shipment$
      .pipe(
        mergeMap((shipment) =>
          combineLatest([
            this.store.select(VisitSelectors.selectPickupByShipmentId(shipment.id)),
            this.store.select(VisitSelectors.selectDeliveryByShipmentId(shipment.id)),
          ])
        ),
        mergeMap(([pickup, delivery]) => {
          const changes: Visit[] = [];
          // Ensure that changing one half of a pickup/delivery pair moves both visits to the same vehicle
          if (pickup) {
            changes.push({ ...pickup, shipmentRouteId: newVehicle.id });
          }
          if (delivery) {
            changes.push({ ...delivery, shipmentRouteId: newVehicle.id });
          }

          return this.store.pipe(select(selectVisitShipmentRouteChanges(changes)));
        }),
        mergeMap((changes) => {
          this.store.dispatch(EditVisitActions.save(changes));
          return this.store.pipe(select(fromEditVisit.selectCommitChanges));
        }),
        filter((changes) => changes != null),
        take(1)
      )
      .subscribe((changes) => {
        this.store.dispatch(EditVisitActions.commitChanges(changes));
        this.closeWindow.emit();
      });
  }
}
