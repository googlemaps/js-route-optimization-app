/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  Component,
  ChangeDetectionStrategy,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FilterMenuComponent } from '../../../shared/components';
import { Observable, Subscription } from 'rxjs';
import { Column, VehicleOperatorFilterOption } from '../../models';
import { ActiveFilter } from '../../../shared/models';
import { FilterService } from '../../../shared/services';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import PreSolveVehicleOperatorSelectors from '../../selectors/pre-solve-vehicle-operator.selectors';
import { PreSolveVehicleOperatorActions, VehicleOperatorActions } from '../../actions';
import { exhaustMap, take } from 'rxjs/operators';
import { positionTopLeftRelativeToTopLeft } from '../../../util';

@Component({
  selector: 'app-vehicle-operators-control-bar',
  templateUrl: './vehicle-operators-control-bar.component.html',
  styleUrls: ['./vehicle-operators-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleOperatorsControlBarComponent implements OnDestroy {
  @ViewChild(FilterMenuComponent, { read: ElementRef })
  filterMenuElementRef: ElementRef<HTMLElement>;
  readonly filterOptions$: Observable<VehicleOperatorFilterOption[]>;
  readonly filters$: Observable<ActiveFilter[]>;
  readonly displayColumns$: Observable<Column[]>;
  readonly showBulkEdit$: Observable<boolean>;
  readonly showBulkDelete$: Observable<boolean>;

  private addSubscription: Subscription;
  private editSubscription: Subscription;

  constructor(private filterService: FilterService, private store: Store<fromRoot.State>) {
    this.filterOptions$ = store.pipe(
      select(PreSolveVehicleOperatorSelectors.selectAvailableFiltersOptions)
    );
    this.filters$ = store.pipe(select(PreSolveVehicleOperatorSelectors.selectFilters));
    this.displayColumns$ = store.pipe(
      select(PreSolveVehicleOperatorSelectors.selectAvailableDisplayColumnsOptions)
    );
    this.showBulkEdit$ = store.pipe(select(PreSolveVehicleOperatorSelectors.selectShowBulkEdit));
    this.showBulkDelete$ = store.pipe(
      select(PreSolveVehicleOperatorSelectors.selectShowBulkDelete)
    );
  }

  ngOnDestroy(): void {
    this.addSubscription?.unsubscribe();
    this.editSubscription?.unsubscribe();
  }

  onAddFilter(filterOption: VehicleOperatorFilterOption): void {
    this.addSubscription = this.filterService
      .createFilter(filterOption, this.filterMenuElementRef?.nativeElement)
      .subscribe((filter) => {
        if (filter) {
          this.store.dispatch(PreSolveVehicleOperatorActions.addFilter({ filter }));
        }
      });
  }

  onEditFilter(event: { filter: ActiveFilter; element: HTMLElement }): void {
    this.editSubscription = this.store
      .pipe(
        select(PreSolveVehicleOperatorSelectors.selectFiltersOptionById(event.filter.id)),
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
            PreSolveVehicleOperatorActions.editFilter({
              currentFilter,
              previousFilter: event.filter,
            })
          );
        }
      });
  }

  onRemoveFilter(filter: ActiveFilter): void {
    this.store.dispatch(PreSolveVehicleOperatorActions.removeFilter({ filter }));
  }

  onDisplayColumnChange({ columnId, active }: { columnId: string; active: boolean }): void {
    this.store
      .pipe(select(PreSolveVehicleOperatorSelectors.selectDisplayColumns), take(1))
      .subscribe((displayColumns) => {
        this.store.dispatch(
          PreSolveVehicleOperatorActions.changeDisplayColumns({
            displayColumns: { ...displayColumns, [columnId]: active },
          })
        );
      });
  }

  onBulkEdit(): void {
    this.store
      .pipe(
        select(PreSolveVehicleOperatorSelectors.selectFilteredVehicleOperatorsSelectedIds),
        take(1)
      )
      .subscribe((vehicleOperatorIds) => {
        this.store.dispatch(
          PreSolveVehicleOperatorActions.editVehicleOperators({ vehicleOperatorIds })
        );
      });
  }

  onBulkDelete(): void {
    this.store
      .pipe(
        select(PreSolveVehicleOperatorSelectors.selectFilteredVehicleOperatorsSelectedIds),
        take(1)
      )
      .subscribe((ids) => {
        this.store.dispatch(VehicleOperatorActions.confirmDeleteVehicleOperators({ ids }));
      });
  }
}
