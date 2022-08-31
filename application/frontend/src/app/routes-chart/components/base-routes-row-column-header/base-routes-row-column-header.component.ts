/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
