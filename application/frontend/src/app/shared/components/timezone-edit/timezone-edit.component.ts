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

  filteredOptions: Observable<Timezone[]>;

  formControl = new UntypedFormControl();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.currentTimezone) {
      this.initializeCurrentTimezone();
    }
  }

  initializeCurrentTimezone(): void {
    this.formControl.setValue(
      utcTimezones[this.getMatchingTimezoneIndex(this.currentTimezone)].description
    );

    this.filteredOptions = this.formControl.valueChanges.pipe(
      startWith(utcTimezones[this.getMatchingTimezoneIndex(this.currentTimezone)].description),
      map((value) =>
        this.filterTimezones(value).sort((a, b) => (a.description < b.description ? -1 : 1))
      )
    );
  }

  getMatchingTimezoneIndex(timezone: Timezone): number {
    return utcTimezones.findIndex(
      (tz) =>
        tz.label === timezone.label &&
        tz.offset === timezone.offset &&
        tz.description === timezone.description
    );
  }

  getTimezoneByLabel(label: string): Timezone {
    const index = utcTimezones.findIndex((tz) => tz.description === label);
    return utcTimezones[index];
  }

  onTimezoneSelected(value: string): void {
    this.timezoneSelected.emit(this.getTimezoneByLabel(value));
  }

  private filterTimezones(value = ''): Timezone[] {
    const filterValue = value.toLowerCase();
    return utcTimezones.filter((tz) => tz.description.toLowerCase().includes(filterValue));
  }
}
