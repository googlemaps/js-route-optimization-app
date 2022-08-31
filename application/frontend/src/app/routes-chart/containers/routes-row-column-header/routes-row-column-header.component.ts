/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as RoutesChartActions from 'src/app/core/actions/routes-chart.actions';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import { State } from 'src/app/reducers';

@Component({
  selector: 'app-routes-row-column-header',
  templateUrl: './routes-row-column-header.component.html',
  styleUrls: ['./routes-row-column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesRowColumnHeaderComponent {
  readonly totalRoutes$: Observable<number>;
  readonly totalSelectedRoutes$: Observable<number>;

  constructor(private store: Store<State>) {
    this.totalRoutes$ = store.pipe(select(RoutesChartSelectors.selectTotalFilteredRoutes));
    this.totalSelectedRoutes$ = store.pipe(
      select(RoutesChartSelectors.selectTotalFilteredRoutesSelected)
    );
  }

  onSelectAllRoutes(): void {
    this.store
      .pipe(select(RoutesChartSelectors.selectFilteredRoutes), take(1))
      .subscribe((routes) => {
        this.store.dispatch(RoutesChartActions.selectRoutes({ routeIds: routes.map((r) => r.id) }));
      });
  }

  onDeselectAllRoutes(): void {
    this.store
      .pipe(select(RoutesChartSelectors.selectFilteredRoutes), take(1))
      .subscribe((routes) => {
        this.store.dispatch(
          RoutesChartActions.deselectRoutes({ routeIds: routes.map((r) => r.id) })
        );
      });
  }
}
