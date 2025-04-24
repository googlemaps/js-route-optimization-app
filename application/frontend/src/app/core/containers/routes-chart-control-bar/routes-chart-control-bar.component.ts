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
import { combineLatest, Observable, Subscription } from 'rxjs';
import { exhaustMap, map, take } from 'rxjs/operators';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import { FilterMenuComponent } from 'src/app/shared/components';
import { ActiveFilter, Timezone, UnitStep } from 'src/app/shared/models';
import { FilterService } from 'src/app/shared/services';
import { positionTopLeftRelativeToTopLeft } from 'src/app/util';
import { ConfigActions, PostSolveControlBarActions, RoutesChartActions } from '../../actions';
import { Page, RouteFilterOption } from '../../models';
import { Router } from '@angular/router';
import { Range } from 'src/app/shared/models';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import RoutesMetadataSelectors from '../../selectors/routes-metadata.selectors';

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
  dayRange$: Observable<number>;
  page$: Observable<Page>;
  range$: Observable<Range>;
  rangeOffset$: Observable<number>;
  nowRangeOffset$: Observable<number>;
  currentTimezone$: Observable<Timezone>;
  timezoneOffset$: Observable<number>;
  globalDuration$: Observable<[Long, Long]>;
  private addSubscription: Subscription;
  private editSubscription: Subscription;
  viewHasChanged$: Observable<boolean>;

  get Page(): typeof Page {
    return Page;
  }

  constructor(private filterService: FilterService, private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.ranges$ = this.store.pipe(select(RoutesChartSelectors.selectRanges));
    this.rangeIndex$ = this.store.pipe(select(RoutesChartSelectors.selectRangeIndex));
    this.filterOptions$ = this.store.pipe(
      select(RoutesChartSelectors.selectAvailableFiltersOptions)
    );
    this.filters$ = this.store.pipe(select(RoutesChartSelectors.selectFilters));
    this.currentTimezone$ = this.store.pipe(select(fromConfig.selectTimezone));
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
    this.range$ = this.store.pipe(select(RoutesChartSelectors.selectSelectedRange));
    this.rangeOffset$ = this.store.pipe(select(RoutesChartSelectors.selectRangeOffset));
    this.nowRangeOffset$ = this.store.pipe(select(RoutesChartSelectors.selectNowRangeOffset));
    this.globalDuration$ = this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration));
    this.page$ = this.store.pipe(
      select(fromUI.selectPage),
      map((page) => (page === Page.ShipmentsMetadata ? Page.RoutesMetadata : page))
    );
    this.viewHasChanged$ = combineLatest([
      this.store.pipe(select(RoutesChartSelectors.selectViewHasChanged)),
      this.store.pipe(select(RoutesMetadataSelectors.selectViewHasChanged)),
    ]).pipe(map(([chartChanged, metadataChanged]) => chartChanged || metadataChanged));
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

  onToggleChange(selection: Page): void {
    this.router.navigateByUrl('/' + selection, { skipLocationChange: true });
  }

  onRangeOffsetChange(rangeOffset: number): void {
    this.store.dispatch(PostSolveControlBarActions.changeRangeOffset({ rangeOffset }));
  }

  onResetView(): void {
    this.store.dispatch(RoutesChartActions.resetView());
  }
}
