/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { RoutesMetadataActions } from 'src/app/core/actions';
import RoutesMetadataSelectors from 'src/app/core/selectors/routes-metadata.selectors';
import { RouteMetadata } from '../../models';
import { DataSource } from 'src/app/shared/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-routes-metadata-table',
  templateUrl: './routes-metadata-table.component.html',
  styleUrls: ['./routes-metadata-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesMetadataTableComponent implements OnInit {
  changeDisabled$: Observable<boolean>;
  columnsToDisplay$: Observable<string[]>;
  dataSource: DataSource<RouteMetadata>;
  pageIndex$: Observable<number>;
  pageSize$: Observable<number>;
  selected$: Observable<{ [id: number]: boolean }>;
  sort$: Observable<{ active: string; direction: string }>;
  total$: Observable<number>;
  unitAbbreviations$: Observable<{
    [unit: string]: string;
  }>;

  constructor(private store: Store) {
    store.dispatch(RoutesMetadataActions.initialize());
  }

  ngOnInit(): void {
    this.changeDisabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));
    this.columnsToDisplay$ = this.store.pipe(
      select(RoutesMetadataSelectors.selectColumnsToDisplay)
    );
    this.dataSource = new DataSource(
      this.store.pipe(select(RoutesMetadataSelectors.selectPagedRouteMetadata))
    );
    this.pageIndex$ = this.store.pipe(select(RoutesMetadataSelectors.selectPageIndex));
    this.pageSize$ = this.store.pipe(select(RoutesMetadataSelectors.selectPageSize));
    this.selected$ = this.store.pipe(
      select(RoutesMetadataSelectors.selectFilteredRoutesSelectedLookup)
    );
    this.sort$ = this.store.pipe(select(RoutesMetadataSelectors.selectSort));
    this.total$ = this.store.pipe(select(RoutesMetadataSelectors.selectTotalFiltered));
    this.unitAbbreviations$ = this.store.select(fromConfig.selectUnitAbbreviations);
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      RoutesMetadataActions.changePage({ pageIndex: event.pageIndex, pageSize: event.pageSize })
    );
  }

  onSelectedChange({ id, selected }: { id: number; selected: boolean }): void {
    const action = selected
      ? RoutesMetadataActions.selectRoute
      : RoutesMetadataActions.deselectRoute;
    this.store.dispatch(action({ routeId: id }));
  }

  onSortChange(sort: { active: string; direction: string }): void {
    this.store.dispatch(
      RoutesMetadataActions.changeSort({ active: sort.active, direction: sort.direction })
    );
  }

  onSelectAll(): void {
    this.store
      .pipe(select(RoutesMetadataSelectors.selectFilteredRouteIds), take(1))
      .subscribe((routeIds) => {
        this.store.dispatch(RoutesMetadataActions.selectRoutes({ routeIds }));
      });
  }

  onDeselectAll(): void {
    this.store
      .pipe(select(RoutesMetadataSelectors.selectFilteredRouteIds), take(1))
      .subscribe((routeIds) => {
        this.store.dispatch(RoutesMetadataActions.deselectRoutes({ routeIds }));
      });
  }
}
