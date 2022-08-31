/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
