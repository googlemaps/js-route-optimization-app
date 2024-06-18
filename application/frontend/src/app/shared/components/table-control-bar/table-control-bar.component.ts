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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Column, Page } from 'src/app/core/models';

@Component({
  selector: 'app-table-control-bar',
  templateUrl: './table-control-bar.component.html',
  styleUrls: ['./table-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TableControlBarComponent {
  @Input() showModelSettings = true;
  @Output() openShipmentModelSettings = new EventEmitter();

  @Input() displayColumns: Column[];
  @Output() displayColumnChange = new EventEmitter<{ columnId: string; active: boolean }>();

  @Input() page: Page;

  @Output() resetView = new EventEmitter();

  Page = Page;

  onDisplayColumnChange(column: Column, active: boolean): void {
    this.displayColumnChange.emit({ columnId: column.id, active });
  }

  trackDisplayColumnBy(index: number, displayColumn: Column): string {
    return displayColumn.id;
  }
}
