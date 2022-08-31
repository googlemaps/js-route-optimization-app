/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, select, Store } from '@ngrx/store';
import { EMPTY, Observable, of, race } from 'rxjs';
import {
  catchError,
  exhaustMap,
  map,
  retryWhen,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators';
import { State } from 'src/app/reducers';
import {
  durationSeconds,
  getAvailableTimeRange,
  grpcRetryPredicate,
  retryStrategy,
} from 'src/app/util';
import { DispatcherActions, MainNavActions, PoiActions } from '../actions';
import { ShipmentRoute, Visit } from '../models';
import { ElapsedSolution } from '../models/elapsed-solution';
import DenormalizeSelectors from '../selectors/denormalize.selectors';
import * as fromEditVisit from '../selectors/edit-visit.selectors';
import * as fromPointOfInterest from '../selectors/point-of-interest.selectors';
import * as fromScenario from '../selectors/scenario.selectors';
import * as fromVehicle from '../selectors/vehicle.selectors';
import { DispatcherClient, OptimizeToursMessageService } from '../services';
import ShipmentModelSelectors from '../selectors/shipment-model.selectors';

@Injectable()
export class PointOfInterestEffects {
  endDrag$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PoiActions.endDrag),
      withLatestFrom(
        this.store.pipe(select(fromPointOfInterest.selectDragStart)),
        this.store.pipe(select(fromPointOfInterest.selectDragVisitsToEdit)),
        this.store.pipe(select(fromPointOfInterest.selectVehicleByOverlap)),
        this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration)),
        this.store.pipe(select(fromScenario.selectChangeDisabled))
      ),
      switchMap(
        ([{ dragEnd }, dragStart, visitsToEdit, vehicle, globalDuration, changeDisabled]) => {
          if (vehicle == null) {
            return EMPTY;
          }
          if (changeDisabled) {
            return EMPTY;
          }

          const changedVisits: Visit[] = [];
          const startX = dragStart.mousePosition[0];
          const endX = dragEnd.mousePosition[0];
          const deltaTime = startX !== endX ? (endX - startX) * dragStart.secondsPerPixel : 0;
          const vehicleAvailability = getAvailableTimeRange(
            globalDuration,
            vehicle.startTimeWindows,
            vehicle.endTimeWindows
          );

          for (const visitToEdit of visitsToEdit) {
            const changedVisit = { ...visitToEdit };
            if (visitToEdit.shipmentRouteId !== vehicle.id) {
              changedVisit.shipmentRouteId = vehicle.id;
            }
            if (deltaTime) {
              const newTime = durationSeconds(visitToEdit.startTime).add(deltaTime);
              if (
                newTime.lessThan(vehicleAvailability.start) ||
                newTime.greaterThan(vehicleAvailability.end)
              ) {
                // Invalid visit time, cancel
                return EMPTY;
              }
              const newDate = new Date(newTime.toNumber() * 1000);
              newDate.setUTCSeconds(0);
              changedVisit.startTime = { seconds: newDate.getTime() / 1000 };
            }
            changedVisits.push(changedVisit);
          }
          return of(changedVisits);
        }
      ),
      switchMap((changedVisits) =>
        this.store.pipe(
          select(fromEditVisit.selectVisitShipmentRouteChanges(changedVisits)),
          take(1),
          map((changes) => PoiActions.save(changes))
        )
      )
    )
  );

  saveChanges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PoiActions.save),
      exhaustMap((changes) => race(this.saveChanges(changes), this.detectSaveCancel()))
    )
  );

  constructor(
    private actions$: Actions,
    private dispatcherClient: DispatcherClient,
    private optimizeToursMessageService: OptimizeToursMessageService,
    private store: Store<State>
  ) {}

  private saveChanges(changes: {
    shipmentRoutes: ShipmentRoute[];
    visits: Visit[];
  }): Observable<any> {
    const { shipmentRoutes, visits } = changes;
    // Recalculate shipment route polylines
    return this.store.pipe(
      select(DenormalizeSelectors.selectRequestRecalculatePolylines(shipmentRoutes, visits)),
      take(1),
      withLatestFrom(this.store.pipe(select(fromVehicle.selectIds))),
      switchMap(([scenario, vehicleIds]) => {
        // vehicleIds must reflect the vehicle indexes of the request; because
        // all requests include all vehicles and use ignore as needed, we use
        // the array of ids.
        return this.dispatcherClient.optimizeTours(scenario, Date.now()).pipe(
          map((elapsedSolution) =>
            this.applyPolylineChanges(changes, vehicleIds as number[], elapsedSolution)
          ),
          map((commitChanges) => PoiActions.saveSuccess(commitChanges)),
          retryWhen(
            retryStrategy({ duration: 1000, retryPredicate: (error) => grpcRetryPredicate(error) })
          ),
          catchError((error) => {
            this.optimizeToursMessageService.error(error);
            return of(PoiActions.saveFailure({ error }));
          })
        );
      })
    );
  }

  private applyPolylineChanges(
    changes: { shipmentRoutes: ShipmentRoute[]; visits: Visit[] },
    vehicleIds: number[],
    elapsedSolution: ElapsedSolution
  ): { shipmentRoutes: ShipmentRoute[]; visits: Visit[] } {
    const { solution } = elapsedSolution;
    const updates: ShipmentRoute[] = [];
    for (const route of solution.routes) {
      const vehicleId = vehicleIds[route.vehicleIndex || 0];
      const updateShipmentRoute = changes.shipmentRoutes.find(
        (shipmentRoute) => shipmentRoute.id === vehicleId
      );
      if (updateShipmentRoute) {
        updates.push({
          ...updateShipmentRoute,
          routePolyline: route.routePolyline,
        });
      }
    }
    return { visits: changes.visits, shipmentRoutes: updates };
  }

  private detectSaveCancel(): Observable<Action> {
    return this.actions$.pipe(
      ofType(
        DispatcherActions.uploadScenarioSuccess,
        MainNavActions.solve,
        DispatcherActions.clearSolution
      ),
      take(1),
      map(() => PoiActions.saveCancel())
    );
  }
}
