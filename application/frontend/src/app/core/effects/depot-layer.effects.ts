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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { map, switchMap, switchMapTo, take, tap, withLatestFrom } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { ShipmentsActions } from 'src/app/shipments/actions';
import { VehiclesActions } from 'src/app/vehicles/actions';
import {
  ConfigActions,
  DispatcherActions,
  PreSolveVehicleActions,
  RoutesChartActions,
} from '../actions';
import * as fromConfig from '../selectors/config.selectors';
import * as fromDepot from '../selectors/depot.selectors';
import PreSolveVehicleSelectors from '../selectors/pre-solve-vehicle.selectors';
import * as fromPreSolve from '../selectors/pre-solve.selectors';
import { DepotLayer } from '../services/depot-layer.service';

@Injectable()
export class DepotLayerEffects {
  setSymbol$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ConfigActions.loadConfig),
        switchMapTo(
          this.store.pipe(
            take(1),
            select(fromConfig.selectMapSymbols),
            tap((symbols) => {
              if (symbols?.depot) {
                this.depotLayer.symbol = symbols.depot;
              }
            })
          )
        )
      ),
    { dispatch: false }
  );

  setDepot$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DispatcherActions.loadScenario),
        switchMap(() =>
          this.store.pipe(
            select(fromDepot.selectDepot),
            tap((depot) => {
              this.depotLayer.setDepot(depot);
            })
          )
        )
      ),
    { dispatch: false }
  );

  selectDepot$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PreSolveVehicleActions.selectVehicle,
          PreSolveVehicleActions.selectVehicles,
          PreSolveVehicleActions.deselectVehicle,
          PreSolveVehicleActions.deselectVehicles
        ),
        switchMap(() =>
          this.store.pipe(
            select(PreSolveVehicleSelectors.selectFilteredVehiclesSelected),
            tap((vehicles) => this.toggleSelectedDepot(vehicles))
          )
        )
      ),
    { dispatch: false }
  );

  toogleSelectedDepot$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          ShipmentsActions.initialize,
          VehiclesActions.initialize,
          RoutesChartActions.initialize
        ),
        switchMap(() =>
          this.store.pipe(
            select(PreSolveVehicleSelectors.selectSelected),
            withLatestFrom(this.store.pipe(select(fromPreSolve.selectActive))),
            map(([vehicles, preSolveActive]) => {
              if (preSolveActive) {
                this.toggleSelectedDepot(vehicles);
              } else {
                this.depotLayer.deselectDepot();
              }
            })
          )
        )
      ),
    { dispatch: false }
  );

  private toggleSelectedDepot = (vehicles): void => {
    if (vehicles.length) {
      this.depotLayer.selectDepot();
    } else {
      this.depotLayer.deselectDepot();
    }
  };

  constructor(
    private actions$: Actions,
    private store: Store<fromRoot.State>,
    private depotLayer: DepotLayer
  ) {}
}
