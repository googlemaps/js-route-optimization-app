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
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import Long from 'long';
import { merge, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { ITimeWindow } from 'src/app/core/models';
import {
  compareTimeWindows,
  durationSeconds,
  formatLongTime,
  formatTime,
  isValidTimeString,
  localDateTimeToUtcSeconds,
  secondsToDuration,
  setControlDisabled,
  showError,
  timeToDate,
  timeWindowHasTime,
} from 'src/app/util';
import { timeStringValidator } from 'src/app/util/validators';

class StartErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const groupInvalid = ngForm?.errors && ngForm.errors.startIncomplete;
    const invalid = control?.invalid || groupInvalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('startDate')) ||
        showError(ngForm.form.get('startTime')));
    return !!(invalid && show);
  }
}

class EndErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const groupInvalid =
      ngForm?.errors &&
      (ngForm.errors.endDate || ngForm.errors.endTime || ngForm.errors.endIncomplete);
    const invalid = control?.invalid || groupInvalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('startDate')) ||
        showError(ngForm.form.get('startTime')) ||
        showError(ngForm.form.get('endDate')) ||
        showError(ngForm.form.get('endTime')));
    return !!(invalid && show);
  }
}

class SoftStartErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const groupInvalid =
      ngForm?.errors && (ngForm.errors.softStart || ngForm.errors.softStartIncomplete);
    const invalid = control?.invalid || groupInvalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('softStartDate')) ||
        showError(ngForm.form.get('softStartTime')) ||
        showError(ngForm.form.get('softEndDate')) ||
        showError(ngForm.form.get('softEndTime')));
    return !!(invalid && show);
  }
}

class SoftEndErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const groupInvalid =
      ngForm?.errors &&
      (ngForm.errors.softEnd ||
        ngForm.errors.softEndDate ||
        ngForm.errors.softEndTime ||
        ngForm.errors.softEndIncomplete);
    const invalid = control?.invalid || groupInvalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('softStartDate')) ||
        showError(ngForm.form.get('softStartTime')) ||
        showError(ngForm.form.get('softEndDate')) ||
        showError(ngForm.form.get('softEndTime')));
    return !!(invalid && show);
  }
}

interface TimeWindowFormValue {
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  softStartDate: Date;
  softStartTime: string;
  softEndDate: Date;
  softEndTime: string;
  earlinessPenalty: number;
  latenessPenalty: number;
}

