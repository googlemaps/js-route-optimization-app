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

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PreSolveVehicleActions, VehicleActions } from 'src/app/core/actions';
import { Vehicle } from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromRoot from 'src/app/reducers';
import { DataSource } from 'src/app/shared/models';
import { VehiclesActions } from '../../actions';
import ShipmentModelSelectors from '../../../core/selectors/shipment-model.selectors';
import ShipmentRouteSelectors from '../../../core/selectors/shipment-route.selectors';

@Component({
  selector: 'app-vehicles',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehiclesComponent implements OnInit {
  readonly dataSource: DataSource<Vehicle>;
  readonly sort$: Observable<{ active: string; direction: string }>;
  readonly itemsSelected$: Observable<{ [vehicleId: number]: boolean }>;
  readonly itemsDisabled$: Observable<{ [vehicleId: number]: boolean }>;
  readonly capacityTypes$: Observable<string[]>;
  readonly columnsToDisplay$: Observable<string[]>;
  readonly duration$: Observable<[Long, Long]>;
  readonly relativeTo$: Observable<Long>;
  readonly unitAbbreviations$: Observable<{ [unit: string]: string }>;
  readonly totalItems$: Observable<number>;
  readonly pageIndex$: Observable<number>;
  readonly pageSize$: Observable<number>;
  readonly changeDisabled$: Observable<boolean>;
  readonly showBulkEdit$: Observable<boolean>;
  readonly showBulkDelete$: Observable<boolean>;
  shipmentCount$: Observable<number>;

  constructor(private store: Store<fromRoot.State>) {
    store.dispatch(VehiclesActions.initialize());
    this.dataSource = new DataSource(
      store.pipe(select(PreSolveVehicleSelectors.selectPagedVehicles))
    );
    this.sort$ = store.pipe(select(PreSolveVehicleSelectors.selectSort));
    this.itemsSelected$ = store.pipe(
      select(PreSolveVehicleSelectors.selectFilteredVehiclesSelectedLookup)
    );
    this.itemsDisabled$ = store.pipe(
      select(PreSolveVehicleSelectors.selectFilteredVehiclesDisabledLookup)
    );
    this.capacityTypes$ = store.pipe(select(PreSolveVehicleSelectors.selectCapacityTypes));
    this.columnsToDisplay$ = store.pipe(select(PreSolveVehicleSelectors.selectColumnsToDisplay));
    this.duration$ = store.pipe(select(ShipmentModelSelectors.selectGlobalDuration));
    this.relativeTo$ = this.duration$.pipe(map((duration) => duration?.values[0]));
    this.unitAbbreviations$ = store.pipe(select(fromConfig.selectUnitAbbreviations));
    this.totalItems$ = store.pipe(select(PreSolveVehicleSelectors.selectTotalFiltered));
    this.pageIndex$ = store.pipe(select(PreSolveVehicleSelectors.selectPageIndex));
    this.pageSize$ = store.pipe(select(PreSolveVehicleSelectors.selectPageSize));
    this.changeDisabled$ = store.pipe(select(fromScenario.selectChangeDisabled));
    this.showBulkEdit$ = store.pipe(select(PreSolveVehicleSelectors.selectShowBulkEdit));
    this.showBulkDelete$ = store.pipe(select(PreSolveVehicleSelectors.selectShowBulkDelete));
  }

  ngOnInit(): void {
    this.shipmentCount$ = this.store.pipe(
      select(ShipmentRouteSelectors.selectRouteShipmentCount(2))
    );
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      PreSolveVehicleActions.changePage({ pageIndex: event.pageIndex, pageSize: event.pageSize })
    );
  }

  onSelectAll(): void {
    this.store
      .pipe(select(PreSolveVehicleSelectors.selectFilteredVehicles), take(1))
      .subscribe((vehicles) => {
        this.store.dispatch(
          PreSolveVehicleActions.selectVehicles({
            vehicleIds: vehicles.reduce((result, vehicle) => {
              if (!vehicle.usedIfRouteIsEmpty) {
                return result.concat(vehicle.id);
              }
              return result;
            }, []),
          })
        );
      });
  }

  onDeselectAll(): void {
    this.store
      .pipe(select(PreSolveVehicleSelectors.selectFilteredVehicles), take(1))
      .subscribe((vehicles) => {
        this.store.dispatch(
          PreSolveVehicleActions.deselectVehicles({
            vehicleIds: vehicles.reduce((result, vehicle) => {
              if (!vehicle.usedIfRouteIsEmpty) {
                return result.concat(vehicle.id);
              }
              return result;
            }, []),
          })
        );
      });
  }

  onSelectedChange({ id, selected }: { id: number; selected: boolean }): void {
    const action = selected
      ? PreSolveVehicleActions.selectVehicle
      : PreSolveVehicleActions.deselectVehicle;
    this.store.dispatch(action({ vehicleId: id }));
  }

  onSortChange(sort: { active: string; direction: string }): void {
    this.store.dispatch(
      PreSolveVehicleActions.changeSort({ active: sort.active, direction: sort.direction })
    );
  }

  onEdit(vehicleId: number): void {
    this.store.dispatch(PreSolveVehicleActions.editVehicle({ vehicleId }));
  }

  onDelete(vehicle: Vehicle): void {
    this.store.dispatch(VehicleActions.confirmDeleteVehicle({ id: vehicle.id }));
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
