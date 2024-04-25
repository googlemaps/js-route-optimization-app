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

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import { FilterMenuComponent } from 'src/app/shared/components';
import { ActiveFilter, Timezone, UnitStep } from 'src/app/shared/models';
import { FilterService } from 'src/app/shared/services';
import { positionTopLeftRelativeToTopLeft } from 'src/app/util';
import { ConfigActions, RoutesChartActions } from '../../actions';
import { RouteFilterOption } from '../../models';

@Component({
  selector: 'app-routes-chart-control-bar',
  templateUrl: './routes-chart-control-bar.component.html',
  styleUrls: ['./routes-chart-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesChartControlBarComponent implements OnInit, OnDestroy {
  @ViewChild(FilterMenuComponent, { read: ElementRef })
  filterMenuElementRef: ElementRef<HTMLElement>;
  ranges$: Observable<UnitStep[]>;
  rangeIndex$: Observable<number>;
  filterOptions$: Observable<RouteFilterOption[]>;
  filters$: Observable<ActiveFilter[]>;
  range$: Observable<number>;
  currentTimezone$: Observable<Timezone>;
  timezoneOffset$: Observable<number>;
  private addSubscription: Subscription;
  private editSubscription: Subscription;

  constructor(private filterService: FilterService, private store: Store) {}

  ngOnInit(): void {
    this.ranges$ = this.store.pipe(select(RoutesChartSelectors.selectRanges));
    this.rangeIndex$ = this.store.pipe(select(RoutesChartSelectors.selectRangeIndex));
    this.filterOptions$ = this.store.pipe(
      select(RoutesChartSelectors.selectAvailableFiltersOptions)
    );
    this.filters$ = this.store.pipe(select(RoutesChartSelectors.selectFilters));
    this.currentTimezone$ = this.store.pipe(select(fromConfig.selectTimezone));
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
  }

  ngOnDestroy(): void {
    this.addSubscription?.unsubscribe();
    this.editSubscription?.unsubscribe();
  }

  onAddFilter(filterOption: RouteFilterOption): void {
    this.addSubscription = this.filterService
      .createFilter(filterOption, this.filterMenuElementRef?.nativeElement)
      .subscribe((filter) => {
        if (filter) {
          this.store.dispatch(RoutesChartActions.addFilter({ filter }));
        }
      });
  }

  onEditFilter(event: { filter: ActiveFilter; element: HTMLElement }): void {
    this.editSubscription = this.store
      .pipe(
        select(RoutesChartSelectors.selectFiltersOptionById(event.filter.id)),
        take(1),
        exhaustMap((filterOption) =>
          this.filterService.createFilter(
            filterOption,
            event.element,
            event.filter,
            positionTopLeftRelativeToTopLeft
          )
        )
      )
      .subscribe((currentFilter) => {
        if (currentFilter) {
          this.store.dispatch(
            RoutesChartActions.editFilter({ currentFilter, previousFilter: event.filter })
          );
        }
      });
  }

  onRemoveFilter(filter: ActiveFilter): void {
    this.store.dispatch(RoutesChartActions.removeFilter({ filter }));
  }

  onRangeIndexSelect(rangeIndex: number): void {
    this.store.dispatch(RoutesChartActions.selectRange({ rangeIndex }));
  }

  onUpdateTimezone(selectedTimezone: Timezone): void {
    this.store.dispatch(ConfigActions.setTimezone({ newTimezone: selectedTimezone }));
  }

  trackRangeBy(index: number): number {
    return index;
  }
}
