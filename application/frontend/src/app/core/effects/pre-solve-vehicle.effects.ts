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

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { exhaustMap, map, mergeMap, take } from 'rxjs/operators';
import {
  MapActions,
  PreSolveVehicleActions,
  ValidationResultActions,
  VehicleOperatorActions,
  VehicleActions,
} from '../actions';
import { PreSolveEditVehicleDialogComponent } from '../containers';
import { Modal, Vehicle } from '../models';
import { Store } from '@ngrx/store';
import { State } from '../../reducers';
import { combineLatest } from 'rxjs';
import * as fromVehicle from 'src/app/core/selectors/vehicle.selectors';
import * as fromVehicleOperator from 'src/app/core/selectors/vehicle-operator.selectors';
import { Update } from '@ngrx/entity';

@Injectable()
export class PreSolveVehicleEffects {
  edit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PreSolveVehicleActions.editVehicle,
          PreSolveVehicleActions.addVehicle,
          MapActions.editPreSolveVehicle,
          ValidationResultActions.editPreSolveVehicle
        ),
        exhaustMap(({ vehicleId }) => {
          const dialogRef = this.dialog.open(PreSolveEditVehicleDialogComponent, {
            id: Modal.EditVehicle,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          });
          dialogRef.componentInstance.vehicleIds = [vehicleId];
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  bulkEdit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PreSolveVehicleActions.editVehicles),
        exhaustMap(({ vehicleIds }) => {
          const dialogRef = this.dialog.open(PreSolveEditVehicleDialogComponent, {
            id: Modal.EditVehicle,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          });
          dialogRef.componentInstance.vehicleIds = vehicleIds;
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  deleteVehicleOperator$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        VehicleOperatorActions.deleteVehicleOperator,
        VehicleOperatorActions.deleteVehicleOperators
      ),
      mergeMap((_action) =>
        combineLatest([
          this.store.select(fromVehicle.selectAll),
          this.store.select(fromVehicleOperator.selectLastDeletedOperatorTypes),
        ]).pipe(take(1))
      ),
      map(([vehicles, deletedVehicleOperatorTypes]) => {
        const updatedVehicles: Update<Vehicle>[] = vehicles.map((vehicle) => {
          const updatedVehicle = { ...vehicle };

          if (updatedVehicle.requiredOperatorTypes) {
            updatedVehicle.requiredOperatorTypes = updatedVehicle.requiredOperatorTypes.filter(
              (val) => !deletedVehicleOperatorTypes.includes(val)
            );
          }
          return {
            id: updatedVehicle.id,
            changes: updatedVehicle,
          };
        });

        return VehicleActions.updateVehicles({
          vehicles: updatedVehicles,
        });
      })
    )
  );

  constructor(private actions$: Actions, private dialog: MatDialog, private store: Store<State>) {}
}
