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
import PreSolveShipmentSelectors from '../../selectors/pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from '../../selectors/pre-solve-vehicle.selectors';

@Component({
  selector: 'app-pre-solve-message',
  templateUrl: './pre-solve-message.component.html',
  styleUrls: ['./pre-solve-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSolveMessageComponent implements OnInit {
  numberOfShipments$: Observable<number>;
  numberOfVehicles$: Observable<number>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.numberOfShipments$ = this.store.pipe(
      select(PreSolveShipmentSelectors.selectTotalSelected)
    );
    this.numberOfVehicles$ = this.store.pipe(select(PreSolveVehicleSelectors.selectTotalSelected));
  }
}
