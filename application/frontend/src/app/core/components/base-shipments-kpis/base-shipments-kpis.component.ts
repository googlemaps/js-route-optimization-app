/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ShipmentsKpis } from '../../models';

@Component({
  selector: 'app-base-shipments-kpis',
  templateUrl: './base-shipments-kpis.component.html',
  styleUrls: ['./base-shipments-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseShipmentsKpisComponent {
  @Input() shipmentsKpis: ShipmentsKpis;
  @Input() unitAbbreviations: { [unit: string]: string };

  get maxColumnsClass(): string {
    return 'max-columns-' + Math.min(Math.max(1, this.shipmentsKpis?.demands?.length), 4);
  }
}
