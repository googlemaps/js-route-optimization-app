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
