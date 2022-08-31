/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import * as fromDispatcher from './dispatcher.selectors';

export const selectHasSolution = createSelector(
  fromDispatcher.selectSolution,
  (solution) => solution != null
);

export const selectSkippedShipments = createSelector(
  fromDispatcher.selectSolution,
  (solution) => solution?.skippedShipments || []
);

export const selectTotalCost = createSelector(
  fromDispatcher.selectSolution,
  (solution) => solution?.totalCost || 0
);

export const selectRoutes = createSelector(
  fromDispatcher.selectSolution,
  (solution) => solution?.routes || []
);

export const selectUsedRoutesCount = createSelector(
  selectRoutes,
  (routes) => routes.filter((route) => route.travelSteps?.length).length
);

export const selectTotalRoutesDistanceMeters = createSelector(selectRoutes, (routes) => {
  let totalDistanceMeters = 0;
  routes.forEach((route) =>
    route.travelSteps?.forEach((step) => (totalDistanceMeters += step.distanceMeters || 0))
  );
  return totalDistanceMeters;
});
