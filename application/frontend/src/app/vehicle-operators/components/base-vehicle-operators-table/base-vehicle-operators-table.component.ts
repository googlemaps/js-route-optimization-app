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
  ViewEncapsulation,
  Input,
  Output,
  EventEmitter,
  NgZone,
} from '@angular/core';
import { DataSource } from '../../../shared/models';
import { VehicleOperator } from '../../../core/models';
import { durationMinutesSeconds, pad } from '../../../util';

@Component({
  selector: 'app-base-vehicle-operators-table',
  templateUrl: './base-vehicle-operators-table.component.html',
  styleUrls: ['./base-vehicle-operators-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseVehicleOperatorsTableComponent {
  @Input() dataSource: DataSource<VehicleOperator>;
  @Input() sort?: { active: string; direction: string };
  @Input() itemsSelected: { [vehicleOperatorId: number]: boolean } = {};
  @Input() columnsToDisplay: string[];
  @Input() totalItems = 0;
  @Input() changeDisabled = false;
  @Output() add = new EventEmitter();
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() editVehicleOperator = new EventEmitter<number>();
  @Output() deleteVehicleOperator = new EventEmitter<VehicleOperator>();
  @Input() timezoneOffset = 0;

  constructor(private zone: NgZone) {}

  menuLabel(item: VehicleOperator): string {
    return `VehicleOperator ${item.label || '#' + item.id} menu`;
  }

  onEdit(vehicleOperatorId: number): void {
    this.zone.run(() => this.editVehicleOperator.emit(vehicleOperatorId));
  }

  onDelete(item): void {
    this.zone.run(() => this.deleteVehicleOperator.emit(item));
  }

  secondsToFormattedTime(duration): string {
    const durationMinSec: { minutes: number; seconds: number } = durationMinutesSeconds(duration);
    return pad(durationMinSec.minutes.toString()) + ':' + pad(durationMinSec.seconds.toString());
  }
}
