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
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Timezone, utcTimezones } from '../../models';

@Component({
  selector: 'app-timezone-edit',
  templateUrl: './timezone-edit.component.html',
  styleUrls: ['./timezone-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimezoneEditComponent implements OnChanges {
  @Input() appearance: string;
  @Input() currentTimezone: Timezone;
  @Output() timezoneSelected = new EventEmitter<Timezone>();

  filteredOptions: Observable<string[]>;

  selectedTimezone: Timezone;
  timezones: { timezone: Timezone; formattedLabel: string }[];
  formControl = new FormControl();

  constructor() {
    this.buildTimezoneLabels();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentTimezone) {
      this.initializeCurrentTimezone();
    }
  }

  initializeCurrentTimezone(): void {
    this.formControl.setValue(
      this.timezones[this.getMatchingTimezoneIndex(this.currentTimezone)].formattedLabel
    );

    this.filteredOptions = this.formControl.valueChanges.pipe(
      startWith(this.timezones[this.getMatchingTimezoneIndex(this.currentTimezone)].formattedLabel),
      map((value) => this.filterTimezones(value))
    );
  }

  buildTimezoneLabels(): void {
    this.timezones = utcTimezones.map((tz) => ({
      timezone: tz,
      formattedLabel: `(UTC${tz.label}) ${tz.description}`,
    }));
  }

  getMatchingTimezoneIndex(timezone: Timezone): number {
    return this.timezones.findIndex(
      (tz) =>
        tz.timezone.label === timezone.label &&
        tz.timezone.offset === timezone.offset &&
        tz.timezone.description === timezone.description
    );
  }

  getTimezoneByLabel(label: string): Timezone {
    const index = this.timezones.findIndex((tz) => tz.formattedLabel === label);
    return this.timezones[index].timezone;
  }

  onTimezoneSelected(value: string): void {
    this.selectedTimezone = this.getTimezoneByLabel(value);
    this.timezoneSelected.emit(this.selectedTimezone);
  }

  displayTimezone(timezone: Timezone): string {
    return timezone ? `(UTC${timezone.label}) ${timezone.description}` : '';
  }

  private filterTimezones(value = ''): string[] {
    const filterValue = value.toLowerCase();

    return this.timezones
      .filter((tz) => tz.formattedLabel.toLowerCase().includes(filterValue))
      .map((tz) => tz.formattedLabel);
  }
}
