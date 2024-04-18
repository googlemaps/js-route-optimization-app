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

import { Action, ActionReducer } from '@ngrx/store';
import { State } from '.';
import {
  ConfigActions,
  DispatcherApiActions,
  EditVisitActions,
  MainNavActions,
  MapActions,
  MetadataControlBarActions,
  PoiActions,
  PostSolveControlBarActions,
  PreSolveShipmentActions,
  PreSolveVehicleActions,
  RequestSettingsActions,
  RoutesChartActions,
  RoutesMetadataActions,
  ShipmentActions,
  ShipmentModelActions,
  ShipmentsMetadataActions,
  UIActions,
  UndoRedoActions,
  VehicleActions,
} from '../core/actions';
import { Page } from '../core/models';
import { Frame, State as UndoRedoState } from '../core/reducers/undo-redo.reducer';

const maxUndos = 100;

const preSolvePages = new Set([Page.Welcome, Page.Vehicles, Page.Shipments]);

const ignoreActions = new Set<string>([
  UndoRedoActions.changePage.type,

  // UI and related actions (not exhaustive) whose current state will be preserved,
  // thus not necessary for undo/redo to track
  ConfigActions.setTimezone.type,
  MapActions.selectPostSolveMapItems.type,
  MapActions.selectPreSolveShipmentMapItems.type,
  MapActions.selectPreSolveVehicleMapItems.type,
  MapActions.deselectMapItems.type,
  MapActions.showMap.type,
  MapActions.hideMap.type,
  MapActions.toggleMap.type,
  UIActions.changeSplitSizes.type,
  UIActions.mapVehicleClicked.type,
  UIActions.mapVisitRequestClicked.type,
  MetadataControlBarActions.addFilter.type,
  MetadataControlBarActions.editFilter.type,
  MetadataControlBarActions.removeFilter.type,
  MetadataControlBarActions.changeDisplayColumns.type,
  PostSolveControlBarActions.changeRangeOffset.type,
  PreSolveShipmentActions.selectShipment.type,
  PreSolveShipmentActions.selectShipments.type,
  PreSolveShipmentActions.deselectShipment.type,
  PreSolveShipmentActions.deselectShipments.type,
  PreSolveShipmentActions.updateShipmentsSelection.type,
  PreSolveShipmentActions.addFilter.type,
  PreSolveShipmentActions.editFilter.type,
  PreSolveShipmentActions.removeFilter.type,
  PreSolveShipmentActions.changeDisplayColumns.type,
  PreSolveShipmentActions.changePage.type,
  PreSolveShipmentActions.changeSort.type,
  PreSolveShipmentActions.mouseEnterVisitRequest.type,
  PreSolveShipmentActions.mouseExitVisitRequest.type,
  PreSolveVehicleActions.selectVehicle.type,
  PreSolveVehicleActions.selectVehicles.type,
  PreSolveVehicleActions.deselectVehicle.type,
  PreSolveVehicleActions.deselectVehicles.type,
  PreSolveVehicleActions.updateVehiclesSelection.type,
  PreSolveVehicleActions.addFilter.type,
  PreSolveVehicleActions.editFilter.type,
  PreSolveVehicleActions.removeFilter.type,
  PreSolveVehicleActions.changeDisplayColumns.type,
  PreSolveVehicleActions.changePage.type,
  PreSolveVehicleActions.changeSort.type,
  ShipmentModelActions.setGlobalEndTime.type,
  ShipmentModelActions.setGlobalStartTime.type,
  RequestSettingsActions.setLabel.type,
  ShipmentModelActions.setMaxActiveVehicles.type,
  ShipmentModelActions.setGlobalDurationCostPerHour.type,
  ShipmentModelActions.setPrecedenceRules.type,
  ShipmentModelActions.setShipmentTypeIncompatibilities.type,
  ShipmentModelActions.setShipmentTypeRequirements.type,
  RequestSettingsActions.setRequestSettings.type,
  RequestSettingsActions.setTimeout.type,
  RequestSettingsActions.setTimeThreshold.type,
  RequestSettingsActions.setTraffic.type,
  RoutesChartActions.selectRange.type,
  RoutesChartActions.selectRoute.type,
  RoutesChartActions.selectRoutes.type,
  RoutesChartActions.deselectRoute.type,
  RoutesChartActions.deselectRoutes.type,
  RoutesChartActions.updateRoutesSelection.type,
  RoutesChartActions.anchorRangeOffset.type,
  RoutesChartActions.nextRangeOffset.type,
  RoutesChartActions.previousRangeOffset.type,
  RoutesChartActions.addFilter.type,
  RoutesChartActions.editFilter.type,
  RoutesChartActions.removeFilter.type,
  RoutesChartActions.mouseEnterVisitRequest.type,
  RoutesChartActions.mouseExitVisitRequest.type,
  RoutesMetadataActions.changePage.type,
  RoutesMetadataActions.changeSort.type,
  RoutesMetadataActions.deselectRoute.type,
  RoutesMetadataActions.deselectRoutes.type,
  RoutesMetadataActions.selectRoute.type,
  RoutesMetadataActions.selectRoutes.type,
  ShipmentsMetadataActions.changePage.type,
  ShipmentsMetadataActions.changeSort.type,
  ShipmentsMetadataActions.deselectShipment.type,
  ShipmentsMetadataActions.deselectShipments.type,
  ShipmentsMetadataActions.editShipment.type,
  ShipmentsMetadataActions.selectShipment.type,
  ShipmentsMetadataActions.selectShipments.type,
]);

