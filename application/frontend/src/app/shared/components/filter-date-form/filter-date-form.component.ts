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
  Inject,
  Input,
  LOCALE_ID,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import Long from 'long';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import {
  defaultDateFormat,
  defaultDateTimeFormat,
  formatSecondsDate,
  formatTime,
  localDateTimeToUtcSeconds,
  setControlDisabled,
  timeStringValidator,
  timeToDate,
} from 'src/app/util';
import {
  ActiveFilter,
  DateFilterOperation,
  DateFilterParams,
  FilterForm,
  FilterOption,
} from '../../models';

@Component({
  selector: 'app-filter-date-form',
  templateUrl: './filter-date-form.component.html',
  styleUrls: ['./filter-date-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterDateFormComponent implements FilterForm, OnInit, OnDestroy {
  @Input() filterOption: FilterOption;
  @Input() filter?: ActiveFilter;
  @Output() apply = new EventEmitter<void>();

  get invalid(): boolean {
    return this.form.invalid;
  }
  get DateFilterOperation(): typeof DateFilterOperation {
    return DateFilterOperation;
  }
  get dateLabel(): string {
    return this.operationCtrl.value !== DateFilterOperation.Between ? 'Date' : 'Min Date';
  }

  readonly form: UntypedFormGroup;
  readonly operationCtrl: UntypedFormControl;
  readonly dateCtrl: UntypedFormControl;
  readonly timeCtrl: UntypedFormControl;
  readonly date2Ctrl: UntypedFormControl;
  readonly time2Ctrl: UntypedFormControl;
  readonly operations = Object.entries(DateFilterOperation)
    .map(([_, value]) => value)
    .sort();
  private timezoneOffset = 0;
  private subscription: Subscription;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private store: Store,
    fb: UntypedFormBuilder
  ) {
    this.form = fb.group({
      operation: (this.operationCtrl = fb.control(DateFilterOperation.Equal)),
      date: (this.dateCtrl = fb.control(null, this.valueValidator)),
      time: (this.timeCtrl = fb.control(null, timeStringValidator)),
      date2: (this.date2Ctrl = fb.control({ value: null, disabled: true }, this.valueValidator)),
      time2: (this.time2Ctrl = fb.control({ value: null, disabled: true }, timeStringValidator)),
    });
    this.operationCtrl.valueChanges.subscribe((operation: DateFilterOperation) => {
      setControlDisabled(this.date2Ctrl, operation !== DateFilterOperation.Between);
      setControlDisabled(this.time2Ctrl, operation !== DateFilterOperation.Between);
    });
  }

  ngOnInit(): void {
    this.subscription = this.store
      .pipe(select(fromConfig.selectTimezoneOffset), take(1))
      .subscribe((timezoneOffset) => {
        this.timezoneOffset = timezoneOffset;
      });
    if (this.filter?.params) {
      this.reset(this.filter.params as DateFilterParams);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  getLabel(): string {
    const operation: DateFilterOperation = this.operationCtrl.value;
    const format = this.getTimeSpecified() ? defaultDateTimeFormat : defaultDateFormat;
    const range = this.getRange();

    const startFormatted = formatSecondsDate(
      range.start,
      this.timezoneOffset,
      format,
      this.locale
    ).toLocaleLowerCase(this.locale);

    if (operation === DateFilterOperation.Between) {
      const format2 = this.getTime2Specified() ? defaultDateTimeFormat : defaultDateFormat;
      const endFormatted = formatSecondsDate(
        range.end,
        this.timezoneOffset,
        format2,
        this.locale
      ).toLocaleLowerCase(this.locale);
      return `${this.filterOption.label} between ${startFormatted} and ${endFormatted}`;
    }
    return `${this.filterOption.label} ${operation.toLocaleLowerCase(
      this.locale
    )} ${startFormatted}`;
  }

  getValue(): DateFilterParams {
    const range = this.getRange();
    return {
      operation: this.operationCtrl.value,
      value: range.start,
      value2: range.end,
      timeSpecified: this.getTimeSpecified(),
      time2Specified: this.getTime2Specified(),
    };
  }

  private getRange(): { start: number; end: number } {
    const date = this.dateCtrl.value as Date;
    const operation: DateFilterOperation = this.operationCtrl.value;
    let start: number;
    let end: number;
    switch (operation) {
      case DateFilterOperation.Equal:
        start = localDateTimeToUtcSeconds(
          date,
          this.timeCtrl.value || '00:00',
          this.timezoneOffset
        );
        end = localDateTimeToUtcSeconds(
          date,
          this.timeCtrl.value || '23:59:59',
          this.timezoneOffset
        );
        break;
      case DateFilterOperation.GreaterThan:
      case DateFilterOperation.LessThanOrEqual:
        start = localDateTimeToUtcSeconds(
          date,
          this.timeCtrl.value || '23:59:59',
          this.timezoneOffset
        );
        end = start;
        break;
      case DateFilterOperation.GreaterThanOrEqual:
      case DateFilterOperation.LessThan:
        start = localDateTimeToUtcSeconds(
          date,
          this.timeCtrl.value || '00:00',
          this.timezoneOffset
        );
        end = start;
        break;
      case DateFilterOperation.Between:
        start = localDateTimeToUtcSeconds(
          date,
          this.timeCtrl.value || '00:00',
          this.timezoneOffset
        );
        end = localDateTimeToUtcSeconds(
          this.date2Ctrl.value,
          this.time2Ctrl.value || '23:59:59',
          this.timezoneOffset
        );
        break;
    }
    return { start, end };
  }

  private getTimeSpecified(): boolean {
    return !!this.timeCtrl.value;
  }

  private getTime2Specified(): boolean {
    return !!(this.operationCtrl.value === DateFilterOperation.Between && this.time2Ctrl.value);
  }

  private reset(params?: DateFilterParams): void {
    if (!params) {
      this.form.reset();
      return;
    }
    const date =
      params.value != null ? timeToDate(Long.fromValue(params.value), this.timezoneOffset) : null;
    const time =
      params.value != null && params.timeSpecified
        ? formatTime(params.value, null, this.timezoneOffset)
        : null;
    const date2 =
      params.value2 != null ? timeToDate(Long.fromValue(params.value2), this.timezoneOffset) : null;
    const time2 =
      params.value2 != null && params.time2Specified
        ? formatTime(params.value2, null, this.timezoneOffset)
        : null;
    this.form.reset({
      operation: params?.operation ?? null,
      date,
      time,
      date2,
      time2,
    });
  }

  private valueValidator(control: UntypedFormControl): { [error: string]: boolean } {
    const value = control.value as number;
    if (!value?.toString().trim().length) {
      return { required: true };
    }
    return null;
  }
}
