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

import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { EditVisitActions } from 'src/app/core/actions';
import { Shipment, Vehicle, Visit, VisitRequest } from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromEditVisit from 'src/app/core/selectors/edit-visit.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromRoot from 'src/app/reducers';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';

@Component({
  selector: 'app-edit-visit-dialog',
  templateUrl: './edit-visit-dialog.component.html',
  styleUrls: ['./edit-visit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditVisitDialogComponent implements OnInit, OnDestroy {
  readonly disabled$: Observable<boolean>;
  readonly shipment$: Observable<Shipment>;
  readonly pickup$: Observable<Visit>;
  readonly pickupRequest$: Observable<VisitRequest>;
  readonly delivery$: Observable<Visit>;
  readonly deliveryRequest$: Observable<VisitRequest>;
  readonly vehicles$: Observable<Vehicle[]>;
  readonly timezoneOffset$: Observable<number>;
  readonly globalDuration$: Observable<[Long, Long]>;
  readonly savePending$: Observable<boolean>;
  readonly saveError$: Observable<any>;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    private dialogRef: MatDialogRef<EditVisitDialogComponent>,
    public elementRef: ElementRef,
    private store: Store<fromRoot.State>
  ) {
    this.disabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled), take(1));
    this.shipment$ = this.store.pipe(select(fromEditVisit.selectVisitShipment), take(1));
    this.pickup$ = this.store.pipe(select(fromEditVisit.selectVisitPickup), take(1));
    this.pickupRequest$ = this.store.pipe(select(fromEditVisit.selectVisitPickupRequest), take(1));
    this.delivery$ = this.store.pipe(select(fromEditVisit.selectVisitDelivery), take(1));
    this.deliveryRequest$ = this.store.pipe(
      select(fromEditVisit.selectVisitDeliveryRequest),
      take(1)
    );
    this.vehicles$ = this.store.pipe(
      select(PreSolveVehicleSelectors.selectRequestedVehicles),
      take(1)
    );
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
    this.globalDuration$ = this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration));
    this.savePending$ = this.store.pipe(select(fromEditVisit.selectSavePending));
    this.saveError$ = this.store.pipe(select(fromEditVisit.selectSaveError));
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.store
        .pipe(
          select(fromEditVisit.selectCommitChanges),
          filter((changes) => changes != null),
          take(1)
        )
        .subscribe((changes) => {
          // Letting the component handle the save changes this way to avoid the
          // ability for a save/commit to occur while the dialog is still open,
          // thus preventing a save -> commit -> cancel sequence of actions.
          this.unsubscribe();
          this.dialogRef.close(changes);
        }),

      this.dialogRef.backdropClick().subscribe((event) => {
        event.stopImmediatePropagation();
        this.onCancel();
      })
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe();
  }

  onCancel(): void {
    this.unsubscribe();
    this.dialogRef.close();
    this.store.dispatch(EditVisitActions.cancel());
  }

  onDetail({ shipmentId }: { shipmentId: number }): void {
    this.store.dispatch(EditVisitActions.editShipment({ shipmentId }));
  }

  onSave({ visits }: { visits: Visit[] }): void {
    this.store
      .pipe(select(fromEditVisit.selectVisitShipmentRouteChanges(visits)), take(1))
      .subscribe((changes) => this.store.dispatch(EditVisitActions.save(changes)));
  }

  private unsubscribe(): void {
    this.subscriptions.splice(0).forEach((subscription) => subscription.unsubscribe());
  }
}