/**
 * Defines the allowed action types that are able to create an undo frame, which
 * corresponds to an undo point.
 * @remarks
 * An undo frame is the allowed undo action and subsequent non-allowed undo actions
 * captured when an allowed undo action is dispatched.  When undo occurs, these frames
 * are reduced from the initial state and recombined with preserved view state.
 */
interface Config {
  /** Action types able to create an undo point */
  [allowedUndoActionType: string]: {
    /**
     * Subsequent action types that must occur before the next allowed undo action type
     * for the undo point to become active.
     * @remarks
     * Only one must be occur if multiple are specified.
     */
    activeIfFollowedBy?: string[];
    /**
     * Preceding actions that prevent an undo action type from being active in the undo/redo stack.
     * Only one must occur if multiple are specified.
     */
    inactiveIfPrecededBy?: string[];
    getRedoPage?: (nextState: State) => Page;
  };
}

const config: Config = {
  [MainNavActions.solve.type]: {
    activeIfFollowedBy: [DispatcherApiActions.optimizeToursSuccess.type],
    getRedoPage: (state: State): Page => {
      if (preSolvePages.has(state.ui.page)) {
        return Page.RoutesChart;
      }
    },
  },
  [PreSolveShipmentActions.saveShipment.type]: {
    inactiveIfPrecededBy: [VehicleActions.deleteVehicle.type, VehicleActions.deleteVehicles.type],
  },
  [PreSolveShipmentActions.saveShipments.type]: {
    inactiveIfPrecededBy: [VehicleActions.deleteVehicle.type, VehicleActions.deleteVehicles.type],
  },
  [ShipmentActions.deleteShipment.type]: {},
  [ShipmentActions.deleteShipments.type]: {},
  [EditVisitActions.commitChanges.type]: {},
  [PoiActions.save.type]: {
    activeIfFollowedBy: [PoiActions.saveSuccess.type],
  },
  [VehicleActions.upsertVehicle.type]: {},
  [VehicleActions.upsertVehicles.type]: {},
  [VehicleActions.deleteVehicle.type]: {},
  [VehicleActions.deleteVehicles.type]: {},
};

