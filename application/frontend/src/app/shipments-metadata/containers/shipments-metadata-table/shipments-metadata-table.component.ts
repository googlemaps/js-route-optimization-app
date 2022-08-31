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
import { take } from 'rxjs/operators';
import { PreSolveShipmentActions, ShipmentsMetadataActions } from 'src/app/core/actions';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromShipmentsMetadata from 'src/app/core/selectors/shipments-metadata.selectors';
import { DataSource } from 'src/app/shared/models';
import { ShipmentMetadata } from '../../models';
import { selectHasMap } from '../../../core/selectors/ui.selectors';

@Component({
  selector: 'app-shipments-metadata-table',
  templateUrl: './shipments-metadata-table.component.html',
  styleUrls: ['./shipments-metadata-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentsMetadataTableComponent implements OnInit {
  dataSource: DataSource<ShipmentMetadata>;
  sort$: Observable<{ active: string; direction: string }>;
  selected$: Observable<{ [id: number]: boolean }>;
  columnsToDisplay$: Observable<string[]>;
  timezoneOffset$: Observable<number>;
  total$: Observable<number>;
  pageIndex$: Observable<number>;
  pageSize$: Observable<number>;
  changeDisabled$: Observable<boolean>;
  readonly mapOpen$: Observable<boolean>;

  constructor(private store: Store) {
    store.dispatch(ShipmentsMetadataActions.initialize());
    this.mapOpen$ = store.pipe(select(selectHasMap));
  }

  ngOnInit(): void {
    this.dataSource = new DataSource(
      this.store.pipe(select(fromShipmentsMetadata.selectPagedShipmentMetadata))
    );
    this.sort$ = this.store.pipe(select(fromShipmentsMetadata.selectSort));
    this.selected$ = this.store.pipe(
      select(fromShipmentsMetadata.selectFilteredShipmentsSelectedLookup)
    );
    this.columnsToDisplay$ = this.store.pipe(select(fromShipmentsMetadata.selectColumnsToDisplay));
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
    this.total$ = this.store.pipe(select(fromShipmentsMetadata.selectTotalFiltered));
    this.pageIndex$ = this.store.pipe(select(fromShipmentsMetadata.selectPageIndex));
    this.pageSize$ = this.store.pipe(select(fromShipmentsMetadata.selectPageSize));
    this.changeDisabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      ShipmentsMetadataActions.changePage({ pageIndex: event.pageIndex, pageSize: event.pageSize })
    );
  }

  onSelectAll(): void {
    this.store
      .pipe(select(fromShipmentsMetadata.selectFilteredShipmentIds), take(1))
      .subscribe((shipmentIds) => {
        this.store.dispatch(ShipmentsMetadataActions.selectShipments({ shipmentIds }));
      });
  }

  onDeselectAll(): void {
    this.store
      .pipe(select(fromShipmentsMetadata.selectFilteredShipmentIds), take(1))
      .subscribe((shipmentIds) => {
        this.store.dispatch(ShipmentsMetadataActions.deselectShipments({ shipmentIds }));
      });
  }

  onSelectedChange({ id, selected }: { id: number; selected: boolean }): void {
    const action = selected
      ? ShipmentsMetadataActions.selectShipment
      : ShipmentsMetadataActions.deselectShipment;
    this.store.dispatch(action({ shipmentId: id }));
  }

  onSortChange(sort: { active: string; direction: string }): void {
    this.store.dispatch(
      ShipmentsMetadataActions.changeSort({ active: sort.active, direction: sort.direction })
    );
  }

  onEdit(shipmentId: number): void {
    this.store.dispatch(ShipmentsMetadataActions.editShipment({ shipmentId }));
  }

  onMouseEnterVisitRequest(id: number): void {
    this.store.dispatch(PreSolveShipmentActions.mouseEnterVisitRequest({ id }));
  }

  onMouseExitVisitRequest(): void {
    this.store.dispatch(PreSolveShipmentActions.mouseExitVisitRequest());
  }
}
