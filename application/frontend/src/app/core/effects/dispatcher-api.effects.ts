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
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { defer, Observable, of, race } from 'rxjs';
import {
  catchError,
  map,
  retryWhen,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromRoot from 'src/app/reducers';
import { grpcRetryPredicate, retryStrategy } from 'src/app/util';
import { DispatcherActions, DispatcherApiActions, EditVisitActions } from '../actions';
import {
  applySolution,
  optimizeTours,
  optimizeToursFailure,
  optimizeToursSuccess,
} from '../actions/dispatcher-api.actions';
import { loadSolution } from '../actions/dispatcher.actions';
import ShipmentSelectors from '../selectors/shipment.selectors';
import * as fromVehicle from '../selectors/vehicle.selectors';
import { NormalizationService, OptimizeToursMessageService } from '../services';
import { DispatcherClient } from '../services/dispatcher-client';

@Injectable()
export class DispatcherApiEffects {
  optimizeTours$ = createEffect(() =>
    this.actions$.pipe(
      ofType(optimizeTours),
      withLatestFrom(
        this.store.pipe(select(PreSolveShipmentSelectors.selectSelected)),
        this.store.pipe(select(PreSolveVehicleSelectors.selectSelected))
      ),
      switchMap(([{ scenario }, requestedShipmentIds, requestedVehicleIds]) => {
        return race<Action>(
          // Deferred to recreate the inner observable when retried
          defer(() => this.dispatcherClient.optimizeTours(scenario, Date.now())).pipe(
            map((elapsedSolution) =>
              optimizeToursSuccess({
                elapsedSolution,
                requestedShipmentIds,
                requestedVehicleIds,
              })
            )
          )
        ).pipe(
          retryWhen(retryStrategy({ duration: 1000, retryPredicate: grpcRetryPredicate })),
          catchError((error: any) => of(optimizeToursFailure({ error }))),
          takeUntil(this.detectOptimizeToursCancel())
        );
      })
    )
  );

  optimizeToursFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(optimizeToursFailure, EditVisitActions.saveFailure),
        tap(({ error }) => {
          this.optimizeToursMessageService.error(error);
        })
      ),
    { dispatch: false }
  );

  generateMessagesForSolution$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loadSolution),
        tap(({ elapsedSolution }) => {
          const { scenario, solution } = elapsedSolution;
          this.optimizeToursMessageService.generateMessagesForSolution(solution, scenario);
        })
      ),
    { dispatch: false }
  );

  /** @remarks
   * Request state must not be modified from when the request was made and this
   * effect run (if the request was successful); otherwise, the association between
   * request/response will be incoherent.
   */
  loadSolution$ = createEffect(() =>
    this.actions$.pipe(
      ofType(applySolution, optimizeToursSuccess),
      withLatestFrom(
        this.store.pipe(select(fromVehicle.selectIds)),
        this.store.pipe(select(ShipmentSelectors.selectAll))
      ),
      map(
        ([
          { elapsedSolution, requestedShipmentIds, requestedVehicleIds },
          vehicleIds,
          shipments,
        ]) => {
          const { solution, timeOfResponse } = elapsedSolution;
          const { shipmentRoutes, visits, skippedShipments, skippedShipmentReasons } =
            this.normalizationService.normalizeSolution(
              solution,
              vehicleIds as number[],
              shipments,
              timeOfResponse
            );
          return DispatcherActions.loadSolution({
            elapsedSolution,
            requestedShipmentIds,
            requestedVehicleIds,
            shipmentRoutes,
            visits,
            skippedShipments,
            skippedShipmentReasons,
          });
        }
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dispatcherClient: DispatcherClient,
    private normalizationService: NormalizationService,
    private optimizeToursMessageService: OptimizeToursMessageService,
    private store: Store<fromRoot.State>
  ) {}

  private detectOptimizeToursCancel(): Observable<any> {
    return this.actions$.pipe(
      ofType(DispatcherActions.uploadScenarioSuccess, DispatcherApiActions.optimizeToursCancel)
    );
  }
}
