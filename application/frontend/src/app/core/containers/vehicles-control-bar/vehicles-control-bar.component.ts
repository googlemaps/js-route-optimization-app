/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
import { PreSolveVehicleActions, VehicleActions } from '../../actions';
import { Column, VehicleFilterOption } from '../../models';
import PreSolveVehicleSelectors from '../../selectors/pre-solve-vehicle.selectors';

@Component({
  selector: 'app-vehicles-control-bar',
  templateUrl: './vehicles-control-bar.component.html',
  styleUrls: ['./vehicles-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesControlBarComponent implements OnDestroy {
  @ViewChild(FilterMenuComponent, { read: ElementRef })
  filterMenuElementRef: ElementRef<HTMLElement>;
  readonly filterOptions$: Observable<VehicleFilterOption[]>;
  readonly filters$: Observable<ActiveFilter[]>;
  readonly displayColumns$: Observable<Column[]>;
  readonly showBulkEdit$: Observable<boolean>;
  readonly showBulkDelete$: Observable<boolean>;

  private addSubscription: Subscription;
  private editSubscription: Subscription;

  constructor(private filterService: FilterService, private store: Store<fromRoot.State>) {
    this.filterOptions$ = store.pipe(
      select(PreSolveVehicleSelectors.selectAvailableFiltersOptions)
    );
    this.filters$ = store.pipe(select(PreSolveVehicleSelectors.selectFilters));
    this.displayColumns$ = store.pipe(
      select(PreSolveVehicleSelectors.selectAvailableDisplayColumnsOptions)
    );
    this.showBulkEdit$ = store.pipe(select(PreSolveVehicleSelectors.selectShowBulkEdit));
    this.showBulkDelete$ = store.pipe(select(PreSolveVehicleSelectors.selectShowBulkDelete));
  }

  ngOnDestroy(): void {
    this.addSubscription?.unsubscribe();
    this.editSubscription?.unsubscribe();
  }

  onAddFilter(filterOption: VehicleFilterOption): void {
    this.addSubscription = this.filterService
      .createFilter(filterOption, this.filterMenuElementRef?.nativeElement)
      .subscribe((filter) => {
        if (filter) {
          this.store.dispatch(PreSolveVehicleActions.addFilter({ filter }));
        }
      });
  }

  onEditFilter(event: { filter: ActiveFilter; element: HTMLElement }): void {
    this.editSubscription = this.store
      .pipe(
        select(PreSolveVehicleSelectors.selectFiltersOptionById(event.filter.id)),
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
            PreSolveVehicleActions.editFilter({ currentFilter, previousFilter: event.filter })
          );
        }
      });
  }

  onRemoveFilter(filter: ActiveFilter): void {
    this.store.dispatch(PreSolveVehicleActions.removeFilter({ filter }));
  }

  onDisplayColumnChange({ columnId, active }: { columnId: string; active: boolean }): void {
    this.store
      .pipe(select(PreSolveVehicleSelectors.selectDisplayColumns), take(1))
      .subscribe((displayColumns) => {
        this.store.dispatch(
          PreSolveVehicleActions.changeDisplayColumns({
            displayColumns: { ...displayColumns, [columnId]: active },
          })
        );
      });
  }

  onBulkEdit(): void {
    this.store
      .pipe(select(PreSolveVehicleSelectors.selectFilteredVehiclesSelectedIds), take(1))
      .subscribe((vehicleIds) => {
        this.store.dispatch(PreSolveVehicleActions.editVehicles({ vehicleIds }));
      });
  }

  onBulkDelete(): void {
    this.store
      .pipe(select(PreSolveVehicleSelectors.selectFilteredVehiclesSelectedIds), take(1))
      .subscribe((ids) => {
        this.store.dispatch(VehicleActions.confirmDeleteVehicles({ ids }));
      });
  }
}
