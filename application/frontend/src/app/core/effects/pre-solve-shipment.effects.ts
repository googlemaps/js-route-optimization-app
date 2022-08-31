/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { exhaustMap, map, mergeMap, take } from 'rxjs/operators';
import {
  EditVisitActions,
  MapActions,
  PreSolveShipmentActions,
  ShipmentsMetadataActions,
  ValidationResultActions,
  VehicleActions,
} from '../actions';
import { PreSolveEditShipmentDialogComponent } from '../containers';
import { Modal, Shipment } from '../models';
import * as fromRoot from 'src/app/reducers';
import * as fromShipment from 'src/app/core/selectors/shipment.selectors';
import * as fromVehicle from 'src/app/core/selectors/vehicle.selectors';
import { combineLatest } from 'rxjs';

@Injectable()
export class PreSolveShipmentEffects {
  deleteVehicle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleActions.deleteVehicle, VehicleActions.deleteVehicles),
      mergeMap((_action) =>
        combineLatest([
          this.store.select(fromShipment.selectAll),
          this.store.select(fromVehicle.selectLastDeletedIndices),
        ]).pipe(take(1))
      ),
      map(([shipments, deletedVehicleIndices]) => {
        const updatedShipments: Shipment[] = shipments.map((shipment) => {
          const updatedShipment = { ...shipment };

          if (updatedShipment.allowedVehicleIndices) {
            updatedShipment.allowedVehicleIndices = this.removeDeletedAllowedVehicleIndices(
              updatedShipment.allowedVehicleIndices,
              deletedVehicleIndices
            );
          }

          if (updatedShipment.costsPerVehicleIndices) {
            const { costsPerVehicleIndices, costsPerVehicle } = this.removeDeletedCostPerVehicle(
              updatedShipment.costsPerVehicle,
              updatedShipment.costsPerVehicleIndices,
              deletedVehicleIndices
            );
            updatedShipment.costsPerVehicle = costsPerVehicle;
            updatedShipment.costsPerVehicleIndices = costsPerVehicleIndices;
          }
          return updatedShipment;
        });

        return PreSolveShipmentActions.saveShipments({
          changes: {
            shipment: {
              upsert: updatedShipments,
            },
            visitRequest: {
              upsert: [],
              delete: [],
            },
          },
          changeTime: Date.now(),
        });
      })
    )
  );

  edit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PreSolveShipmentActions.editShipment,
          PreSolveShipmentActions.addShipment,
          MapActions.editPreSolveShipment,
          ValidationResultActions.editPreSolveShipment,
          EditVisitActions.editShipment,
          ShipmentsMetadataActions.editShipment
        ),
        exhaustMap((action) => {
          const dialogRef = this.dialog.open(PreSolveEditShipmentDialogComponent, {
            id: Modal.EditShipment,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          });
          dialogRef.componentInstance.shipmentIds = [action.shipmentId];
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  bulkEdit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PreSolveShipmentActions.editShipments),
        exhaustMap((action) => {
          const dialogRef = this.dialog.open(PreSolveEditShipmentDialogComponent, {
            id: Modal.EditShipment,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          });
          dialogRef.componentInstance.shipmentIds = action.shipmentIds;
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  removeDeletedCostPerVehicle(
    costsPerVehicle: number[],
    costsPerVehicleIndices: number[],
    deletedVehicleIndices: number[]
  ): { costsPerVehicle: number[]; costsPerVehicleIndices: number[] } {
    const updatedCostsPerVehicle = [...costsPerVehicle];
    const updatedCostsPerVehicleIndices = [...costsPerVehicleIndices];

    deletedVehicleIndices.forEach((deletedIndex) => {
      const idx = updatedCostsPerVehicleIndices.indexOf(deletedIndex);
      if (idx >= 0) {
        updatedCostsPerVehicleIndices.splice(idx, 1);
        updatedCostsPerVehicle.splice(idx, 1);
      }
    });

    updatedCostsPerVehicleIndices.forEach((vehicleIndex, i) => {
      const shift = deletedVehicleIndices.reduce(
        (count, deleteIndex) => count + (deleteIndex <= vehicleIndex ? 1 : 0),
        0
      );
      updatedCostsPerVehicleIndices[i] = vehicleIndex - shift;
    });

    return {
      costsPerVehicle: updatedCostsPerVehicle,
      costsPerVehicleIndices: updatedCostsPerVehicleIndices,
    };
  }

  removeDeletedAllowedVehicleIndices(
    vehicleIndices: number[],
    deletedVehicleIndices: number[]
  ): number[] {
    const updatedIndices = [...vehicleIndices];
    // Remove any deleted vehicle indices
    // then shift remaining values by number of deletions below that index
    deletedVehicleIndices.forEach((deletedIndex) => {
      const idx = updatedIndices.indexOf(deletedIndex);
      if (idx >= 0) {
        updatedIndices.splice(idx, 1);
      }
    });

    return updatedIndices.map((vehicleIndex) => {
      const shift = deletedVehicleIndices.reduce(
        (count, deleteIndex) => count + (deleteIndex <= vehicleIndex ? 1 : 0),
        0
      );
      return vehicleIndex - shift;
    });
  }

  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private store: Store<fromRoot.State>
  ) {}
}
