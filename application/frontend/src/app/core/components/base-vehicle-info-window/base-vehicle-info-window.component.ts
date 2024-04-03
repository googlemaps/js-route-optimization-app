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
