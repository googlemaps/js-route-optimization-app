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

import { createReducer, on } from '@ngrx/store';
import { MapLayer, MapLayerId } from '../models/map';
import { MapActions } from '../actions';

export const mapFeatureKey = 'map';

export interface State {
  postSolveMapLayers: { [id in MapLayerId]: MapLayer };
}

export const initialState: State = {
  postSolveMapLayers: {
    [MapLayerId.PostSolveVisitRequests]: {
      name: 'Shipments',
      icon: 'pickup',
      visible: true,
    },
    [MapLayerId.Routes]: {
      name: 'Routes',
      icon: 'route',
      visible: true,
    },
    [MapLayerId.PostSolveFourWheel]: {
      name: 'Driving',
      icon: 'vehicle_icon',
      visible: true,
    },
    [MapLayerId.PostSolveWalking]: {
        name: 'Walking',
        icon: 'walking',
        visible: true,
      },
  },
};

export const reducer = createReducer(
  initialState,
  on(MapActions.setPostSolveLayerVisible, (state, { layerId, visible }) => ({
    ...state,
    postSolveMapLayers: {
      ...state.postSolveMapLayers,
      [layerId]: {
        ...state.postSolveMapLayers[layerId],
        visible,
      },
    },
  }))
);

export const selectPostSolveMapLayers = (state: State): { [id in MapLayerId]: MapLayer } =>
  state.postSolveMapLayers;
