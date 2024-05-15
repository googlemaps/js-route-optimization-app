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
import { ShipmentsActions } from 'src/app/shipments/actions';
import { VehiclesActions } from 'src/app/vehicles/actions';
import { WelcomePageActions } from 'src/app/welcome/actions';
import {
  DispatcherActions,
  DownloadActions,
  MapActions,
  PreSolveShipmentActions,
  PreSolveVehicleActions,
  RoutesChartActions,
  RoutesMetadataActions,
  ShipmentsMetadataActions,
  StorageApiActions,
  UIActions,
  UndoRedoActions,
  UploadActions,
} from '../actions';
import { Modal, Page } from '../models';
import { ScenarioPlanningActions } from 'src/app/scenario-planning/actions';

export const uiFeatureKey = 'ui';

export interface State {
  clickedMapVehicleId?: number;
  clickedMapVisitRequestId?: number;
  hasMap: boolean;
  modal?: Modal;
  mouseOverId?: number;
  page: Page;
  splitSizes?: number[];
  openUploadDialogOnClose?: boolean;
}

export const initialState: State = {
  clickedMapVehicleId: null,
  clickedMapVisitRequestId: null,
  hasMap: true,
  modal: null,
  mouseOverId: null,
  page: Page.Welcome,
  splitSizes: [50, 50],
  openUploadDialogOnClose: false,
};

export const reducer = createReducer(
  initialState,
  on(DispatcherActions.uploadScenarioSuccess, (state) => ({
    ...initialState,
    page: state.page,
    mouseOverId: null,
  })),
  on(WelcomePageActions.initialize, () => ({ ...initialState })),
  on(UploadActions.openCsvDialog, (state, action) => ({
    ...state,
    modal: Modal.CsvUpload,
    openUploadDialogOnClose: action.openUploadDialogOnClose,
  })),
  on(DownloadActions.downloadPDF, (state) => ({ ...state, modal: Modal.DownloadPDF })),
  on(UploadActions.openDialog, WelcomePageActions.openUploadDialog, (state) => ({
    ...state,
    modal: Modal.Upload,
  })),
  on(StorageApiActions.openLoadDialog, (state) => ({ ...state, modal: Modal.StorageLoad })),
  on(StorageApiActions.openSaveDialog, (state) => ({ ...state, modal: Modal.StorageSave })),
  on(UploadActions.closeDialog, UploadActions.closeCsvDialog, (state) => ({
    ...state,
    modal: null,
  })),
  on(ScenarioPlanningActions.initialize, (state) => ({ ...state, page: Page.ScenarioPlanning })),
  on(ShipmentsActions.initialize, (state) => ({ ...state, page: Page.Shipments })),
  on(VehiclesActions.initialize, (state) => ({ ...state, page: Page.Vehicles })),
  on(RoutesChartActions.initialize, (state) => ({
    ...state,
    page: Page.RoutesChart,
    mouseOverId: null,
  })),
  on(RoutesMetadataActions.initialize, (state) => ({ ...state, page: Page.RoutesMetadata })),
  on(ShipmentsMetadataActions.initialize, (state) => ({ ...state, page: Page.ShipmentsMetadata })),
  on(UIActions.mapVehicleClicked, (state, { id }) => ({ ...state, clickedMapVehicleId: id })),
  on(UIActions.mapVisitRequestClicked, (state, { id }) => ({
    ...state,
    clickedMapVisitRequestId: id,
  })),
  on(
    PreSolveShipmentActions.showOnMap,
    PreSolveVehicleActions.showOnMap,
    MapActions.showMap,
    (state) => ({ ...state, hasMap: true })
  ),
  on(MapActions.hideMap, (state) => ({
    ...state,
    hasMap: false,
    splitSizes: initialState.splitSizes,
  })),
  on(MapActions.toggleMap, (state) => ({
    ...state,
    hasMap: !state.hasMap,
    splitSizes: state.hasMap ? initialState.splitSizes : state.splitSizes,
  })),
  on(UndoRedoActions.changePage, (state, { page }) => ({ ...state, page })),
  on(UIActions.changeSplitSizes, (state, { splitSizes }) => ({ ...state, splitSizes })),
  on(
    RoutesChartActions.mouseEnterVisitRequest,
    PreSolveShipmentActions.mouseEnterVisitRequest,
    (state, { id }) => ({ ...state, mouseOverId: id })
  ),
  on(
    RoutesChartActions.mouseExitVisitRequest,
    PreSolveShipmentActions.mouseExitVisitRequest,
    (state) => ({ ...state, mouseOverId: null })
  )
);

export const selectClickedVehicleId = (state: State): number => state.clickedMapVehicleId;

export const selectClickedVisitRequestId = (state: State): number => state.clickedMapVisitRequestId;

export const selectModal = (state: State): Modal => state.modal;

export const selectPage = (state: State): Page => state.page;

export const selectHasMap = (state: State): boolean => state.hasMap;

export const selectSplitSizes = (state: State): number[] => state.splitSizes;

export const selectMouseOverId = (state: State): number => state.mouseOverId;

export const selectOpenUploadDialogOnClose = (state: State): boolean =>
  state.openUploadDialogOnClose;
