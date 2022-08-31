/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Shipment, Vehicle } from '../../models';

@Component({
  selector: 'app-base-validation-result-dialog',
  templateUrl: './base-validation-result-dialog.component.html',
  styleUrls: ['./base-validation-result-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseValidationResultDialogComponent {
  @Input() allowedVehicleWarnings: Shipment[];
  @Input() shipmentTimeRangeWarnings: Shipment[];
  @Input() vehicleTimeRangeWarnings: Vehicle[];
  @Output() cancel = new EventEmitter<void>();
  @Output() ok = new EventEmitter<void>();
  @Output() editShipment = new EventEmitter<Shipment>();
  @Output() editVehicle = new EventEmitter<Vehicle>();
}
