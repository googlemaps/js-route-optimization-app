/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { VehiclesKpis } from '../../models';

@Component({
  selector: 'app-base-vehicles-kpis',
  templateUrl: './base-vehicles-kpis.component.html',
  styleUrls: ['./base-vehicles-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseVehiclesKpisComponent {
  @Input() vehiclesKpis: VehiclesKpis;
  @Input() unitAbbreviations: { [unit: string]: string };

  get maxColumnsClass(): string {
    return 'max-columns-' + Math.min(Math.max(1, this.vehiclesKpis?.capacities?.length), 4);
  }
}