export function undoRedo(reducer: ActionReducer<State>): ActionReducer<State> {
  return (state, action) => {
    if (!state) {
      return reducer(state, action);
    }
    // Router state not included; this is to more explicitly control the page/view
    // that applying undo/redo returns to via effect and to prevent the router state
    // from affecting the location history.
    if (action.type.startsWith('@ngrx/router-store')) {
      return reducer(state, action);
    }
    if (!state.undoRedo.initialState) {
      return initialize(reducer, state, action);
    }
    if (ignoreActions.has(action.type)) {
      return reducer(state, action);
    }

    // Handle undo/redo actions
    if (action.type === UndoRedoActions.undo.type) {
      return applyUndo(reducer, state, action);
    }
    if (action.type === UndoRedoActions.redo.type) {
      return applyRedo(reducer, state, action);
    }

    const nextState = reducer(state, action);
    if (config[action.type]) {
      return push(reducer, nextState, action);
    }
    if (state.ui.page === Page.Welcome && state.ui.page !== nextState.ui.page) {
      return reset(nextState);
    }
    return merge(nextState, action);
  };
}

function initialize(reducer: ActionReducer<State>, state: State, action: Action): State {
  const { undoRedo: undoRedoState, router: _router, ...initialState } = state;
  return reducer({ ...state, undoRedo: { ...undoRedoState, initialState } }, action);
}

/** Make the state the initial state */
function reset(state: State): State {
  const { undoRedo: _undoRedoState, router: _router, ...initialState } = state;
  return { ...state, undoRedo: { initialState, actions: [], undo: [], redo: [] } };
}

function merge(state: State, action: Action): State {
  if (!state.undoRedo.undo.length) {
    // Append action; actions between the initial state and the first undo frame are preserved to
    // allow backtrack for the first undo
    return {
      ...state,
      undoRedo: { ...state.undoRedo, actions: state.undoRedo.actions.concat(action) },
    };
  }
  // Append undo action to previous undo
  const undo = state.undoRedo.undo.slice();
  const previousUndo = undo[undo.length - 1];
  undo[undo.length - 1] = {
    ...previousUndo,
    actions: previousUndo.actions.concat(action),
    active:
      previousUndo.active ||
      config[previousUndo.actions[0].type].activeIfFollowedBy?.includes(action.type),
  };
  return { ...state, undoRedo: { ...state.undoRedo, undo } };
}

function push(reducer: ActionReducer<State>, state: State, action: Action): State {
  // Append undo, reset redo
  const undoRedoState = mergeInactive({ ...state?.undoRedo });
  const allowedUndoActionType = config[action.type];
  const undoPage = state.ui.page;
  const redoPage = allowedUndoActionType.getRedoPage?.apply(null, [state]);
  const previousUndoActionTypes =
    undoRedoState.undo[undoRedoState.undo.length - 1]?.actions.map(
      (undoAction) => undoAction.type
    ) || [];
  const inactivatedByPrecedingAction = allowedUndoActionType.inactiveIfPrecededBy?.some(
    (actionType) => previousUndoActionTypes.includes(actionType)
  );
  const active = !allowedUndoActionType.activeIfFollowedBy?.length && !inactivatedByPrecedingAction;
  const frame = { actions: [action], undoPage, redoPage, active };
  undoRedoState.undo = [...undoRedoState.undo, frame];
  undoRedoState.redo = [];

  // Merge excess leading undo frames into initial state once max undos is exceeded
  const mergeUndoCount = undoRedoState.undo.length - maxUndos;
  if (mergeUndoCount > 0 && mergeUndoCount <= undoRedoState.undo.length) {
    const mergeUndos = undoRedoState.undo.slice(0, mergeUndoCount);
    undoRedoState.undo = undoRedoState.undo.slice(mergeUndoCount);
    const {
      undoRedo: _u,
      router: _r,
      ...newInitialState
    } = getUndoState(reducer, state, mergeUndos, []);
    undoRedoState.initialState = newInitialState;
    undoRedoState.actions = [];
  }

  return { ...state, undoRedo: undoRedoState };
}

/** Merge the previous undo state if it's not active */
function mergeInactive(state: UndoRedoState): UndoRedoState {
  const previousUndo = state.undo[state.undo.length - 1];
  if (!previousUndo || previousUndo.active) {
    return state;
  }

  // Remove inactive undo from stack
  const undo = state.undo.slice(0, state.undo.length - 1);

  const mergeIntoUndo = undo[undo.length - 1];
  if (mergeIntoUndo) {
    // Merge into the previous undo
    // eslint-disable-next-line no-console
    console.assert(mergeIntoUndo.active);
    const undoActions = mergeIntoUndo.actions.concat(...previousUndo.actions);
    undo[undo.length - 1] = { ...mergeIntoUndo, actions: undoActions };
    return { ...state, undo };
  }

  // Merge into actions
  const actions = state.actions.concat(...previousUndo.actions);
  return { ...state, undo, actions };
}

