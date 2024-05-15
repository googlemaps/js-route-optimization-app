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
import { PreSolveVehicleActions } from '../../actions';
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
}
