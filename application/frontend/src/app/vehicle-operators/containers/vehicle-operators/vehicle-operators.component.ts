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

import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DataSource } from '../../../shared/models';
import { VehicleOperator } from '../../../core/models';
import { Observable } from 'rxjs';
import { select, Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { VehicleOperatorsActions } from '../../actions';
import { take } from 'rxjs/operators';
import * as fromScenario from '../../../core/selectors/scenario.selectors';
import ShipmentRouteSelectors from '../../../core/selectors/shipment-route.selectors';
import { PageEvent } from '@angular/material/paginator';
import { PreSolveVehicleOperatorActions, VehicleOperatorActions } from '../../../core/actions';
import PreSolveVehicleOperatorSelectors from '../../../core/selectors/pre-solve-vehicle-operator.selectors';
import * as fromConfig from 'src/app/core/selectors/config.selectors';

@Component({
  selector: 'app-vehicle-operators',
  templateUrl: './vehicle-operators.component.html',
  styleUrls: ['./vehicle-operators.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleOperatorsComponent implements OnInit {
  readonly dataSource: DataSource<VehicleOperator>;
  readonly sort$: Observable<{ active: string; direction: string }>;
  readonly itemsSelected$: Observable<{ [vehicleOperatorId: number]: boolean }>;
  readonly capacityTypes$: Observable<string[]>;
  readonly columnsToDisplay$: Observable<string[]>;
  readonly unitAbbreviations$: Observable<{ [unit: string]: string }>;
  readonly totalItems$: Observable<number>;
  readonly pageIndex$: Observable<number>;
  readonly pageSize$: Observable<number>;
  readonly changeDisabled$: Observable<boolean>;
  shipmentCount$: Observable<number>;
  readonly timezoneOffset$: Observable<number>;

  constructor(private store: Store<fromRoot.State>) {
    store.dispatch(VehicleOperatorsActions.initialize());
    this.dataSource = new DataSource(
      store.pipe(select(PreSolveVehicleOperatorSelectors.selectPagedVehicleOperators))
    );
    this.sort$ = store.pipe(select(PreSolveVehicleOperatorSelectors.selectSort));
    this.itemsSelected$ = store.pipe(
      select(PreSolveVehicleOperatorSelectors.selectFilteredVehicleOperatorsSelectedLookup)
    );
    this.columnsToDisplay$ = store.pipe(
      select(PreSolveVehicleOperatorSelectors.selectColumnsToDisplay)
    );
    this.totalItems$ = store.pipe(select(PreSolveVehicleOperatorSelectors.selectTotalFiltered));
    this.pageIndex$ = store.pipe(select(PreSolveVehicleOperatorSelectors.selectPageIndex));
    this.pageSize$ = store.pipe(select(PreSolveVehicleOperatorSelectors.selectPageSize));
    this.changeDisabled$ = store.pipe(select(fromScenario.selectChangeDisabled));
    this.timezoneOffset$ = store.pipe(select(fromConfig.selectTimezoneOffset));
  }

  ngOnInit(): void {
    this.shipmentCount$ = this.store.pipe(
      select(ShipmentRouteSelectors.selectRouteShipmentCount(2))
    );
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      PreSolveVehicleOperatorActions.changePage({
        pageIndex: event.pageIndex,
        pageSize: event.pageSize,
      })
    );
  }

  onSelectAll(): void {
    this.store
      .pipe(select(PreSolveVehicleOperatorSelectors.selectFilteredVehicleOperators), take(1))
      .subscribe((vehicleOperators) => {
        this.store.dispatch(
          PreSolveVehicleOperatorActions.selectVehicleOperators({
            vehicleOperatorIds: vehicleOperators.map((s) => s.id),
          })
        );
      });
  }

  onDeselectAll(): void {
    this.store
      .pipe(select(PreSolveVehicleOperatorSelectors.selectFilteredVehicleOperators), take(1))
      .subscribe((vehicleOperators) => {
        this.store.dispatch(
          PreSolveVehicleOperatorActions.deselectVehicleOperators({
            vehicleOperatorIds: vehicleOperators.map((s) => s.id),
          })
        );
      });
  }

  onSelectedChange({ id, selected }: { id: number; selected: boolean }): void {
    const action = selected
      ? PreSolveVehicleOperatorActions.selectVehicleOperator
      : PreSolveVehicleOperatorActions.deselectVehicleOperator;
    this.store.dispatch(action({ vehicleOperatorId: id }));
  }

  onSortChange(sort: { active: string; direction: string }): void {
    this.store.dispatch(
      PreSolveVehicleOperatorActions.changeSort({ active: sort.active, direction: sort.direction })
    );
  }

  onEdit(vehicleOperatorId: number): void {
    this.store.dispatch(PreSolveVehicleOperatorActions.editVehicleOperator({ vehicleOperatorId }));
  }

  onDelete(vehicleOperator: VehicleOperator): void {
    this.store.dispatch(
      VehicleOperatorActions.confirmDeleteVehicleOperator({ id: vehicleOperator.id })
    );
  }

  onAdd(): void {
    this.store.dispatch(PreSolveVehicleOperatorActions.addVehicleOperator({}));
  }
}
