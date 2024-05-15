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

import { createSelector } from '@ngrx/store';
import { fromDispatcherToTurfPoint } from 'src/app/util';
import { VisitRequest } from '../models';
import PreSolveShipmentSelectors from './pre-solve-shipment.selectors';
import { Feature, Point } from '@turf/helpers';
import { selectMouseOverId } from './ui.selectors';

const visitRequestToDeckGL = (visitRequest: VisitRequest) => {
  return {
    ...visitRequest,
    arrivalPosition: [
      visitRequest.arrivalWaypoint?.location?.latLng?.longitude,
      visitRequest.arrivalWaypoint?.location?.latLng?.latitude,
    ],
    departurePosition: visitRequest.departureWaypoint?.location?.latLng
      ? [
          visitRequest.departureWaypoint?.location?.latLng?.longitude,
          visitRequest.departureWaypoint?.location?.latLng?.latitude,
        ]
      : undefined,
  };
};

export const selectFilteredVisitRequests = createSelector(
  PreSolveShipmentSelectors.selectFilteredVisitRequests,
  (visitRequests) => {
    return visitRequests.map((visitRequest) => {
      return visitRequestToDeckGL(visitRequest);
    });
  }
);

export const selectFilteredVisitRequestsSelected = createSelector(
  PreSolveShipmentSelectors.selectFilteredVisitRequestsSelected,
  PreSolveShipmentSelectors.selectSelectedColors,
  (visitRequests, colors) => {
    return visitRequests.map((visitRequest) => {
      return {
        ...visitRequestToDeckGL(visitRequest),
        color: colors[visitRequest.shipmentId],
      };
    });
  }
);

export const selectFilteredVisitRequestsTurfPoints = createSelector(
  selectFilteredVisitRequests,
  (visitRequests) => {
    const turfPoints: { [routeId: number]: Feature<Point> } = {};
    visitRequests.forEach((visitRequest) => {
      const feature = fromDispatcherToTurfPoint(visitRequest.arrivalWaypoint?.location?.latLng);
      feature.properties.shipmentId = visitRequest.shipmentId;
      turfPoints[visitRequest.id] = feature;
    });
    return turfPoints;
  }
);

export const selectMouseOverVisitRequest = createSelector(
  PreSolveShipmentSelectors.selectFilteredVisitRequests,
  PreSolveShipmentSelectors.selectSelectedLookup,
  PreSolveShipmentSelectors.selectSelectedColors,
  selectMouseOverId,
  (filtered, selected, colors, mouseOverId) => {
    return filtered
      .filter((visitRequest) => visitRequest.id === mouseOverId)
      .map((visitRequest) => {
        return {
          ...visitRequestToDeckGL(visitRequest),
          selected: selected[visitRequest.shipmentId],
          color: colors[visitRequest.shipmentId],
        };
      });
  }
);
