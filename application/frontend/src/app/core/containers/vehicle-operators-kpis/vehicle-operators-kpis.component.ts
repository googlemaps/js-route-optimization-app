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

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { VehicleOperatorsKpis } from '../../models';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import PreSolveVehicleOperatorSelectors from '../../selectors/pre-solve-vehicle-operator.selectors';

@Component({
  selector: 'app-vehicle-operators-kpis',
  templateUrl: './vehicle-operators-kpis.component.html',
  styleUrls: ['./vehicle-operators-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleOperatorsKpisComponent implements OnInit {
  vehicleOperatorsKpis$: Observable<VehicleOperatorsKpis>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.vehicleOperatorsKpis$ = this.store.pipe(
      select(PreSolveVehicleOperatorSelectors.selectVehicleOperatorsKpis)
    );
  }
}
