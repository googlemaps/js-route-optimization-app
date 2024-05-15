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
