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
