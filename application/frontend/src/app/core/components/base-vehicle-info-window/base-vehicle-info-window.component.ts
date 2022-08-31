/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Vehicle } from '../../models';

@Component({
  selector: 'app-base-vehicle-info-window',
  templateUrl: './base-vehicle-info-window.component.html',
  styleUrls: ['./base-vehicle-info-window.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseVehicleInfoWindowComponent {
  @Input() vehicle: Vehicle;
  @Input() shipmentCount?: number;
  @Input() navigation = false;
  @Output() vehicleClick = new EventEmitter<Vehicle>();

  onVehicleClick(): void {
    if (this.navigation) {
      this.vehicleClick.emit(this.vehicle);
    }
  }
}
