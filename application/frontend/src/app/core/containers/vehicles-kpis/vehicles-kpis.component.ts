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

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from 'src/app/reducers';
import { VehiclesKpis } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import PreSolveVehicleSelectors from '../../selectors/pre-solve-vehicle.selectors';

@Component({
  selector: 'app-vehicles-kpis',
  templateUrl: './vehicles-kpis.component.html',
  styleUrls: ['./vehicles-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesKpisComponent implements OnInit {
  vehiclesKpis$: Observable<VehiclesKpis>;
  unitAbbreviations$: Observable<{ [unit: string]: string }>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.vehiclesKpis$ = this.store.pipe(select(PreSolveVehicleSelectors.selectVehiclesKpis));
    this.unitAbbreviations$ = this.store.pipe(select(fromConfig.selectUnitAbbreviations));
  }
}
