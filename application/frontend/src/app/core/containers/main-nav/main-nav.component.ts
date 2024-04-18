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

import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Page } from '../../models';
import DenormalizeSelectors from 'src/app/core/selectors/denormalize.selectors';
import DispatcherApiSelectors from '../../selectors/dispatcher-api.selectors';
import * as fromPreSolve from 'src/app/core/selectors/pre-solve.selectors';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromConfig from 'src/app/core/selectors/config.selectors';

@Component({
  selector: 'app-main-nav',
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainNavComponent {
  readonly disabled$: Observable<boolean>;
  readonly hasSolution$: Observable<boolean>;
  readonly isSolutionStale$: Observable<boolean>;
  readonly isSolutionIllegal$: Observable<boolean>;
  readonly page$: Observable<Page>;
  readonly selectedShipmentCount$: Observable<number>;
  readonly selectedVehicleCount$: Observable<number>;
  readonly allowExperimentalFeatures$: Observable<boolean>;

  readonly solving$: Observable<boolean>;

  get Page(): typeof Page {
    return Page;
  }

  constructor(private router: Router, private store: Store) {
    this.disabled$ = this.store.pipe(select(fromPreSolve.selectGenerateDisabled));
    this.hasSolution$ = this.store.pipe(select(fromSolution.selectHasSolution));
    this.isSolutionStale$ = this.store.pipe(select(DenormalizeSelectors.selectIsSolutionStale));
    this.isSolutionIllegal$ = this.store.pipe(select(DenormalizeSelectors.selectIsSolutionIllegal));
    this.selectedShipmentCount$ = this.store.pipe(
      select(PreSolveShipmentSelectors.selectTotalSelected)
    );
    this.selectedVehicleCount$ = this.store.pipe(
      select(PreSolveVehicleSelectors.selectTotalSelected)
    );
    this.solving$ = store.pipe(select(DispatcherApiSelectors.selectOptimizeToursLoading));
    this.page$ = this.store.pipe(select(fromUI.selectPage));
    this.allowExperimentalFeatures$ = this.store.pipe(
      select(fromConfig.selectAllowExperimentalFeatures)
    );
  }

  onShipmentsClick(): void {
    this.router.navigateByUrl('/shipments', { skipLocationChange: true });
  }

  onSolutionClick(): void {
    this.router.navigateByUrl('/routesChart', { skipLocationChange: true });
  }

  onVehiclesClick(): void {
    this.router.navigateByUrl('/vehicles', { skipLocationChange: true });
  }
}
