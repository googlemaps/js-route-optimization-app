/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
