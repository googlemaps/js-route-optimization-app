/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  HostBinding,
  Output,
} from '@angular/core';
import { SelectionMode } from '../../models';

@Component({
  selector: 'app-select-map-items-button',
  templateUrl: './select-map-items-button.component.html',
  styleUrls: ['./select-map-items-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMapItemsButtonComponent {
  selectionMode = SelectionMode;

  private state: SelectionMode;
  @Output() activeChange = new EventEmitter<SelectionMode>();
  @HostBinding('class.app-map-panel') readonly mapPanel = true;

  get bboxIcon(): string {
    return this.state === SelectionMode.Bbox ? 'select_bbox_active' : 'select_bbox';
  }

  get polygonIcon(): string {
    return this.state === SelectionMode.Polygon ? 'select_polygon_active' : 'select_polygon';
  }

  toggle(mode: SelectionMode): void {
    this.state = this.state === mode ? SelectionMode.Off : mode;
    this.activeChange.emit(this.state);
  }
}
