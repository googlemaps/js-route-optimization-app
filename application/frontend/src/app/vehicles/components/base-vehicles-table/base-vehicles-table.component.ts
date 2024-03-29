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
