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
  ViewChild,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { exhaustMap, take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { FilterMenuComponent } from 'src/app/shared/components';
import { ActiveFilter } from 'src/app/shared/models';
import { FilterService } from 'src/app/shared/services';
import { positionTopLeftRelativeToTopLeft } from 'src/app/util';
import { PreSolveShipmentActions, ShipmentActions } from '../../actions';
import { Column, ShipmentFilterOption } from '../../models';
import PreSolveShipmentSelectors from '../../selectors/pre-solve-shipment.selectors';

@Component({
  selector: 'app-shipments-control-bar',
  templateUrl: './shipments-control-bar.component.html',
  styleUrls: ['./shipments-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsControlBarComponent implements OnDestroy {
  @ViewChild(FilterMenuComponent, { read: ElementRef })
  filterMenuElementRef: ElementRef<HTMLElement>;

  readonly filterOptions$: Observable<ShipmentFilterOption[]>;
  readonly filters$: Observable<ActiveFilter[]>;
  readonly displayColumns$: Observable<Column[]>;
  readonly showBulkEdit$: Observable<boolean>;
  readonly showBulkDelete$: Observable<boolean>;

  private addSubscription: Subscription;
  private editSubscription: Subscription;

  constructor(private filterService: FilterService, private store: Store<fromRoot.State>) {
    this.filterOptions$ = store.pipe(
      select(PreSolveShipmentSelectors.selectAvailableFiltersOptions)
    );
    this.filters$ = store.pipe(select(PreSolveShipmentSelectors.selectFilters));
    this.displayColumns$ = store.pipe(
      select(PreSolveShipmentSelectors.selectAvailableDisplayColumnsOptions)
    );
    this.showBulkEdit$ = store.pipe(select(PreSolveShipmentSelectors.selectShowBulkEdit));
    this.showBulkDelete$ = store.pipe(select(PreSolveShipmentSelectors.selectShowBulkDelete));
  }

  ngOnDestroy(): void {
    this.addSubscription?.unsubscribe();
    this.editSubscription?.unsubscribe();
  }

  onAddFilter(filterOption: ShipmentFilterOption): void {
    this.addSubscription = this.filterService
      .createFilter(filterOption, this.filterMenuElementRef?.nativeElement)
      .subscribe((filter) => {
        if (filter) {
          this.store.dispatch(PreSolveShipmentActions.addFilter({ filter }));
        }
      });
  }

  onEditFilter(event: { filter: ActiveFilter; element: HTMLElement }): void {
    this.editSubscription = this.store
      .pipe(
        select(PreSolveShipmentSelectors.selectFiltersOptionById(event.filter.id)),
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
            PreSolveShipmentActions.editFilter({ currentFilter, previousFilter: event.filter })
          );
        }
      });
  }

  onRemoveFilter(filter: ActiveFilter): void {
    this.store.dispatch(PreSolveShipmentActions.removeFilter({ filter }));
  }

  onDisplayColumnChange({ columnId, active }: { columnId: string; active: boolean }): void {
    this.store
      .pipe(select(PreSolveShipmentSelectors.selectDisplayColumns), take(1))
      .subscribe((displayColumns) => {
        this.store.dispatch(
          PreSolveShipmentActions.changeDisplayColumns({
            displayColumns: { ...displayColumns, [columnId]: active },
          })
        );
      });
  }

  onBulkEdit(): void {
    this.store
      .pipe(select(PreSolveShipmentSelectors.selectFilteredShipmentsSelectedIds), take(1))
      .subscribe((shipmentIds) => {
        this.store.dispatch(PreSolveShipmentActions.editShipments({ shipmentIds }));
      });
  }

  onBulkDelete(): void {
    this.store
      .pipe(select(PreSolveShipmentSelectors.selectFilteredShipmentsSelectedIds), take(1))
      .subscribe((ids) => {
        this.store.dispatch(ShipmentActions.confirmDeleteShipments({ ids }));
      });
  }
}
