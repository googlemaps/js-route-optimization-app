/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
  PreSolveVehicleOperatorEffects,
  PreSolveVehicleEffects,
  PreSolveSettingsEffects,
  RequestSettingsEffects,
  RoutesChartEffects,
  UndoRedoEffects,
  StorageApiEffects,
  UploadEffects,
  VehicleEffects,
  VehicleOperatorEffects,
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
    }),
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
      PreSolveVehicleOperatorEffects,
      PreSolveVehicleEffects,
      PreSolveSettingsEffects,
      RequestSettingsEffects,
      RoutesChartEffects,
      UndoRedoEffects,
      StorageApiEffects,
      UploadEffects,
      VehicleEffects,
      VehicleOperatorEffects,
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
