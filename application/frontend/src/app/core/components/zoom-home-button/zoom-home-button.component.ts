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
  selector: 'app-zoom-home-button',
  templateUrl: './zoom-home-button.component.html',
  styleUrls: ['./zoom-home-button.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZoomHomeButtonComponent {
  @Input() disabled = false;
  @Output() zoomToHome = new EventEmitter<void>();
  @HostBinding('class.app-map-panel') readonly mapPanel = true;
}
