/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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

  onAdd(): void {
    this.store.dispatch(PreSolveVehicleActions.addVehicle({}));
  }
}
