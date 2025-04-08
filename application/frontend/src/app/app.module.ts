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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { CoreModule } from './core';
import { AppComponent } from './core/containers';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material/material.module';
import { StoreModule, Store } from '@ngrx/store';
import { ROOT_REDUCERS, metaReducers } from './reducers';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { environment } from '../environments/environment';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import {
  ConfigEffects,
  DepotLayerEffects,
  DispatcherEffects,
  DispatcherApiEffects,
  DocumentationEffects,
  DownloadEffects,
  EditVisitEffects,
  InitEffects,
  MapApiEffects,
  PointOfInterestEffects,
  MapEffects,
  PreSolveShipmentEffects,
  PreSolveVehicleEffects,
  RequestSettingsEffects,
  RoutesChartEffects,
  UndoRedoEffects,
  StorageApiEffects,
  UploadEffects,
  VehicleEffects,
  ShipmentEffects,
  ShipmentModelEffects,
} from './core/effects';
import { HttpClientModule } from '@angular/common/http';
import { initApp } from './app-initializer';
import { ScenarioSolutionHelpDialogComponent } from './core/containers/scenario-solution-help-dialog/scenario-solution-help-dialog.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    CoreModule,
    BrowserAnimationsModule,
    MaterialModule,
    StoreModule.forRoot(ROOT_REDUCERS, {
      metaReducers,
      runtimeChecks: {
        strictStateImmutability: true,
        strictActionImmutability: true,
      },
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
    connectInZone: true}),
    EffectsModule.forRoot([
      ConfigEffects,
      DepotLayerEffects,
      DispatcherEffects,
      DispatcherApiEffects,
      DocumentationEffects,
      DownloadEffects,
      EditVisitEffects,
      InitEffects,
      MapApiEffects,
      PointOfInterestEffects,
      MapEffects,
      PreSolveShipmentEffects,
      PreSolveVehicleEffects,
      RequestSettingsEffects,
      RoutesChartEffects,
      UndoRedoEffects,
      StorageApiEffects,
      UploadEffects,
      VehicleEffects,
      ShipmentEffects,
      ShipmentModelEffects,
    ]),
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      multi: true,
      deps: [Store],
    },
  ],
  bootstrap: [AppComponent],
  declarations: [ScenarioSolutionHelpDialogComponent],
})
export class AppModule {}
