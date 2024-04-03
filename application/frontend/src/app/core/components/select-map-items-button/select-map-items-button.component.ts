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