function applyUndo(reducer: ActionReducer<State>, state: State, action: Action): State {
  const { undoRedo: undoRedoState } = state;
  if (!undoRedoState.undo.some((frame) => frame.active)) {
    return reducer(state, action);
  }

  // Move the tail of undo to the head of redo
  const undo = undoRedoState.undo.slice();
  const redo = undoRedoState.redo.slice();

  let undoFrame = undo.pop();
  while (undoFrame) {
    redo.unshift(undoFrame);
    if (undoFrame.active) {
      break;
    }
    undoFrame = undo.pop();
  }

  // Apply updated undo stack onto initial state
  return getUndoState(reducer, state, undo, redo);
}

function applyRedo(reducer: ActionReducer<State>, state: State, action: Action): State {
  const { undoRedo: undoRedoState } = state;
  if (!undoRedoState.redo.some((frame) => frame.active)) {
    return reducer(state, action);
  }

  // Move the head of redo to the tail of undo
  const undo = undoRedoState.undo.slice();
  const redo = undoRedoState.redo.slice();

  let redoFrame = redo.shift();
  while (redoFrame) {
    undo.push(redoFrame);
    if (redoFrame.active) {
      break;
    }
    redoFrame = redo.shift();
  }

  // Apply updated undo stack onto initial state
  return getUndoState(reducer, state, undo, redo);
}

/** Gets root state for provided undo/redo frames */
function getUndoState(
  reducer: ActionReducer<State>,
  state: State,
  undo: Frame[],
  redo: Frame[]
): State {
  let undoState = {
    ...state.undoRedo.initialState,
    undoRedo: { ...state.undoRedo, undo, redo },
  } as State;
  undoState.undoRedo.actions.forEach((action) => {
    undoState = reducer(undoState, action);
  });
  undo.forEach(({ actions }) => {
    actions.forEach((a) => {
      undoState = reducer(undoState, a);
    });
  });

  return {
    ...undoState,
    // Current state to preserve between undo/redo
    config: {
      ...undoState.config,
      timezone: state.config.timezone,
    },
    preSolveShipment: {
      ...state.preSolveShipment,
      requested: undoState.preSolveShipment.requested,
      selected: getValidSelected(state.preSolveShipment.selected, undoState.shipments.entities),
      selectedColors: getValidSelectedColors(
        state.preSolveShipment.selectedColors,
        undoState.shipments.entities
      ),
    },
    preSolveVehicle: {
      ...state.preSolveVehicle,
      requested: undoState.preSolveVehicle.requested,
      selected: getValidSelected(state.preSolveVehicle.selected, undoState.vehicles.entities),
    },
    routesChart: {
      ...state.routesChart,
      selectedRoutes: getValidSelected(
        state.routesChart.selectedRoutes,
        undoState.shipmentRoutes.entities
      ),
      selectedRoutesColors: getValidSelectedColors(
        state.routesChart.selectedRoutesColors,
        undoState.shipmentRoutes.entities
      ),
    },
    shipmentsMetadata: {
      ...state.shipmentsMetadata,
      selected: getValidSelected(state.shipmentsMetadata.selected, undoState.shipments.entities),
    },
    routesMetadata: {
      ...state.routesMetadata,
      selected: getValidSelected(state.routesMetadata.selected, undoState.shipmentRoutes.entities),
    },
    requestSettings: state.requestSettings,
    ui: state.ui,
    router: state.router,
  };
}

function getValidSelected<T>(selected: number[], entities: { [id: number]: T }): number[] {
  return selected.filter((id) => entities[id]);
}

function getValidSelectedColors<T>(
  selectedColors: [key: number, value: number][],
  entities: { [id: number]: T }
): [key: number, value: number][] {
  return selectedColors.filter(([id]) => entities[id]);
}
