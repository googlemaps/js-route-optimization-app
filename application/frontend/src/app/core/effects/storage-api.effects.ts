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
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { EMPTY } from 'rxjs';
import { exhaustMap, mergeMap } from 'rxjs/operators';
import { DispatcherActions, DispatcherApiActions, StorageApiActions } from '../actions';
import { StorageApiSaveLoadDialogComponent } from '../containers/storage-api-save-load-dialog/storage-api-save-load-dialog.component';
import { IOptimizeToursRequest, IOptimizeToursResponse, Modal } from '../models';
import { NormalizationService } from '../services';

@Injectable()
export class StorageApiEffects {
  openLoadDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(StorageApiActions.openLoadDialog),
      exhaustMap(() => {
        const dialogRef = this.buildDialogRef();
        dialogRef.componentInstance.saving = false;
        return dialogRef.afterClosed();
      }),
      mergeMap(
        (dialogResult: {
          scenario: IOptimizeToursRequest;
          solution?: IOptimizeToursResponse;
          scenarioName: string;
        }) => {
          if (!dialogResult) {
            return EMPTY;
          }
          const requestTime = Date.now();
          const { scenario, solution } = dialogResult;
          const { shipments, vehicles, normalizedScenario } =
            this.normalizationService.normalizeScenario(scenario, requestTime);
          const actions: Action[] = [
            DispatcherActions.uploadScenarioSuccess({
              scenario: normalizedScenario,
              scenarioName: dialogResult.scenarioName,
            }),
          ];
          if (solution) {
            const requestedShipmentIds = shipments.filter((s) => !s.ignore).map((s) => s.id);
            const requestedVehicleIds = vehicles.filter((v) => !v.ignore).map((v) => v.id);
            actions.push(
              DispatcherApiActions.applySolution({
                elapsedSolution: {
                  scenario: normalizedScenario,
                  solution,
                  elapsedTime: 0,
                  requestTime,
                  timeOfResponse: requestTime,
                },
                requestedShipmentIds,
                requestedVehicleIds,
              })
            );
          }
          return actions;
        }
      )
    )
  );

  openSaveDialog$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(StorageApiActions.openSaveDialog),
        exhaustMap(() => {
          const dialogRef = this.buildDialogRef();
          dialogRef.componentInstance.saving = true;
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  buildDialogRef(): MatDialogRef<StorageApiSaveLoadDialogComponent> {
    return this.dialog.open(StorageApiSaveLoadDialogComponent, {
      id: Modal.StorageLoad,
      maxHeight: '100%',
      position: { right: '0' },
      panelClass: 'fly-out-dialog',
    });
  }

  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private normalizationService: NormalizationService
  ) {}
}
