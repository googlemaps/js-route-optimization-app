/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-map-toggle-button',
  templateUrl: './map-toggle-button.component.html',
  styleUrls: ['./map-toggle-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapToggleButtonComponent {
  @Output() toggleMap = new EventEmitter<void>();
}
