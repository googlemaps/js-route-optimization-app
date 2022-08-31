/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { VehicleOperatorsKpis } from '../../models';

@Component({
  selector: 'app-base-vehicle-operators-kpis',
  templateUrl: './base-vehicle-operators-kpis.component.html',
  styleUrls: ['./base-vehicle-operators-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseVehicleOperatorsKpisComponent {
  @Input() vehicleOperatorKpis: VehicleOperatorsKpis;
}
