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
  EventEmitter,
  Input,
  NgZone,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Vehicle } from 'src/app/core/models';
import { DataSource } from 'src/app/shared/models';
import { durationMinutesSeconds, pad } from '../../../util';

@Component({
  selector: 'app-base-vehicles-table',
  templateUrl: './base-vehicles-table.component.html',
  styleUrls: ['./base-vehicles-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseVehiclesTableComponent {
  @Input() dataSource: DataSource<Vehicle>;
  @Input() sort?: { active: string; direction: string };
  @Input() itemsSelected: { [vehicleId: number]: boolean } = {};
  @Input() itemsDisabled: { [vehicleId: number]: boolean } = {};
  @Input() capacityTypes: string[];
  @Input() columnsToDisplay: string[];
  @Input() totalItems = 0;
  @Input() duration: [Long, Long];
  @Input() relativeTo: Long;
  @Input() unitAbbreviations: { [unit: string]: string };
  @Input() changeDisabled = false;
  @Output() add = new EventEmitter();
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() editVehicle = new EventEmitter<number>();
  @Output() deleteVehicle = new EventEmitter<Vehicle>();
  @Input() shipmentCount: number;

  constructor(private zone: NgZone) {}

  menuLabel(item: Vehicle): string {
    return `Vehicle ${item.label || '#' + item.id} menu`;
  }

  onEdit(vehicleId: number): void {
    this.zone.run(() => this.editVehicle.emit(vehicleId));
  }

  onDelete(item): void {
    this.zone.run(() => this.deleteVehicle.emit(item));
  }

  secondsToFormattedTime(duration): string {
    const durationMinSec: { minutes: number; seconds: number } = durationMinutesSeconds(duration);
    return pad(durationMinSec.minutes.toString()) + ':' + pad(durationMinSec.seconds.toString());
  }
}
