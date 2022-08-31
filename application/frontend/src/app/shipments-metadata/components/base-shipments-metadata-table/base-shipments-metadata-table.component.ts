/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DataSource } from '@angular/cdk/table';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { ShipmentMetadata } from '../../models';
import { durationMinutesSeconds, pad } from '../../../util/duration';

@Component({
  selector: 'app-base-shipments-metadata-table',
  templateUrl: './base-shipments-metadata-table.component.html',
  styleUrls: ['./base-shipments-metadata-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseShipmentsMetadataTableComponent {
  @Input() dataSource: DataSource<ShipmentMetadata>;
  @Input() sort?: { active: string; direction: string };
  @Input() selected: { [id: number]: boolean } = {};
  @Input() columnsToDisplay: string[];
  @Input() total = 0;
  @Input() timezoneOffset = 0;
  @Input() changeDisabled = false;
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() edit = new EventEmitter<number>();
  @Output() mouseEnterVisitRequest = new EventEmitter<number>();
  @Output() mouseExitVisitRequest = new EventEmitter<number>();
  @Input() hasMap = false;

  constructor(private zone: NgZone) {}

  idSelector(item: ShipmentMetadata): number {
    return item.visitRequest.id;
  }

  selectedIdSelector(item: ShipmentMetadata): number {
    return item.shipment.id;
  }

  canSelect(item: ShipmentMetadata): boolean {
    return item.first;
  }

  editLabel(item: ShipmentMetadata): string {
    return `Edit shipment ${item.shipment.label || '#' + item.shipment.id}`;
  }

  onSelectionChange(value?: { id: number; selected: boolean }): void {
    this.zone.run(() => this.selectedChange.emit(value));
  }

  onDeselectAll(): void {
    this.zone.run(() => this.deselectAll.emit());
  }

  onSelectAll(): void {
    this.zone.run(() => this.selectAll.emit());
  }

  onSortChange(value: { active: string; direction: string }): void {
    this.zone.run(() => this.sortChange.emit(value));
  }

  onEdit(id: number): void {
    this.zone.run(() => this.edit.emit(id));
  }

  onMouseEnterRow(item: ShipmentMetadata): void {
    this.mouseEnterVisitRequest.emit(item.visitRequest.id);
  }

  onMouseExitRow(item: ShipmentMetadata): void {
    this.mouseExitVisitRequest.emit(item.visitRequest.id);
  }

  secondsToFormattedTime(duration): string {
    const durationMinSec: { minutes: number; seconds: number } = durationMinutesSeconds(duration);
    return pad(durationMinSec.minutes.toString()) + ':' + pad(durationMinSec.seconds.toString());
  }
}
