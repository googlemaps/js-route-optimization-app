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

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-base-routes-row-column-header',
  templateUrl: './base-routes-row-column-header.component.html',
  styleUrls: ['./base-routes-row-column-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseRoutesRowColumnHeaderComponent {
  @Input() totalRoutes: number;
  @Input() totalSelectedRoutes: number;
  @Output() selectAllRoutes = new EventEmitter<void>();
  @Output() deselectAllRoutes = new EventEmitter<void>();

  get checked(): boolean {
    return this.totalSelectedRoutes > 0 && this.totalSelectedRoutes === this.totalRoutes;
  }

  get indeterminate(): boolean {
    return this.totalSelectedRoutes > 0 && this.totalRoutes > this.totalSelectedRoutes;
  }

  onToggleSelectedRoutesClick(change: MatCheckboxChange): void {
    if (change.checked) {
      this.selectAllRoutes.emit();
    } else {
      this.deselectAllRoutes.emit();
    }
  }
}
