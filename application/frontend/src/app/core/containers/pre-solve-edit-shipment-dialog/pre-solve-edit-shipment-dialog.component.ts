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

import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Dictionary } from '@ngrx/entity';
import { select, Store } from '@ngrx/store';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { boundHasOwnProperty, bufferBounds, getShipmentEditChanges } from 'src/app/util';
import { PreSolveShipmentActions } from '../../actions';
import { Shipment, ShipmentChanges, Vehicle, Visit, VisitRequest } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import * as fromMap from '../../selectors/map.selectors';
import * as fromScenario from '../../selectors/scenario.selectors';
import ShipmentSelectors, * as fromShipment from '../../selectors/shipment.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import VisitSelectors from '../../selectors/visit.selectors';
import { FormVisitRequestLayer, MessageService } from '../../services';
import * as fromCapacityQuantity from '../../selectors/capacity-quantity.selectors';
import VisitRequestSelectors from '../../selectors/visit-request.selectors';
import { ConfirmBulkEditDialogComponent } from '../../components/confirm-bulk-edit-dialog/confirm-bulk-edit-dialog.component';
import { ShipmentFormFields } from '../../models/shipment-form-fields';

@Component({
  selector: 'app-pre-solve-edit-shipment-dialog',
  templateUrl: './pre-solve-edit-shipment-dialog.component.html',
  styleUrls: ['./pre-solve-edit-shipment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSolveEditShipmentDialogComponent implements OnInit, OnDestroy {
  @Input() shipmentIds: number[];

  abbreviations$: Observable<{ [unit: string]: string }>;
  bulkEditShipments: Shipment[];
  scenarioCapacities$: Observable<Set<string>>;
  scenarioDemands$: Observable<Set<string>>;
  scenarioShipmentTypes$: Observable<string[]>;
  disabled$: Observable<boolean>;
  shipment$: Observable<Shipment>;
  vehicles$: Observable<Dictionary<Vehicle>>;
  vehicleIds$: Observable<number[]>;
  visitRequests$: Observable<VisitRequest[]>;
  pickup$: Observable<Visit>;
  delivery$: Observable<Visit>;
  visitTags$: Observable<string[]>;
  visitTypes$: Observable<string[]>;
  timezoneOffset$: Observable<number>;
  nextVisitRequestId$: Observable<number>;
  bounds$: Observable<google.maps.LatLngBounds>;

  private subscription: Subscription;

  constructor(
    private overwriteDialog: MatDialog,
    private messageService: MessageService,
    private dialogRef: MatDialogRef<PreSolveEditShipmentDialogComponent>,
    private formVisitRequestLayer: FormVisitRequestLayer,
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit(): void {
    this.disabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));

    this.vehicles$ = this.store.pipe(select(fromVehicle.selectEntities), take(1));
    this.vehicleIds$ = this.store.pipe(select(fromVehicle.selectIds), take(1)) as Observable<
      number[]
    >;
    this.visitTags$ = this.store.pipe(select(fromScenario.selectVisitTags), take(1));
    this.visitTypes$ = this.store.pipe(select(fromScenario.selectVisitTypes), take(1));
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
    this.nextVisitRequestId$ = this.store.pipe(
      select(VisitRequestSelectors.selectNextVisitRequestId),
      take(1)
    );
    this.abbreviations$ = this.store.pipe(select(fromConfig.selectUnitAbbreviations));
    this.scenarioCapacities$ = this.store.pipe(select(fromCapacityQuantity.selectUniqueCapacities));
    this.scenarioDemands$ = this.store.pipe(select(fromCapacityQuantity.selectUniqueDemands));
    this.scenarioShipmentTypes$ = this.store.pipe(select(fromScenario.selectShipmentTypes));
    // Form map bounds will remember the initial bounds; buffer layer bounds by 50 meters
    this.bounds$ = this.store.pipe(
      select(fromMap.selectPreSolveEditShipmentFormBounds),
      take(1),
      switchMap((bounds) =>
        this.formVisitRequestLayer.bounds$.pipe(
          startWith(null as google.maps.LatLngBounds),
          map((layerBounds) =>
            layerBounds && !layerBounds.isEmpty() ? bufferBounds(layerBounds, 50) : bounds
          )
        )
      )
    );

    if (this.shipmentIds.length === 1) {
      this.shipment$ = this.store.pipe(
        select(ShipmentSelectors.selectShipmentForEdit(this.shipmentIds[0])),
        take(1)
      );
      this.visitRequests$ = this.store.pipe(
        select(VisitRequestSelectors.selectShipmentsVisitRequests([this.shipmentIds[0]])),
        take(1)
      );
      this.pickup$ = this.store.pipe(
        select(VisitSelectors.selectPickupByShipmentId(this.shipmentIds[0])),
        take(1)
      );
      this.delivery$ = this.store.pipe(
        select(VisitSelectors.selectDeliveryByShipmentId(this.shipmentIds[0])),
        take(1)
      );
    } else {
      this.shipment$ = of({ deliveries: null, id: -1, pickups: null });
      this.store
        .pipe(select(ShipmentSelectors.selectByIds(this.shipmentIds)), take(1))
        .subscribe((shipments) => (this.bulkEditShipments = shipments));
    }

    this.subscription = this.dialogRef.backdropClick().subscribe((event) => {
      event.stopImmediatePropagation();
      this.onCancel();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onCancel(): void {
    this.store.dispatch(PreSolveShipmentActions.cancelEditShipment());
    this.dialogRef.close();
  }

  onSave({
    shipment,
    visitRequests,
    unsetFields,
  }: {
    shipment: Shipment;
    visitRequests: VisitRequest[];
    unsetFields: string[];
  }): void {
    if (this.shipmentIds.length === 1) {
      this.store.pipe(select(fromShipment.selectEntities), take(1)).subscribe((shipments) => {
        const changes = getShipmentEditChanges(shipment, visitRequests, shipments);
        this.store.dispatch(
          PreSolveShipmentActions.saveShipment({ changes, changeTime: Date.now() })
        );
        this.dialogRef.close();
      });
    } else {
      const editedFields = this.getEditedFields(shipment, visitRequests, unsetFields);
      if (editedFields.length === 0) {
        this.dialogRef.close();
        this.messageService.info(this.messageService.messages.noChanges);
      } else {
        this.overwriteDialog
          .open(ConfirmBulkEditDialogComponent, {
            data: {
              fields: editedFields,
              isShipment: true,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              const changes = this.shipmentsToSavedShipments(shipment, visitRequests, unsetFields);
              this.store.dispatch(
                PreSolveShipmentActions.saveShipments({ changes, changeTime: Date.now() })
              );
              this.dialogRef.close();
            }
          });
      }
    }
  }

  private getEditedFields(
    shipment: Shipment,
    visitRequests: VisitRequest[],
    unsetFields: string[]
  ): string[] {
    const fields = [];
    if (visitRequests.length > 0) {
      fields.push('Visit Requests');
    }
    if (shipment.label || unsetFields.includes(ShipmentFormFields.Label)) {
      fields.push('Label');
    }
    if (shipment.shipmentType || unsetFields.includes(ShipmentFormFields.ShipmentType)) {
      fields.push('Shipment Type');
    }
    if (shipment.penaltyCost || unsetFields.includes(ShipmentFormFields.PenaltyCost)) {
      fields.push('Penalty Cost');
    }
    if (
      shipment.allowedVehicleIndices.length > 0 ||
      unsetFields.includes(ShipmentFormFields.AllowedVehicles)
    ) {
      fields.push('Allowed vehicles');
    }
    if (
      shipment.costsPerVehicle ||
      shipment.costsPerVehicleIndices ||
      unsetFields.includes(ShipmentFormFields.CostsPerVehicle)
    ) {
      fields.push('Costs per-vehicle');
    }
    const unsetDeliveryLimits = unsetFields.includes(ShipmentFormFields.PickupToDeliveryLimits);
    if (
      shipment.pickupToDeliveryAbsoluteDetourLimit ||
      shipment.pickupToDeliveryRelativeDetourLimit ||
      shipment.pickupToDeliveryTimeLimit ||
      unsetDeliveryLimits
    ) {
      fields.push('Pickup to delivery limits');
    }
    if (unsetFields.includes(ShipmentFormFields.TimeLimit) && !unsetDeliveryLimits) {
      fields.push('Pickup to delivery - Time limit');
    }
    if (unsetFields.includes(ShipmentFormFields.AbsoluteDetourLimit) && !unsetDeliveryLimits) {
      fields.push('Pickup to delivery - Absolue detour limit');
    }
    if (unsetFields.includes(ShipmentFormFields.RelativeDetourLimit) && !unsetDeliveryLimits) {
      fields.push('Pickup to delivery - Relative detour limit');
    }
    if (
      (shipment.loadDemands && Object.keys(shipment.loadDemands).length > 0) ||
      unsetFields.includes(ShipmentFormFields.LoadDemands)
    ) {
      fields.push('Demands');
    }
    if (shipment.pickups) {
      fields.push('Pickup Requests');
    }
    if (shipment.deliveries) {
      fields.push('Delivery Requests');
    }
    return fields;
  }

  shipmentsToSavedShipments(
    shipment: Shipment,
    visitRequests: VisitRequest[],
    unsetFields: string[]
  ): ShipmentChanges {
    const baseShipment = this.filterUnusedShipmentParams(shipment, unsetFields);

    const newPickups = visitRequests.filter((vr) => vr.pickup);
    const newDeliveries = visitRequests.filter((vr) => !vr.pickup);
    const hasBulkPickups = !!newPickups.length;
    const hasBulkDeliveries = !!newDeliveries.length;

    let visitRequestDeletions = [];
    const newVisitRequests = [];
    let newVisitRequestId = visitRequests[0]?.id;

    // Merge original shipment with updated parameters
    const updatedShipments = this.bulkEditShipments.map((originalShipment) => {
      const updatedShipment = { ...originalShipment, ...baseShipment };

      // If pickups / deliveries have been added via bulk edit, create a copy of each pickup / delivery
      // for each shipment and delete any existing pickups / deliveries
      if (hasBulkPickups) {
        visitRequestDeletions = visitRequestDeletions.concat(originalShipment.pickups);
        updatedShipment.pickups = [];
        newPickups.forEach((vr) => {
          newVisitRequests.push({ ...vr, shipmentId: originalShipment.id, id: newVisitRequestId });
          updatedShipment.pickups.push(newVisitRequestId);
          newVisitRequestId += 1;
        });
      }
      if (hasBulkDeliveries) {
        visitRequestDeletions = visitRequestDeletions.concat(originalShipment.deliveries);
        updatedShipment.deliveries = [];
        newDeliveries.forEach((vr) => {
          newVisitRequests.push({ ...vr, shipmentId: originalShipment.id, id: newVisitRequestId });
          updatedShipment.deliveries.push(newVisitRequestId);
          newVisitRequestId += 1;
        });
      }
      return updatedShipment;
    });

    return {
      shipment: {
        upsert: updatedShipments.map((newShipment) => ({
          ...newShipment,
          changeTime: Date.now(),
        })),
      },
      visitRequest: {
        upsert: newVisitRequests,
        delete: visitRequestDeletions,
      },
    };
  }

  filterUnusedShipmentParams(shipment: Shipment, unsetFields: string[]): Partial<Shipment> {
    const filteredShipment = {};
    Object.keys(shipment).forEach((key) => {
      const param = shipment[key];
      if (
        key !== 'id' &&
        param != null &&
        (!boundHasOwnProperty(param, 'length') ||
          (boundHasOwnProperty(param, 'length') && param.length)) &&
        (!(typeof param == 'object') ||
          (typeof param == 'object' && Object.keys(param).filter((each) => param[each]).length > 0))
      ) {
        filteredShipment[key] = param;
      }
    });
    return this.unsetFields(filteredShipment, unsetFields);
  }

  unsetFields(shipment: Partial<Shipment>, unsetFields: string[]): Partial<Shipment> {
    if (unsetFields.includes(ShipmentFormFields.Label)) {
      shipment.label = null;
    }
    if (unsetFields.includes(ShipmentFormFields.ShipmentType)) {
      shipment.shipmentType = null;
    }
    if (unsetFields.includes(ShipmentFormFields.PenaltyCost)) {
      shipment.penaltyCost = null;
    }
    if (unsetFields.includes(ShipmentFormFields.AllowedVehicles)) {
      shipment.allowedVehicleIndices = null;
    }
    if (unsetFields.includes(ShipmentFormFields.CostsPerVehicle)) {
      shipment.costsPerVehicle = null;
    }
    const unsetDeliveryLimits = unsetFields.includes(ShipmentFormFields.PickupToDeliveryLimits);
    if (unsetDeliveryLimits || unsetFields.includes(ShipmentFormFields.TimeLimit)) {
      shipment.pickupToDeliveryTimeLimit = null;
    }
    if (unsetDeliveryLimits || unsetFields.includes(ShipmentFormFields.AbsoluteDetourLimit)) {
      shipment.pickupToDeliveryAbsoluteDetourLimit = null;
    }
    if (unsetDeliveryLimits || unsetFields.includes(ShipmentFormFields.RelativeDetourLimit)) {
      shipment.pickupToDeliveryRelativeDetourLimit = null;
    }
    if (unsetFields.includes(ShipmentFormFields.LoadDemands)) {
      shipment.loadDemands = null;
    }
    return shipment;
  }
}
