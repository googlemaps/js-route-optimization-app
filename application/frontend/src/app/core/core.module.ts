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
  PostSolveMessageComponent,
  PostSolveMetricsComponent,
  PreSolveControlBarComponent,
  PreSolveEditShipmentDialogComponent,
  PreSolveEditVehicleDialogComponent,
  PreSolveMessageComponent,
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
  VisitRequestInfoWindowComponent,
} from './containers';
import { DownloadPdfDialogComponent } from './containers/download-pdf-dialog/download-pdf-dialog.component';
import { PdfMapComponent } from './containers/pdf-map/pdf-map.component';
import { ConfirmBulkEditDialogComponent } from './components/confirm-bulk-edit-dialog/confirm-bulk-edit-dialog.component';
import { CsvHelpDialogComponent } from './containers/csv-help-dialog/csv-help-dialog.component';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { DatasetComponent } from './components/dataset/dataset.component';
import { ScenarioKpisComponent } from './containers/scenario-kpis/scenario-kpis.component';
import { MapAddButtonsComponent } from './components/map-add-buttons/map-add-buttons.component';
import { ShipmentTypeIncompatibilityDialogComponent } from './components/shipment-type-incompatibility-dialog/shipment-type-incompatibility-dialog.component';
import { ShipmentTypeRequirementDialogComponent } from './components/shipment-type-requirement-dialog/shipment-type-requirement-dialog.component';
import { TransitionAttributesDialogComponent } from './components/transition-attributes-dialog/transition-attributes-dialog.component';
import { PrecedenceRulesDialogComponent } from './components/precedence-rules-dialog/precedence-rules-dialog.component';
import { ShipmentModelSettingsComponent } from './containers/shipment-model-settings/shipment-model-settings.component';

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
  PostSolveMessageComponent,
  PostSolveMetricsComponent,
  PreSolveControlBarComponent,
  PreSolveEditShipmentDialogComponent,
  PreSolveEditVehicleDialogComponent,
  PreSolveMessageComponent,
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
    CsvHelpDialogComponent,
    TopBarComponent,
    DatasetComponent,
    ScenarioKpisComponent,
    MapAddButtonsComponent,
    ShipmentTypeIncompatibilityDialogComponent,
    ShipmentTypeRequirementDialogComponent,
    TransitionAttributesDialogComponent,
    PrecedenceRulesDialogComponent,
    ShipmentModelSettingsComponent,
  ],
  exports: [COMPONENTS, CONTAINERS, CsvUploadDialogComponent],
})
export class CoreModule {}
