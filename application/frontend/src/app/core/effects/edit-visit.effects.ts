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
import * as fromRoot from 'src/app/reducers';
import { grpcRetryPredicate, retryStrategy } from 'src/app/util';
import {
  DispatcherActions,
  EditVisitActions,
  MainNavActions,
  MapActions,
  RoutesChartActions,
} from '../actions';
import { EditVisitDialogComponent } from '../containers/edit-visit-dialog/edit-visit-dialog.component';
import { Modal, ShipmentRoute, Visit } from '../models';
import { ElapsedSolution } from '../models/elapsed-solution';
import DenormalizeSelectors from '../selectors/denormalize.selectors';
import * as fromVehicle from '../selectors/vehicle.selectors';
import { DispatcherClient } from '../services';

@Injectable()
export class EditVisitEffects {
  open$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoutesChartActions.editVisit, MapActions.editVisit),
      exhaustMap(() =>
        this.dialog
          .open(EditVisitDialogComponent, {
            id: Modal.EditVisit,
          })
          .afterClosed()
          .pipe(
            switchMap((changes?: { visits: Visit[]; shipmentRoutes: ShipmentRoute[] }) => {
              return changes ? of(EditVisitActions.commitChanges(changes)) : EMPTY;
            })
          )
      )
    )
  );

  saveChanges$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EditVisitActions.save),
      exhaustMap((changes) => race(this.saveChanges(changes), this.detectSaveCancel()))
    )
  );

  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private dispatcherClient: DispatcherClient,
    private store: Store<fromRoot.State>
  ) {}

  private saveChanges(changes: {
    shipmentRoutes: ShipmentRoute[];
    visits: Visit[];
  }): Observable<Action> {
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
          map((commitChanges) => EditVisitActions.saveSuccess(commitChanges)),
          retryWhen(
            retryStrategy({ duration: 1000, retryPredicate: (error) => grpcRetryPredicate(error) })
          ),
          catchError((error) => of(EditVisitActions.saveFailure({ error })))
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
        EditVisitActions.cancel
      ),
      take(1),
      map(() => EditVisitActions.saveCancel())
    );
  }
}
