/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-base-pre-solve-message',
  templateUrl: './base-pre-solve-message.component.html',
  styleUrls: ['./base-pre-solve-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasePreSolveMessageComponent {
  @Input() numberOfVehicles = 0;
  @Input() numberOfShipments = 0;
}
