/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
