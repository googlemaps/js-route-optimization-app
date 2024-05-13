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

import { InjectionToken } from '@angular/core';
import * as fromRouter from '@ngrx/router-store';
import {
  Action,
  ActionReducer,
  ActionReducerMap,
  createFeatureSelector,
  createSelector,
  MetaReducer,
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import { Page } from '../core/models';
import * as fromConfig from '../core/reducers/config.reducer';
import * as fromDispatcherApi from '../core/reducers/dispatcher-api.reducer';
import * as fromDispatcher from '../core/reducers/dispatcher.reducer';
import * as fromEditVisit from '../core/reducers/edit-visit.reducer';
import * as fromMap from '../core/reducers/map.reducer';
import * as fromMapApi from '../core/reducers/map-api.reducer';
import * as fromPointsOfInterest from '../core/reducers/points-of-interest.reducer';
import * as fromPreSolveShipment from '../core/reducers/pre-solve-shipment.reducer';
import * as fromPreSolveVehicle from '../core/reducers/pre-solve-vehicle.reducer';
import * as fromRequestSettings from '../core/reducers/request-settings.reducer';
import * as fromRoutesChart from '../core/reducers/routes-chart.reducer';
import * as fromRoutesMetadata from '../core/reducers/routes-metadata.reducer';
import * as fromShipment from '../core/reducers/shipment.reducer';
import * as fromShipmentModel from '../core/reducers/shipment-model.reducer';
import * as fromShipmentRoute from '../core/reducers/shipment-route.reducer';
import * as fromShipmentsMetadata from '../core/reducers/shipments-metadata.reducer';
import * as fromUI from '../core/reducers/ui.reducer';
import * as fromUndoRedo from '../core/reducers/undo-redo.reducer';
import * as fromVehicle from '../core/reducers/vehicle.reducer';
import * as fromVisitRequest from '../core/reducers/visit-request.reducer';
import * as fromVisit from '../core/reducers/visit.reducer';
import * as fromUiSelectors from '../core/selectors/ui.selectors';
import { undoRedo } from './undo-redo';

export interface State {
  [fromConfig.configFeatureKey]: fromConfig.State;
  [fromDispatcher.dispatcherFeatureKey]: fromDispatcher.State;
  [fromDispatcherApi.dispatcherApiFeatureKey]: fromDispatcherApi.State;
  [fromMapApi.mapApiFeatureKey]: fromMapApi.State;
  [fromUI.uiFeatureKey]: fromUI.State;
  [fromShipment.shipmentsFeatureKey]: fromShipment.State;
  [fromShipmentRoute.shipmentRoutesFeatureKey]: fromShipmentRoute.State;
  [fromShipmentsMetadata.shipmentsMetadataFeatureKey]: fromShipmentsMetadata.State;
  [fromVehicle.vehiclesFeatureKey]: fromVehicle.State;
  [fromVisit.visitsFeatureKey]: fromVisit.State;
  [fromVisitRequest.visitRequestsFeatureKey]: fromVisitRequest.State;
  [fromPointsOfInterest.poiFeatureKey]: fromPointsOfInterest.State;
  [fromPreSolveShipment.preSolveShipmentFeatureKey]: fromPreSolveShipment.State;
  [fromPreSolveVehicle.preSolveVehicleFeatureKey]: fromPreSolveVehicle.State;
  [fromRoutesChart.routesChartFeatureKey]: fromRoutesChart.State;
  [fromRoutesMetadata.routesMetadataFeatureKey]: fromRoutesMetadata.State;
  [fromRequestSettings.requestSettingsFeatureKey]: fromRequestSettings.State;
  [fromShipmentModel.shipmentModelFeatureKey]: fromShipmentModel.State;
  [fromUndoRedo.undoRedoFeatureKey]: fromUndoRedo.State;
  [fromMap.mapFeatureKey]: fromMap.State;
  router: fromRouter.RouterReducerState<any>;
}

export const ROOT_REDUCERS = new InjectionToken<ActionReducerMap<State, Action>>(
  'Root reducers token',
  {
    factory: () => ({
      [fromConfig.configFeatureKey]: fromConfig.reducer,
      [fromDispatcher.dispatcherFeatureKey]: fromDispatcher.reducer,
      [fromDispatcherApi.dispatcherApiFeatureKey]: fromDispatcherApi.reducer,
      [fromEditVisit.editVisitFeatureKey]: fromEditVisit.reducer,
      [fromMapApi.mapApiFeatureKey]: fromMapApi.reducer,
      [fromPreSolveShipment.preSolveShipmentFeatureKey]: fromPreSolveShipment.reducer,
      [fromPreSolveVehicle.preSolveVehicleFeatureKey]: fromPreSolveVehicle.reducer,
      [fromPointsOfInterest.poiFeatureKey]: fromPointsOfInterest.reducer,
      [fromRequestSettings.requestSettingsFeatureKey]: fromRequestSettings.reducer,
      [fromRoutesChart.routesChartFeatureKey]: fromRoutesChart.reducer,
      [fromRoutesMetadata.routesMetadataFeatureKey]: fromRoutesMetadata.reducer,
      [fromShipment.shipmentsFeatureKey]: fromShipment.reducer,
      [fromShipmentModel.shipmentModelFeatureKey]: fromShipmentModel.reducer,
      [fromShipmentRoute.shipmentRoutesFeatureKey]: fromShipmentRoute.reducer,
      [fromShipmentsMetadata.shipmentsMetadataFeatureKey]: fromShipmentsMetadata.reducer,
      [fromUI.uiFeatureKey]: fromUI.reducer,
      [fromUndoRedo.undoRedoFeatureKey]: fromUndoRedo.reducer,
      [fromVehicle.vehiclesFeatureKey]: fromVehicle.reducer,
      [fromVisit.visitsFeatureKey]: fromVisit.reducer,
      [fromVisitRequest.visitRequestsFeatureKey]: fromVisitRequest.reducer,
      [fromMap.mapFeatureKey]: fromMap.reducer,
      router: fromRouter.routerReducer,
    }),
  }
);

export function logger(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state, action) => {
    const result = reducer(state, action);
    /* eslint-disable no-console */
    console.groupCollapsed(action.type);
    console.log('prev state', state);
    console.log('action', action);
    console.log('next state', result);
    console.groupEnd();
    /* eslint-enable no-console */
    return result;
  };
}

export const metaReducers: MetaReducer<State>[] = !environment.production
  ? [logger, undoRedo]
  : [undoRedo];

export const selectRouter = createFeatureSelector<fromRouter.RouterReducerState<any>>('router');

export const selectMapSelectionToolsVisible = createSelector(
  fromUiSelectors.selectPage,
  (page) =>
    page === Page.Shipments ||
    page === Page.Vehicles ||
    page === Page.RoutesChart ||
    page === Page.ScenarioPlanning
);
