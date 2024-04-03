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
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
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
  formControl = new UntypedFormControl();

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
