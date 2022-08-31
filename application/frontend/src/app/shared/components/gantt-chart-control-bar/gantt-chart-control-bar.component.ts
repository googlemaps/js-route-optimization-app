/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActiveFilter, Range, Timezone } from '../../models';

@Component({
  selector: 'app-gantt-chart-control-bar',
  templateUrl: './gantt-chart-control-bar.component.html',
  styleUrls: ['./gantt-chart-control-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GanttChartControlBarComponent {
  @Input() filters: ActiveFilter[];
  @Output() editFilter = new EventEmitter<{ filter: ActiveFilter; element: HTMLElement }>();
  @Output() removeFilter = new EventEmitter<ActiveFilter>();

  @Input() rangeIndex: number;
  @Output() rangeIndexSelect = new EventEmitter<number>();
  @Input() ranges: Range[];

  @Input() currentTimezone: Timezone;
  @Output() updateTimezone = new EventEmitter<Timezone>();

  get range(): Range {
    return this.ranges ? this.ranges[this.rangeIndex] : null;
  }

  trackRangeBy(index: number): number {
    return index;
  }
}
