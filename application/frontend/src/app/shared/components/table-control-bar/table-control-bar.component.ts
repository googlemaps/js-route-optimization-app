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
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Column } from 'src/app/core/models';
import { ActiveFilter } from '../../models';

@Component({
  selector: 'app-table-control-bar',
  templateUrl: './table-control-bar.component.html',
  styleUrls: ['./table-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TableControlBarComponent {
  @Input() filters: ActiveFilter[];
  @Input() showBulkEdit: boolean;
  @Input() showBulkDelete: boolean;
  @Output() bulkEdit = new EventEmitter();
  @Output() bulkDelete = new EventEmitter();
  @Output() editFilter = new EventEmitter<{ filter: ActiveFilter; element: HTMLElement }>();
  @Output() removeFilter = new EventEmitter<ActiveFilter>();

  @Input() displayColumns: Column[];
  @Output() displayColumnChange = new EventEmitter<{ columnId: string; active: boolean }>();

  onDisplayColumnChange(column: Column, active: boolean): void {
    this.displayColumnChange.emit({ columnId: column.id, active });
  }

  onEditFilter(filter: ActiveFilter, event: MouseEvent): void {
    if (filter.params != null) {
      this.editFilter.emit({ filter, element: event.target as HTMLElement });
    }
  }

  trackDisplayColumnBy(index: number, displayColumn: Column): string {
    return displayColumn.id;
  }
}
