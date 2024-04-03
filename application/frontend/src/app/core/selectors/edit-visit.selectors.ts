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

import { Dictionary } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { durationSeconds, pick } from 'src/app/util';
import { ITravelStep, ShipmentRoute, Visit } from '../models';
import * as fromEditVisit from '../reducers/edit-visit.reducer';
import * as fromShipmentRoute from './shipment-route.selectors';
import * as fromShipment from './shipment.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import * as fromVisit from './visit.selectors';

export const selectEditVisitState = createFeatureSelector<fromEditVisit.State>(
  fromEditVisit.editVisitFeatureKey
);

export const selectVisitId = createSelector(selectEditVisitState, fromEditVisit.selectVisitId);

export const selectCommitChanges = createSelector(
  selectEditVisitState,
  fromEditVisit.selectCommitChanges
);

export const selectSavePending = createSelector(
  selectEditVisitState,
  fromEditVisit.selectSavePending
);

export const selectSaveChanges = createSelector(
  selectEditVisitState,
  fromEditVisit.selectSaveChanges
);

export const selectSaveError = createSelector(selectEditVisitState, fromEditVisit.selectSaveError);

export const selectVisitShipment = createSelector(
  selectVisitId,
  fromShipment.selectEntities,
  fromVisitRequest.selectEntities,
  (visitId, shipments, visitRequests) => shipments[visitRequests[visitId]?.shipmentId]
);

export const selectVisitPickup = createSelector(
  selectVisitShipment,
  fromVisit.selectEntities,
  (shipment, visits) => fromShipment.getPickup(shipment, visits)
);

export const selectVisitPickupRequest = createSelector(
  selectVisitPickup,
  fromVisitRequest.selectEntities,
  (visit, visitRequests) => visitRequests[visit?.id]
);

export const selectVisitDelivery = createSelector(
  selectVisitShipment,
  fromVisit.selectEntities,
  (shipment, visits) => fromShipment.getDelivery(shipment, visits)
);

export const selectVisitDeliveryRequest = createSelector(
  selectVisitPickup,
  fromVisitRequest.selectEntities,
  (visit, visitRequests) => visitRequests[visit?.id]
);

function removeVisitFromRoute(
  originalRoute: ShipmentRoute,
  visitId: number
): { route: ShipmentRoute; travelStep: ITravelStep } {
  const route = {
    ...originalRoute,
    visits: originalRoute.visits.slice(),
    travelSteps: originalRoute.travelSteps.slice(),
  };

  const visitIndex = route.visits.indexOf(visitId);
  route.visits.splice(visitIndex, 1);
  const travelStep = route.travelSteps.splice(visitIndex, 1)[0];
  return { route, travelStep };
}

function getSortedShipmentRoute(shipmentRoute: ShipmentRoute, visits: Dictionary<Visit>) {
  // Keep track of the original visit to travel step association
  const travelStepByVisitId = new Map(
    shipmentRoute.visits.map((id, index) => [id, shipmentRoute.travelSteps[index]])
  );
  // Sort the visits
  const sortedRouteVisits = shipmentRoute.visits.sort((a, b) => {
    return durationSeconds(visits[a].startTime).compare(durationSeconds(visits[b].startTime));
  });
  // Map the sorted visits to their travel steps to get the sorted travel steps, and append the
  // last travel step which wasn't mapped to a visit (travel steps length is visits length + 1)
  const sortedTravelSteps = sortedRouteVisits
    .map((id) => travelStepByVisitId.get(id))
    .concat(shipmentRoute.travelSteps[shipmentRoute.travelSteps.length - 1]);
  return {
    ...shipmentRoute,
    visits: sortedRouteVisits,
    travelSteps: sortedTravelSteps,
  };
}

/**
 * Gets the visit and shipment route changes for the provided visit changes
 * @remarks
 * Compares visit changes with their previous state to determine the
 * shipment routes to update, updating the identified shipmentRoute.visits
 * composition and order.
 */
export const selectVisitShipmentRouteChanges = (visitChanges: Visit[]) =>
  createSelector(
    fromVisit.selectEntities,
    fromShipmentRoute.selectEntities,
    (visits: Dictionary<Visit>, shipmentRoutes: Dictionary<ShipmentRoute>) => {
      const changedVisits = visitChanges || [];
      const changedShipmentRoutesLookup: Dictionary<ShipmentRoute> = {};
      const sortShipmentRouteIds = new Set<number>();

      for (const validVisit of changedVisits) {
        const originalVisit = visits[validVisit.id];
        const originalRoute =
          changedShipmentRoutesLookup[originalVisit.shipmentRouteId] ||
          shipmentRoutes[originalVisit.shipmentRouteId];

        const { route, travelStep } = removeVisitFromRoute(originalRoute, validVisit.id);

        // Important to use the original route just pruned if the visit will remain on its original route
        const newRoute =
          validVisit.shipmentRouteId === route.id
            ? route
            : changedShipmentRoutesLookup[validVisit.shipmentRouteId] ||
              shipmentRoutes[validVisit.shipmentRouteId];

        // Update the new route.  This is partial since the visits and travel steps need to be sorted, which
        // is being deferred until all the visit changes have been applied
        const newVisits = newRoute.visits.concat(validVisit.id);

        // Always one more travel step than visit; not associating the last travel step with any visit, thus
        // the splice to keep the last travel step in place
        const newTravelSteps = newRoute.travelSteps.slice();
        newTravelSteps.splice(newRoute.visits.length, 0, travelStep);

        changedShipmentRoutesLookup[newRoute.id] = {
          id: newRoute.id,
          visits: newVisits,
          travelSteps: newTravelSteps,
        };
        // Only shipment routes with moved/added visits need sorted
        sortShipmentRouteIds.add(newRoute.id);

        // If the visit will change routes, update the original route as well
        if (validVisit.shipmentRouteId !== route.id) {
          changedShipmentRoutesLookup[route.id] = {
            id: route.id,
            travelSteps: route.travelSteps,
            visits: route.visits,
          };
        }
      }

      // Sort the visit/travel steps of the changed shipment routes
      const changedVisitsLookup: Dictionary<Visit> = Object.assign(
        {},
        ...changedVisits.map((v) => ({ [v.id]: v }))
      );
      const changedshipmentRoutes = Object.values(changedShipmentRoutesLookup).map((route) => {
        if (sortShipmentRouteIds.has(route.id)) {
          // Prepare route visit dictionary that reflects visit changes
          const routeVisits: Dictionary<Visit> = {
            ...pick(visits, route.visits),
            ...changedVisitsLookup,
          };
          return getSortedShipmentRoute(route, routeVisits);
        }
        return route;
      });

      const changeTime = Date.now();
      return {
        visits: changedVisits.map<Visit>((v) => ({ ...v, changeTime })),
        shipmentRoutes: changedshipmentRoutes.map((sr) => ({ ...sr, changeTime })),
      };
    }
  );
