/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActiveFilter, FilterOption } from '../../models';

@Component({
  selector: 'app-filter-menu',
  templateUrl: './filter-menu.component.html',
  styleUrls: ['./filter-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterMenuComponent {
  @Input() filters: ActiveFilter[];
  @Input() filterOptions: FilterOption[];
  @Output() addFilter = new EventEmitter<FilterOption>();

  trackFilterOptionBy(_index: number, filterOption: FilterOption): string {
    return filterOption.id;
  }
}
