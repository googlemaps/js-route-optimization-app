/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-hide-map-button',
  templateUrl: './hide-map-button.component.html',
  styleUrls: ['./hide-map-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HideMapButtonComponent {
  @Input() disabled = false;
  @Output() hideMap = new EventEmitter<void>();
  @HostBinding('class.app-map-panel') readonly mapPanel = true;
}
