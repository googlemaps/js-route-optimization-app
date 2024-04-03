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
import { select, Store } from '@ngrx/store';
import booleanCrosses from '@turf/boolean-crosses';
import booleanWithin from '@turf/boolean-within';
import { Feature, Point } from '@turf/helpers';
import { of } from 'rxjs';
import { map, mergeMap, withLatestFrom } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import * as fromRouteLayer from '../../core/selectors/route-layer.selectors';
import { PreSolveShipmentActions, PreSolveVehicleActions, RoutesChartActions } from '../actions';
import {
  selectPostSolveMapItems,
  selectPreSolveShipmentMapItems,
  selectPreSolveVehicleMapItems,
} from '../actions/map.actions';
import * as fromPostSolveVisitRequestLayer from '../selectors/post-solve-visit-request-layer.selectors';
import * as fromPreSolveVehicleLayer from '../selectors/pre-solve-vehicle-layer.selectors';
import * as fromPreSolveVisitRequestLayer from '../selectors/pre-solve-visit-request-layer.selectors';

@Injectable()
export class MapEffects {
  constructor(private actions$: Actions, private store: Store<fromRoot.State>) {}

  selectRoutesbyMapBBOX$ = createEffect(() =>
    this.actions$.pipe(
      ofType(selectPostSolveMapItems),
      mergeMap(({ polygon }) => {
        return of({ polygon }).pipe(
          withLatestFrom(
            this.store.pipe(select(fromRouteLayer.selectFilteredRouteTurfLineStrings)),
            this.store.pipe(
              select(fromPostSolveVisitRequestLayer.selectFilteredVisitRequestsTurfPoints)
            )
          )
        );
      }),
      map(([{ polygon }, routes, visitRequests]) => {
        let intersectedRouteIds: number[] = [];
        let missedRouteIds: number[] = [];

        // Step 1: intersect routes with bbox
        intersectedRouteIds = this.getIntersectingRouteIds(routes, polygon);

        // Step 2: intersect visits with bbox
        // skip any visits on routes already intersected above
        const remainingVisitRequests: { [id: number]: Feature<Point> } = {};
        for (const id in visitRequests) {
          if (
            visitRequests[+id].properties.made &&
            !intersectedRouteIds.includes(visitRequests[+id].properties.shipmentRouteId)
          ) {
            remainingVisitRequests[+id] = visitRequests[+id];
          }
        }
        intersectedRouteIds = intersectedRouteIds.concat(
          this.getVisitRequestIntersectingRouteIds(remainingVisitRequests, polygon)
        );

        // diff to get non-intersected routes
        missedRouteIds = Object.keys(routes)
          .filter((id) => !intersectedRouteIds.includes(+id))
          .map((id) => +id);
        return RoutesChartActions.updateRoutesSelection({
          addedRouteIds: intersectedRouteIds,
          removedRouteIds: missedRouteIds,
        });
      })
    )
  );

  selectShipmentsByMapBBOX = createEffect(() =>
    this.actions$.pipe(
      ofType(selectPreSolveShipmentMapItems),
      mergeMap(({ polygon }) => {
        return of({ polygon }).pipe(
          withLatestFrom(
            this.store.pipe(
              select(fromPreSolveVisitRequestLayer.selectFilteredVisitRequestsTurfPoints)
            )
          )
        );
      }),
      map(([{ polygon }, visitRequests]) => {
        let intersectedShipmentIds: number[] = [];
        Object.keys(visitRequests).forEach((id) => {
          if (booleanWithin(visitRequests[+id], polygon)) {
            intersectedShipmentIds.push(visitRequests[+id].properties.shipmentId);
          }
        });
        intersectedShipmentIds = [...new Set(intersectedShipmentIds)];

        // diff to get non-intersected shipments
        let missedShipmentIds: number[] = Object.keys(visitRequests)
          .filter(
            (id) => !intersectedShipmentIds.includes(visitRequests[+id].properties.shipmentId)
          )
          .map((id) => visitRequests[+id].properties.shipmentId);
        missedShipmentIds = [...new Set(missedShipmentIds)];
        return PreSolveShipmentActions.updateShipmentsSelection({
          addedShipmentIds: intersectedShipmentIds,
          removedShipmentIds: missedShipmentIds,
        });
      })
    )
  );

  selectVehiclesByMapBBOX$ = createEffect(() =>
    this.actions$.pipe(
      ofType(selectPreSolveVehicleMapItems),
      mergeMap(({ polygon }) => {
        return of({ polygon }).pipe(
          withLatestFrom(
            this.store.pipe(select(fromPreSolveVehicleLayer.selectFilteredVehiclesTurfPoints))
          )
        );
      }),
      map(([{ polygon }, vehicles]) => {
        let intersectedVehicleIds: number[] = [];
        Object.keys(vehicles).forEach((id) => {
          if (booleanWithin(vehicles[+id], polygon)) {
            intersectedVehicleIds.push(+id);
          }
        });
        intersectedVehicleIds = [...new Set(intersectedVehicleIds)];

        // diff to get non-intersected vehicles
        let missedVehicleIds: number[] = Object.keys(vehicles)
          .filter((id) => !intersectedVehicleIds.includes(+id))
          .map((id) => +id);
        missedVehicleIds = [...new Set(missedVehicleIds)];
        return PreSolveVehicleActions.updateVehiclesSelection({
          addedVehicleIds: intersectedVehicleIds,
          removedVehicleIds: missedVehicleIds,
        });
      })
    )
  );

  private getIntersectingRouteIds(routes, bounds): number[] {
    const intersectedRouteIds: number[] = [];
    Object.keys(routes).forEach((id) => {
      // skip empty routes with no polylines (no assigned visits)
      if (routes[+id]) {
        // implement intersects-like operation with a combination of crosses and within
        const intersects =
          booleanCrosses(routes[+id], bounds) || booleanWithin(routes[+id], bounds);
        if (intersects) {
          intersectedRouteIds.push(+id);
        }
      }
    });
    return intersectedRouteIds;
  }

  private getVisitRequestIntersectingRouteIds(visitRequests, bounds): number[] {
    const intersectedRouteIds: number[] = [];
    Object.keys(visitRequests).forEach((id) => {
      const routeId = visitRequests[+id].properties.shipmentRouteId;
      const intersects = booleanWithin(visitRequests[+id], bounds);
      if (intersects) {
        intersectedRouteIds.push(routeId);
      }
    });
    return intersectedRouteIds;
  }
}
