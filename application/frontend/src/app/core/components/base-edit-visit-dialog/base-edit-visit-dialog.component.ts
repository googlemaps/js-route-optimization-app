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

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Shipment, Vehicle, Visit, VisitRequest } from 'src/app/core/models';

@Component({
  selector: 'app-base-edit-visit-dialog',
  templateUrl: './base-edit-visit-dialog.component.html',
  styleUrls: ['./base-edit-visit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseEditVisitDialogComponent {
  @Input() shipment: Shipment;
  @Input() pickup?: Visit;
  @Input() pickupRequest?: VisitRequest;
  @Input() delivery?: Visit;
  @Input() deliveryRequest?: VisitRequest;
  @Input() vehicles: Vehicle[];
  @Input() disabled = false;
  @Input() timezoneOffset = 0;
  @Input() globalDuration: [Long, Long];
  @Input() savePending: boolean;
  @Input() saveError: boolean;
  @Output() cancel = new EventEmitter<void>();
  @Output() detail = new EventEmitter<{ shipmentId: number }>();
  @Output() save = new EventEmitter<{ visits: Visit[] }>();

  onSave(pickup: Visit, delivery: Visit): void {
    this.save.emit({ visits: [pickup, delivery].filter(Boolean) });
  }

  onDetail(): void {
    this.detail.emit({ shipmentId: this.shipment?.id });
  }
}
