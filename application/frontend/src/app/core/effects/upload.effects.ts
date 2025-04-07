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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { concatMap, exhaustMap, filter, first, mergeMap, mergeMapTo } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { WelcomePageActions } from 'src/app/welcome/actions';
import {
  ConfigActions,
  DispatcherActions,
  DispatcherApiActions,
  RequestSettingsActions,
  ShipmentModelActions,
  UploadActions,
} from '../actions';
import { CsvUploadDialogComponent, UploadDialogComponent } from '../containers';
import { Modal } from '../models';
import { UploadType } from '../models/upload';
import * as fromUI from '../selectors/ui.selectors';
import { MessageService, NormalizationService } from '../services';
import { forkJoin, of } from 'rxjs';

@Injectable()
export class UploadEffects {
  openCsvDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UploadActions.openCsvDialog),
      mergeMapTo(this.store.pipe(select(fromUI.selectModal), first())),
      filter((modal) => modal === Modal.CsvUpload && !this.dialog.getDialogById(Modal.CsvUpload)),
      exhaustMap(() =>
        this.dialog
          .open(CsvUploadDialogComponent, {
            id: Modal.CsvUpload,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          })
          .afterClosed()
      ),
      mergeMap((dialogResult) =>
        forkJoin([
          of(dialogResult),
          this.store.pipe(select(fromUI.selectOpenUploadDialogOnClose), first()),
        ])
      ),
      mergeMap(([dialogResult, openUploadDialog]) => {
        if (!dialogResult) {
          if (openUploadDialog) {
            return [UploadActions.openDialog()];
          }
          return [];
        }
        const actions: Action[] = [UploadActions.closeCsvDialog()];
        actions.push(ConfigActions.setTimezone({ newTimezone: dialogResult.timezone }));
        actions.push(DispatcherActions.uploadScenarioSuccess({ scenario: dialogResult.scenario }));
        return actions;
      })
    )
  );

  openDialog$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UploadActions.openDialog, WelcomePageActions.openUploadDialog),
      mergeMapTo(this.store.pipe(select(fromUI.selectModal), first())),
      filter((modal) => modal === Modal.Upload && !this.dialog.getDialogById(Modal.Upload)),
      exhaustMap(() =>
        this.dialog
          .open(UploadDialogComponent, {
            id: Modal.Upload,
            width: '700px',
          })
          .afterClosed()
      ),
      mergeMap((dialogResult: { uploadType: UploadType; content: any; scenarioName: string }) => {
        const actions: Action[] = [UploadActions.closeDialog()];
        if (dialogResult) {
          switch (dialogResult.uploadType) {
            case UploadType.Scenario: {
              const { normalizedScenario } = this.normalizationService.normalizeScenario(
                dialogResult.content,
                Date.now()
              );

              actions.push(
                DispatcherActions.uploadScenarioSuccess({
                  scenario: normalizedScenario,
                  scenarioName: dialogResult.scenarioName,
                })
              );
              break;
            }
            case UploadType.ScenarioSolutionPair: {
              const { scenario, solution } = dialogResult.content;

              const requestTime = Date.now();
              const { shipments, vehicles, normalizedScenario } =
                this.normalizationService.normalizeScenario(scenario, requestTime);
              const requestedShipmentIds = shipments.filter((s) => !s.ignore).map((s) => s.id);
              const requestedVehicleIds = vehicles.filter((v) => !v.ignore).map((v) => v.id);

              actions.push(
                DispatcherActions.uploadScenarioSuccess({
                  scenario: normalizedScenario,
                  scenarioName: dialogResult.scenarioName,
                })
              );
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
              break;
            }
          }
        }
        return actions;
      })
    )
  );

  loadScenario$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DispatcherActions.uploadScenarioSuccess),
      concatMap(({ scenario }) => {
        const changeTime = Date.now();
        const {
          firstSolutionRoutes,
          injectedModelConstraint,
          injectedSolution,
          label,
          searchMode,
          shipments,
          shipmentModel,
          solvingMode,
          timeout,
          traffic,
          vehicles,
          visitRequests,
          allowLargeDeadlineDespiteInterruptionRisk,
          interpretInjectedSolutionsUsingLabels,
          populateTransitionPolylines,
          useGeodesicDistances,
          geodesicMetersPerSecond,
        } = this.normalizationService.normalizeScenario(scenario, changeTime);

        // Restore selections to anything that isn't ignored
        const selectedShipments: number[] = [];
        shipments.forEach((shipment) => {
          if (!shipment.ignore) {
            selectedShipments.push(shipment.id);
          }
        });
        const selectedVehicles: number[] = [];
        vehicles.forEach((vehicle) => {
          if (!vehicle.ignore) {
            selectedVehicles.push(vehicle.id);
          }
        });

        if (injectedModelConstraint?.routes) {
          this.messageService.warning(
            'The uploaded scenario contains injected routes, which will be ignored by the application.',
            { duration: null, verticalPosition: 'bottom' }
          );
        }

        return [
          DispatcherActions.loadScenario({
            shipments,
            vehicles,
            visitRequests,
            selectedShipments,
            selectedVehicles,
            changeTime,
          }),
          RequestSettingsActions.setRequestSettings({
            firstSolutionRoutes,
            injectedModelConstraint,
            injectedSolution,
            label,
            searchMode,
            solvingMode,
            timeout,
            traffic,
            allowLargeDeadlineDespiteInterruptionRisk,
            interpretInjectedSolutionsUsingLabels,
            populateTransitionPolylines,
            useGeodesicDistances,
            geodesicMetersPerSecond,
          }),
          ShipmentModelActions.setShipmentModel(shipmentModel),
        ];
      })
    )
  );

  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private normalizationService: NormalizationService,
    private store: Store<fromRoot.State>,
    private messageService: MessageService
  ) {}
}
