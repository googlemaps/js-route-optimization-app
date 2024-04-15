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
  (routes) => routes.filter((route) => route.transitions?.length).length
);

export const selectTotalRoutesDistanceMeters = createSelector(selectRoutes, (routes) => {
  let totalDistanceMeters = 0;
  routes.forEach((route) =>
    route.transitions?.forEach(
      (transition) => (totalDistanceMeters += transition.travelDistanceMeters || 0)
    )
  );
  return totalDistanceMeters;
});
