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
  selector: 'app-toggle-selection-filter-button',
  templateUrl: './toggle-selection-filter-button.component.html',
  styleUrls: ['./toggle-selection-filter-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleSelectionFilterButtonComponent {
  @Input() active = false;
  @Output() activeChange = new EventEmitter<boolean>();
  @HostBinding('class.app-map-panel') readonly mapPanel = true;

  get icon(): string {
    return this.active ? 'visibility_off' : 'visibility';
  }

  get title(): string {
    return 'Show selected';
  }

  toggle(): void {
    this.activeChange.emit((this.active = !this.active));
  }
}