@Component({
  selector: 'app-time-window',
  templateUrl: './time-window.component.html',
  styleUrls: ['./time-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeWindowComponent implements OnChanges, OnInit, OnDestroy {
  @Input() appearance: string;
  @Input() startAt?: Date;
  @Input() timezoneOffset = 0;
  @Input() removable = false;
  @Input() disableSoftTime = false;
  @Input() hideSoftTime = false;
  @Input() hideHeader = false;
  @Output() remove = new EventEmitter<void>();

  get form(): UntypedFormGroup {
    return this._form;
  }
  private _form: UntypedFormGroup;

  startDate: UntypedFormControl;
  startTime: UntypedFormControl;
  endDate: UntypedFormControl;
  endTime: UntypedFormControl;
  softStartDate: UntypedFormControl;
  softStartTime: UntypedFormControl;
  softEndDate: UntypedFormControl;
  softEndTime: UntypedFormControl;
  earlinessPenalty: UntypedFormControl;
  latenessPenalty: UntypedFormControl;
  readonly startErrorStateMatcher = new StartErrorStateMatcher();
  readonly endErrorStateMatcher = new EndErrorStateMatcher();
  readonly softStartErrorStateMatcher = new SoftStartErrorStateMatcher();
  readonly softEndErrorStateMatcher = new SoftEndErrorStateMatcher();
  showError = showError;

  get hasSoftTimeStart(): boolean {
    return (
      !this.disableSoftTime &&
      this.form &&
      (this.softStartDate.value != null || this.softStartTime.value != null)
    );
  }

  get hasSoftTimeEnd(): boolean {
    return (
      !this.disableSoftTime &&
      this.form &&
      (this.softEndDate.value != null || this.softEndTime.value != null)
    );
  }

  get hasSoftTimeWindow(): boolean {
    return this.hasSoftTimeStart || this.hasSoftTimeEnd;
  }

  private readonly subscriptions: Subscription[] = [];

  constructor(public controlContainer: ControlContainer) {}

  static createFormGroup(fb: UntypedFormBuilder, timezoneOffset?: number, timeWindows?: any): UntypedFormGroup {
    return fb.group({
      startDate: timeWindows?.startTime
        ? timeToDate(Long.fromValue(timeWindows.startTime.seconds), timezoneOffset)
        : fb.control(null),
      startTime: timeWindows?.startTime
        ? formatLongTime(Long.fromValue(timeWindows.startTime.seconds), null, timezoneOffset)
        : fb.control(null, timeStringValidator),
      endDate: timeWindows?.endTime
        ? timeToDate(Long.fromValue(timeWindows.endTime.seconds), timezoneOffset)
        : fb.control(null),
      endTime: timeWindows?.endTime
        ? formatLongTime(Long.fromValue(timeWindows.endTime.seconds), null, timezoneOffset)
        : fb.control(null, timeStringValidator),
      softStartDate: fb.control(null),
      softStartTime: fb.control(null, timeStringValidator),
      softEndDate: fb.control(null),
      softEndTime: fb.control(null, timeStringValidator),
      earlinessPenalty: fb.control(null),
      latenessPenalty: fb.control(null),
    });
  }

  static createFormValues(objs: ITimeWindow[], timezoneOffset: number): TimeWindowFormValue[] {
    return objs?.map((obj) => TimeWindowComponent.createFormValue(obj, timezoneOffset)) || [];
  }

  static createFormValue(obj: ITimeWindow, timezoneOffset: number): TimeWindowFormValue {
    const timeWindow = obj || ({} as ITimeWindow);
    const startTime = timeWindow.startTime ? durationSeconds(timeWindow.startTime) : null;
    const endTime = timeWindow.endTime ? durationSeconds(timeWindow.endTime) : null;
    const softStartTime = timeWindow.softStartTime
      ? durationSeconds(timeWindow.softStartTime)
      : null;
    const softEndTime = timeWindow.softEndTime ? durationSeconds(timeWindow.softEndTime) : null;
    return {
      startDate: startTime != null ? timeToDate(startTime, timezoneOffset) : null,
      startTime: startTime != null ? formatTime(startTime.toNumber(), null, timezoneOffset) : null,
      endDate: endTime != null ? timeToDate(endTime, timezoneOffset) : null,
      endTime: endTime != null ? formatTime(endTime.toNumber(), null, timezoneOffset) : null,
      softStartDate: softStartTime != null ? timeToDate(softStartTime, timezoneOffset) : null,
      softStartTime:
        softStartTime != null ? formatTime(softStartTime.toNumber(), null, timezoneOffset) : null,
      softEndDate: softEndTime != null ? timeToDate(softEndTime, timezoneOffset) : null,
      softEndTime:
        softEndTime != null ? formatTime(softEndTime.toNumber(), null, timezoneOffset) : null,
      earlinessPenalty: timeWindow.costPerHourBeforeSoftStartTime,
      latenessPenalty: timeWindow.costPerHourAfterSoftEndTime,
    };
  }

  /**
   * @remarks
   * Only produces time windows that have some time specification, and sorts them
   * ascending.
   */
  static createTimeWindows(formArray: UntypedFormArray, timezoneOffset: number): ITimeWindow[] {
    return formArray.controls
      .map((form: UntypedFormGroup) => TimeWindowComponent.createTimeWindow(form, timezoneOffset))
      .filter(timeWindowHasTime)
      .sort(compareTimeWindows);
  }

  static createTimeWindow(form: UntypedFormGroup, timezoneOffset: number): ITimeWindow {
    const startTime = localDateTimeToUtcSeconds(
      form.get('startDate').value,
      form.get('startTime').value,
      timezoneOffset
    );
    const endTime = localDateTimeToUtcSeconds(
      form.get('endDate').value,
      form.get('endTime').value,
      timezoneOffset
    );
    const softStartTime =
      (form.get('softStartDate')?.disabled || form.get('softStartTime')?.disabled) ?? true
        ? null
        : localDateTimeToUtcSeconds(
            form.get('softStartDate').value,
            form.get('softStartTime').value,
            timezoneOffset
          );
    const softEndTime =
      (form.get('softEndDate')?.disabled || form.get('softEndTime')?.disabled) ?? true
        ? null
        : localDateTimeToUtcSeconds(
            form.get('softEndDate').value,
            form.get('softEndTime').value,
            timezoneOffset
          );
    const costPerHourBeforeSoftStartTime =
      form.get('earlinessPenalty')?.disabled ?? true ? null : form.get('earlinessPenalty').value;
    const costPerHourAfterSoftEndTime =
      form.get('latenessPenalty')?.disabled ?? true ? null : form.get('latenessPenalty').value;
    return {
      startTime: secondsToDuration(startTime),
      endTime: secondsToDuration(endTime),
      softStartTime: secondsToDuration(softStartTime),
      softEndTime: secondsToDuration(softEndTime),
      costPerHourBeforeSoftStartTime,
      costPerHourAfterSoftEndTime,
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disableSoftTime || changes.hideSoftTime) {
      this.updateDisabledState();
    }
  }

  ngOnInit(): void {
    this._form = this.controlContainer.control as UntypedFormGroup;
    this.startDate = this.form.get('startDate') as UntypedFormControl;
    this.startTime = this.form.get('startTime') as UntypedFormControl;
    this.endDate = this.form.get('endDate') as UntypedFormControl;
    this.endTime = this.form.get('endTime') as UntypedFormControl;
    this.softStartDate = this.form.get('softStartDate') as UntypedFormControl;
    this.softStartTime = this.form.get('softStartTime') as UntypedFormControl;
    this.softEndDate = this.form.get('softEndDate') as UntypedFormControl;
    this.softEndTime = this.form.get('softEndTime') as UntypedFormControl;
    this.earlinessPenalty = this.form.get('earlinessPenalty') as UntypedFormControl;
    this.latenessPenalty = this.form.get('latenessPenalty') as UntypedFormControl;
    this.form.setValidators(this.timeWindowValidator.bind(this));
    this.updateDisabledState();

    this.subscriptions.push(
      // Only enable earliness penalty when soft start has some value
      merge(this.softStartDate.valueChanges, this.softStartTime.valueChanges)
        .pipe(startWith(null as Date | string))
        .subscribe(() => this.updateEarlinessPenaltyDisabledState()),
      // Only enable lateness penalty when soft end has some value
      merge(this.softEndDate.valueChanges, this.softEndTime.valueChanges)
        .pipe(startWith(null as Date | string))
        .subscribe(() => this.updateLatenessPenaltyDisabledState())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.splice(0).forEach((subscription) => subscription.unsubscribe());
  }

  updateDisabledState(): void {
    if (!this.form || this.form.disabled) {
      return;
    }
    const disableSoftTime = this.disableSoftTime || this.hideSoftTime;
    setControlDisabled(this.softStartDate, disableSoftTime);
    setControlDisabled(this.softStartTime, disableSoftTime);
    setControlDisabled(this.softEndDate, disableSoftTime);
    setControlDisabled(this.softEndTime, disableSoftTime);
    this.updateEarlinessPenaltyDisabledState();
    this.updateLatenessPenaltyDisabledState();
    this.form.updateValueAndValidity();
  }

  private updateEarlinessPenaltyDisabledState(): void {
    if (this.form.disabled) {
      return;
    }
    setControlDisabled(
      this.earlinessPenalty,
      this.disableSoftTime ||
        this.hideSoftTime ||
        (this.softStartDate.value == null && !this.softStartTime.value)
    );
  }

  private updateLatenessPenaltyDisabledState(): void {
    if (this.form.disabled) {
      return;
    }
    setControlDisabled(
      this.latenessPenalty,
      this.disableSoftTime ||
        this.hideSoftTime ||
        (this.softEndDate.value == null && !this.softEndTime.value)
    );
  }

  private timeWindowValidator(control: UntypedFormGroup): { [error: string]: boolean } {
    const errors: { [key: string]: boolean } = {};
    const startDate = control.get('startDate').value as Date;
    const endDate = control.get('endDate').value as Date;
    const startTime = control.get('startTime').value as string;
    const endTime = control.get('endTime').value as string;
    const startSeconds = localDateTimeToUtcSeconds(startDate, startTime, 0);
    const endSeconds = localDateTimeToUtcSeconds(endDate, endTime, 0);
    if ((startDate == null) !== !startTime) {
      errors.startIncomplete = true;
    }
    if ((endDate == null) !== !endTime) {
      errors.endIncomplete = true;
    }

    // Start date must be less than or equal to end date
    if (startDate != null && endDate != null && startDate > endDate) {
      errors.endDate = true;
    }
    // Start time must be less than or equal to end time
    if (startSeconds != null && endSeconds != null && startSeconds > endSeconds) {
      errors.endTime = true;
    }
    if (this.disableSoftTime || this.hideSoftTime) {
      return Object.keys(errors).length ? errors : null;
    }

    const softStartDate: Date = control.get('softStartDate').value;
    const softStartTime: string = control.get('softStartTime').value;
    const softEndDate: Date = control.get('softEndDate').value;
    const softEndTime: string = control.get('softEndTime').value;
    const softStartSeconds = localDateTimeToUtcSeconds(softStartDate, softStartTime, 0);
    const softEndSeconds = localDateTimeToUtcSeconds(softEndDate, softEndTime, 0);
    if ((softStartDate == null) !== !softStartTime) {
      errors.softStartIncomplete = true;
    }
    if ((softEndDate == null) !== !softEndTime) {
      errors.softEndIncomplete = true;
    }
    if (softStartTime && !errors.softStartIncomplete && !isValidTimeString(softStartTime)) {
      errors.softStartIncomplete = true;
      errors.softStartTimePattern = true;
    }
    if (softEndTime && !errors.softEndIncomplete && !isValidTimeString(softEndTime)) {
      errors.softEndIncomplete = true;
      errors.softEndTimePattern = true;
    }

    // If defined, soft start time must be between start time and end time (inclusive)
    if (
      softStartSeconds != null &&
      ((startSeconds != null && softStartSeconds < startSeconds) ||
        (endSeconds != null && softStartSeconds > endSeconds))
    ) {
      errors.softStart = true;
    }
    // If defined, soft end time must be between start time and end time (inclusive)
    if (
      softEndSeconds != null &&
      ((startSeconds != null && softEndSeconds < startSeconds) ||
        (endSeconds != null && softEndSeconds > endSeconds))
    ) {
      errors.softEnd = true;
    }
    // If both soft date and times defined
    if (softStartSeconds != null && softEndSeconds != null) {
      // Soft start date must be less than or equal to soft end date
      if (softStartDate > softEndDate) {
        errors.softEndDate = true;
      }
      // Soft start time must be less than or equal to soft end time
      if (softStartSeconds > softEndSeconds) {
        errors.softEndTime = true;
      }
    }
    return Object.keys(errors).length ? errors : null;
  }
}
