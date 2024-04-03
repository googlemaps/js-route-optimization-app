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
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { exhaustMap, filter, map, mergeMap, switchMapTo, take, tap } from 'rxjs/operators';
import { State } from 'src/app/reducers';
import { WelcomePageActions } from 'src/app/welcome/actions';
import {
  DispatcherActions,
  DispatcherApiActions,
  MainNavActions,
  ShipmentActions,
  ValidationResultActions,
  VehicleActions,
  VehicleOperatorActions,
} from '../actions';
import { optimizeTours } from '../actions/dispatcher-api.actions';
import {
  RegenerateConfirmationDialogComponent,
  ValidationResultDialogComponent,
} from '../containers';
import { Modal } from '../models';
import DispatcherApiSelectors from '../selectors/dispatcher-api.selectors';
import RoutesChartSelectors from '../selectors/routes-chart.selectors';
import { selectHasSolution } from '../selectors/solution.selectors';

@Injectable()
export class DispatcherEffects {
  solve$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MainNavActions.solve, ValidationResultActions.solve),
      switchMapTo(this.store.pipe(select(DispatcherApiSelectors.selectSolveContext()), take(1))),
      map((solveContext) => optimizeTours(solveContext))
    )
  );

  navigateToShipments$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DispatcherActions.uploadScenarioSuccess, WelcomePageActions.newScenario),
        tap(() => this.router.navigateByUrl('shipments', { skipLocationChange: true }))
      ),
    { dispatch: false }
  );

  initializeRangeOffset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DispatcherApiActions.applySolution, DispatcherApiActions.optimizeToursSuccess),
      switchMapTo(this.store.pipe(select(RoutesChartSelectors.selectDefaultRangeOffset))),
      map((rangeOffset) => DispatcherActions.initializeRangeOffset({ rangeOffset }))
    )
  );

  navigateToChart$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DispatcherActions.loadSolution),
        tap(() => this.router.navigateByUrl('routesChart', { skipLocationChange: true }))
      ),
    { dispatch: false }
  );

  showWarning$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ValidationResultActions.showWarning),
        exhaustMap(({ validationResult }) => {
          const dialogRef = this.dialog.open(ValidationResultDialogComponent, {
            id: Modal.ValidationResult,
            maxWidth: '420px',
          });
          dialogRef.componentInstance.validationResult = validationResult;
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  confirmRegenerate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(MainNavActions.promptReSolve),
        exhaustMap(() => {
          const dialogRef = this.dialog.open(RegenerateConfirmationDialogComponent, {
            id: Modal.ValidationResult,
            maxWidth: '420px',
          });
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  clearSolution$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        VehicleActions.deleteVehicle,
        VehicleActions.deleteVehicles,
        ShipmentActions.deleteShipment,
        ShipmentActions.deleteShipments,
        VehicleOperatorActions.deleteVehicleOperator,
        VehicleOperatorActions.deleteVehicleOperators
      ),
      mergeMap((_) => this.store.pipe(select(selectHasSolution), take(1))),
      filter((hasSolution) => hasSolution),
      map((_) => DispatcherActions.clearSolution())
    )
  );

  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private store: Store<State>,
    private router: Router
  ) {}
}
