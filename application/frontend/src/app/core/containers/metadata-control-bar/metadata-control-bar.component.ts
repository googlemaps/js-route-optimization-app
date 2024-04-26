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
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { exhaustMap, map, switchMap, take } from 'rxjs/operators';
import { FilterMenuComponent } from 'src/app/shared/components';
import { ActiveFilter, FilterOption } from 'src/app/shared/models';
import { FilterService } from 'src/app/shared/services';
import { positionTopLeftRelativeToTopLeft } from 'src/app/util';
import { MetadataControlBarActions } from '../../actions';
import { Column, Page } from '../../models';
import RoutesMetadataSelectors from '../../selectors/routes-metadata.selectors';
import * as fromShipmentsMetadata from '../../selectors/shipments-metadata.selectors';
import * as fromUI from '../../selectors/ui.selectors';

export type MetadataSelectors = typeof RoutesMetadataSelectors | typeof fromShipmentsMetadata;

@Component({
  selector: 'app-metadata-control-bar',
  templateUrl: './metadata-control-bar.component.html',
  styleUrls: ['./metadata-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetadataControlBarComponent implements OnInit, OnDestroy {
  @ViewChild(FilterMenuComponent, { read: ElementRef })
  filterMenuElementRef: ElementRef<HTMLElement>;
  filterOptions$: Observable<FilterOption[]>;
  filters$: Observable<ActiveFilter[]>;
  displayColumns$: Observable<Column[]>;
  page$: Observable<Page>;
  private pageSelectors$: Observable<{ page: Page; selectors: MetadataSelectors }>;
  private addSubscription: Subscription;
  private editSubscription: Subscription;

  get Page(): typeof Page {
    return Page;
  }

  constructor(private filterService: FilterService, private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.page$ = this.store.pipe(select(fromUI.selectPage));
    this.pageSelectors$ = this.page$.pipe(
      map((page) => ({
        page,
        selectors:
          page === Page.ShipmentsMetadata ? fromShipmentsMetadata : RoutesMetadataSelectors,
      }))
    );
    this.filterOptions$ = this.pageSelectors$.pipe(
      switchMap(({ selectors }) => this.store.pipe(select(selectors.selectAvailableFiltersOptions)))
    );
    this.filters$ = this.pageSelectors$.pipe(
      switchMap(({ selectors }) => this.store.pipe(select(selectors.selectFilters)))
    );
    this.displayColumns$ = this.pageSelectors$.pipe(
      switchMap(({ selectors }) =>
        this.store.pipe(select(selectors.selectAvailableDisplayColumnsOptions))
      )
    );
  }

  ngOnDestroy(): void {
    this.addSubscription?.unsubscribe();
    this.editSubscription?.unsubscribe();
  }

  onAddFilter(filterOption: FilterOption): void {
    this.addSubscription = this.page$
      .pipe(
        take(1),
        exhaustMap((page) =>
          this.filterService
            .createFilter(filterOption, this.filterMenuElementRef?.nativeElement)
            .pipe(map((filter) => ({ page, filter })))
        )
      )
      .subscribe(({ page, filter }) => {
        if (filter) {
          this.store.dispatch(MetadataControlBarActions.addFilter({ filter, page }));
        }
      });
  }

  onEditFilter(event: { filter: ActiveFilter; element: HTMLElement }): void {
    this.editSubscription = this.pageSelectors$
      .pipe(
        switchMap(({ page, selectors }) =>
          this.store.pipe(
            select(selectors.selectFiltersOptionById(event.filter.id)),
            map((filterOption) => ({ page, filterOption }))
          )
        ),
        take(1),
        exhaustMap(({ page, filterOption }) =>
          this.filterService
            .createFilter(
              filterOption,
              event.element,
              event.filter,
              positionTopLeftRelativeToTopLeft
            )
            .pipe(map((currentFilter) => ({ page, currentFilter })))
        )
      )
      .subscribe(({ page, currentFilter }) => {
        if (currentFilter) {
          this.store.dispatch(
            MetadataControlBarActions.editFilter({
              currentFilter,
              previousFilter: event.filter,
              page,
            })
          );
        }
      });
  }

  onRemoveFilter(filter: ActiveFilter): void {
    this.page$
      .pipe(take(1))
      .subscribe((page) =>
        this.store.dispatch(MetadataControlBarActions.removeFilter({ filter, page }))
      );
  }

  onDisplayColumnChange({ columnId, active }: { columnId: string; active: boolean }): void {
    this.pageSelectors$
      .pipe(
        switchMap(({ page, selectors }) =>
          this.store.pipe(
            select(selectors.selectDisplayColumns),
            map((displayColumns) => ({ page, displayColumns }))
          )
        ),
        take(1)
      )
      .subscribe(({ page, displayColumns }) => {
        this.store.dispatch(
          MetadataControlBarActions.changeDisplayColumns({
            displayColumns: { ...displayColumns, [columnId]: active },
            page,
          })
        );
      });
  }

  onSelectionChange(selection: Page): void {
    this.router.navigateByUrl('/' + selection, { skipLocationChange: true });
  }

  onToggleChange(selection: Page): void {
    this.router.navigateByUrl('/' + selection, { skipLocationChange: true });
  }
}
