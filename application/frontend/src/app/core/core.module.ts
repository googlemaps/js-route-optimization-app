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

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../material';
import { SharedModule } from '../shared/shared.module';
import {
  BaseDocumentationDialogComponent,
  BaseEditShipmentDialogComponent,
  BaseEditVehicleDialogComponent,
  BaseEditVisitDialogComponent,
  BaseGenerateButtonComponent,
  BaseMainNavComponent,
  BasePostSolveMetricsComponent,
  BasePreSolveMessageComponent,
  BaseRegenerateConfirmationDialogComponent,
  BaseStorageApiSaveLoadDialogComponent,
  BaseShipmentsKpisComponent,
  BaseValidationResultDialogComponent,
  BaseVehicleInfoWindowComponent,
  BodyComponent,
  BaseVehiclesKpisComponent,
  BaseVehicleOperatorsKpisComponent,
  BaseVisitRequestInfoWindowComponent,
  HideMapButtonComponent,
  LogoComponent,
  MapToggleButtonComponent,
  MapTypeButtonComponent,
  MessageSnackBarComponent,
  PostSolveTimelineLegendComponent,
  ProgressBarComponent,
  SelectMapItemsButtonComponent,
  SharedDefsComponent,
  SideBarComponent,
  TimeNavigationComponent,
  ToggleSelectionFilterButtonComponent,
  ZoomHomeButtonComponent,
  BasePostSolveMessageComponent,
} from './components';
import {
  AppComponent,
  DocumentationDialogComponent,
  EditGlobalRelaxationConstraintsDialogComponent,
  EditVisitDialogComponent,
  FormMapComponent,
  GenerateButtonComponent,
  MainActionsComponent,
  MainNavComponent,
  MapComponent,
  MapWrapperComponent,
  MetadataControlBarComponent,
  PostSolveControlBarComponent,
  PostSolveMessageComponent,
  PostSolveMetricsComponent,
  PreSolveControlBarComponent,
  PreSolveEditShipmentDialogComponent,
  PreSolveEditVehicleDialogComponent,
  PreSolveSettingsDialogComponent,
  PreSolveGlobalSettingsComponent,
  PreSolveMessageComponent,
  PreSolveShipmentModelSettingsComponent,
  RegenerateConfirmationDialogComponent,
  RoutesChartControlBarComponent,
  ShipmentsControlBarComponent,
  ShipmentsKpisComponent,
  StorageApiSaveLoadDialogComponent,
  CsvUploadDialogComponent,
  UploadDialogComponent,
  ValidationResultDialogComponent,
  VehicleInfoWindowComponent,
  VehiclesControlBarComponent,
  VehiclesKpisComponent,
  VehicleOperatorsKpisComponent,
  VisitRequestInfoWindowComponent,
} from './containers';
import { DownloadPdfDialogComponent } from './containers/download-pdf-dialog/download-pdf-dialog.component';
import { PdfMapComponent } from './containers/pdf-map/pdf-map.component';
import { ConfirmBulkEditDialogComponent } from './components/confirm-bulk-edit-dialog/confirm-bulk-edit-dialog.component';
import { VehicleOperatorsControlBarComponent } from './containers/vehicle-operators-control-bar/vehicle-operators-control-bar.component';
import { BaseEditVehicleOperatorDialogComponent } from './components/base-edit-vehicle-operator-dialog/base-edit-vehicle-operator-dialog.component';
import { PreSolveEditVehicleOperatorDialogComponent } from './containers/pre-solve-edit-vehicle-operator-dialog/pre-solve-edit-vehicle-operator-dialog.component';
import { CsvHelpDialogComponent } from './containers/csv-help-dialog/csv-help-dialog.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { DatasetComponent } from './components/dataset/dataset.component';

export const COMPONENTS = [
  BaseDocumentationDialogComponent,
  BaseEditShipmentDialogComponent,
  BaseEditVehicleDialogComponent,
  BaseEditVisitDialogComponent,
  BaseGenerateButtonComponent,
  BasePostSolveMessageComponent,
  BasePreSolveMessageComponent,
  BaseShipmentsKpisComponent,
  BaseStorageApiSaveLoadDialogComponent,
  BaseMainNavComponent,
  BasePostSolveMetricsComponent,
  BaseRegenerateConfirmationDialogComponent,
  BaseValidationResultDialogComponent,
  BaseVehicleInfoWindowComponent,
  BaseVehiclesKpisComponent,
  BaseVehicleOperatorsKpisComponent,
  BaseVisitRequestInfoWindowComponent,
  BodyComponent,
  HideMapButtonComponent,
  LogoComponent,
  MapToggleButtonComponent,
  MapTypeButtonComponent,
  MessageSnackBarComponent,
  PostSolveTimelineLegendComponent,
  ProgressBarComponent,
  SelectMapItemsButtonComponent,
  SharedDefsComponent,
  SideBarComponent,
  TimeNavigationComponent,
  ToggleSelectionFilterButtonComponent,
  ZoomHomeButtonComponent,
];

export const CONTAINERS = [
  AppComponent,
  DocumentationDialogComponent,
  EditGlobalRelaxationConstraintsDialogComponent,
  EditVisitDialogComponent,
  FormMapComponent,
  GenerateButtonComponent,
  MainActionsComponent,
  MainNavComponent,
  MapComponent,
  MapWrapperComponent,
  MetadataControlBarComponent,
  PostSolveControlBarComponent,
  PostSolveMessageComponent,
  PostSolveMetricsComponent,
  PreSolveControlBarComponent,
  PreSolveEditShipmentDialogComponent,
  PreSolveEditVehicleDialogComponent,
  PreSolveGlobalSettingsComponent,
  PreSolveMessageComponent,
  PreSolveSettingsDialogComponent,
  PreSolveShipmentModelSettingsComponent,
  RegenerateConfirmationDialogComponent,
  RoutesChartControlBarComponent,
  ShipmentsControlBarComponent,
  ShipmentsKpisComponent,
  StorageApiSaveLoadDialogComponent,
  UploadDialogComponent,
  ValidationResultDialogComponent,
  VehicleInfoWindowComponent,
  VehiclesControlBarComponent,
  VehiclesKpisComponent,
  VehicleOperatorsKpisComponent,
  VisitRequestInfoWindowComponent,
];

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    MaterialModule,
    SharedModule,
  ],
  declarations: [
    COMPONENTS,
    CONTAINERS,
    CsvUploadDialogComponent,
    DownloadPdfDialogComponent,
    PdfMapComponent,
    ConfirmBulkEditDialogComponent,
    VehicleOperatorsControlBarComponent,
    PreSolveEditVehicleOperatorDialogComponent,
    BaseEditVehicleOperatorDialogComponent,
    CsvHelpDialogComponent,
    TopBarComponent,
    DatasetComponent,
  ],
  exports: [COMPONENTS, CONTAINERS, CsvUploadDialogComponent],
})
export class CoreModule {}
