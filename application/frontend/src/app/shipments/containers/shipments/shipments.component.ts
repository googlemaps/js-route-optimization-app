/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { PreSolveShipmentActions, ShipmentActions } from 'src/app/core/actions';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import { selectHasMap } from 'src/app/core/selectors/ui.selectors';
import * as fromRoot from 'src/app/reducers';
import { DataSource } from 'src/app/shared/models';
import { ShipmentsActions } from '../../actions';
import { ShipmentItem } from '../../models';
import ShipmentModelSelectors from '../../../core/selectors/shipment-model.selectors';

@Component({
  selector: 'app-shipments',
  templateUrl: './shipments.component.html',
  styleUrls: ['./shipments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsComponent {
  readonly dataSource: DataSource<ShipmentItem>;
  readonly sort$: Observable<{ active: string; direction: string }>;
  readonly itemsSelected$: Observable<{ [shipmentId: number]: boolean }>;
  readonly demandTypes$: Observable<string[]>;
  readonly columnsToDisplay$: Observable<string[]>;
  readonly duration$: Observable<[Long, Long]>;
  readonly relativeTo$: Observable<Long>;
  readonly unitAbbreviations$: Observable<{ [unit: string]: string }>;
  readonly timezoneOffset$: Observable<number>;
  readonly totalShipments$: Observable<number>;
  readonly pageIndex$: Observable<number>;
  readonly pageSize$: Observable<number>;
  readonly changeDisabled$: Observable<boolean>;
  readonly mapOpen$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {
    store.dispatch(ShipmentsActions.initialize());
    this.dataSource = new DataSource(
      store.pipe(select(PreSolveShipmentSelectors.selectPagedShipmentItems))
    );
    this.sort$ = store.pipe(select(PreSolveShipmentSelectors.selectSort));
    this.itemsSelected$ = store.pipe(
      select(PreSolveShipmentSelectors.selectFilteredShipmentsSelectedLookup)
    );
    this.demandTypes$ = store.pipe(select(PreSolveShipmentSelectors.selectDemandTypes));
    this.columnsToDisplay$ = store.pipe(select(PreSolveShipmentSelectors.selectColumnsToDisplay));
    this.duration$ = store.pipe(select(ShipmentModelSelectors.selectGlobalDuration));
    this.relativeTo$ = this.duration$.pipe(map((duration) => duration?.values[0]));
    this.unitAbbreviations$ = store.pipe(select(fromConfig.selectUnitAbbreviations));
    this.timezoneOffset$ = store.pipe(select(fromConfig.selectTimezoneOffset));
    this.totalShipments$ = store.pipe(select(PreSolveShipmentSelectors.selectTotalFiltered));
    this.pageIndex$ = store.pipe(select(PreSolveShipmentSelectors.selectPageIndex));
    this.pageSize$ = store.pipe(select(PreSolveShipmentSelectors.selectPageSize));
    this.changeDisabled$ = store.pipe(select(fromScenario.selectChangeDisabled));
    this.mapOpen$ = store.pipe(select(selectHasMap));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      PreSolveShipmentActions.changePage({ pageIndex: event.pageIndex, pageSize: event.pageSize })
    );
  }

  onSelectAll(): void {
    this.store
      .pipe(select(PreSolveShipmentSelectors.selectFilteredShipments), take(1))
      .subscribe((shipments) => {
        this.store.dispatch(
          PreSolveShipmentActions.selectShipments({ shipmentIds: shipments.map((s) => s.id) })
        );
      });
  }

  onDeselectAll(): void {
    this.store
      .pipe(select(PreSolveShipmentSelectors.selectFilteredShipments), take(1))
      .subscribe((shipments) => {
        this.store.dispatch(
          PreSolveShipmentActions.deselectShipments({ shipmentIds: shipments.map((s) => s.id) })
        );
      });
  }

  onSelectedChange({ id, selected }: { id: number; selected: boolean }): void {
    const action = selected
      ? PreSolveShipmentActions.selectShipment
      : PreSolveShipmentActions.deselectShipment;
    this.store.dispatch(action({ shipmentId: id }));
  }

  onSortChange(sort: { active: string; direction: string }): void {
    this.store.dispatch(
      PreSolveShipmentActions.changeSort({ active: sort.active, direction: sort.direction })
    );
  }

  onAdd(): void {
    this.store.dispatch(PreSolveShipmentActions.addShipment({}));
  }

  onEdit(shipmentId: number): void {
    this.store.dispatch(PreSolveShipmentActions.editShipment({ shipmentId }));
  }

  onDelete(item: ShipmentItem): void {
    this.store.dispatch(ShipmentActions.confirmDeleteShipment({ id: item.shipment.id }));
  }

  onMouseEnterVisitRequest(id: number): void {
    this.store.dispatch(PreSolveShipmentActions.mouseEnterVisitRequest({ id }));
  }

  onMouseExitVisitRequest(): void {
    this.store.dispatch(PreSolveShipmentActions.mouseExitVisitRequest());
  }
}
