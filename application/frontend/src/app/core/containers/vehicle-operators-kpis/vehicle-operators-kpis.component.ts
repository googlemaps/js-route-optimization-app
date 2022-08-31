/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
