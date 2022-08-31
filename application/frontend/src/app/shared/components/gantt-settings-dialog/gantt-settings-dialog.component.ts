/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Timezone } from '../../models';

@Component({
  selector: 'app-gantt-settings-dialog',
  templateUrl: './gantt-settings-dialog.component.html',
  styleUrls: ['./gantt-settings-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GanttSettingsDialogComponent {
  selectedTimezone: Timezone;

  constructor(@Inject(MAT_DIALOG_DATA) public currentTimezone: Timezone) {}

  onTimezoneSelected(timezone: Timezone): void {
    this.selectedTimezone = timezone;
  }
}
