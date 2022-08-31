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
import { ShipmentsKpis } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import PreSolveShipmentSelectors from '../../selectors/pre-solve-shipment.selectors';

@Component({
  selector: 'app-shipments-kpis',
  templateUrl: './shipments-kpis.component.html',
  styleUrls: ['./shipments-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsKpisComponent implements OnInit {
  shipmentsKpis$: Observable<ShipmentsKpis>;
  unitAbbreviations$: Observable<{ [unit: string]: string }>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.shipmentsKpis$ = this.store.pipe(select(PreSolveShipmentSelectors.selectShipmentsKpis));
    this.unitAbbreviations$ = this.store.pipe(select(fromConfig.selectUnitAbbreviations));
  }
}
