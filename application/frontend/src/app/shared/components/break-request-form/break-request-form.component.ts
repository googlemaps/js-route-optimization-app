/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import {
  durationMinutesSeconds,
  durationSeconds,
  formatTime,
  localDateTimeToUtcSeconds,
  requireAny,
  secondsToDuration,
  showError,
  timeStringValidator,
  timeToDate,
} from '../../../util';
import { Subscription } from 'rxjs';
import { IBreakRequest } from '../../../core/models';
import { ErrorStateMatcher } from '@angular/material/core';

class BreakRequestErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors || control?.invalid;
    const show = ngForm && (ngForm.submitted || showError(ngForm.form.get('minDuration')));
    return !!(invalid && show);
  }
}

class EarliestErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const groupInvalid = ngForm?.errors && ngForm.errors.earliestIncomplete;
    const invalid = control?.invalid || groupInvalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('earliestStartDate')) ||
        showError(ngForm.form.get('earliestStartTime')));
    return !!(invalid && show);
  }
}

class LatestErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const groupInvalid =
      ngForm?.errors &&
      (ngForm.errors.latestStartDate ||
        ngForm.errors.latestStartTime ||
        ngForm.errors.latestIncomplete);
    const invalid = control?.invalid || groupInvalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('earliestStartDate')) ||
        showError(ngForm.form.get('earliestStartTime')) ||
        showError(ngForm.form.get('latestStartDate')) ||
        showError(ngForm.form.get('latestStartTime')));
    return !!(invalid && show);
  }
}

interface BreakRequestFormValue {
  earliestStartDate: Date;
  earliestStartTime: string;
  latestStartDate: Date;
  latestStartTime: string;
  minDuration: {
    min: number;
    sec: number;
  };
}

@Component({
  selector: 'app-break-request-form',
  templateUrl: './break-request-form.component.html',
  styleUrls: ['./break-request-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreakRequestFormComponent implements OnInit, OnDestroy {
  @Input() disabled = false;
  @Input() appearance: string;
  changeSub: Subscription;
  readonly breakRequestErrorStateMatcher = new BreakRequestErrorStateMatcher();
  readonly earliestErrorStateMatcher = new EarliestErrorStateMatcher();
  readonly latestErrorStateMatcher = new LatestErrorStateMatcher();

  @Output() remove = new EventEmitter<void>();
  get form(): FormGroup {
    return this._form;
  }
  private _form: FormGroup;
  get minDuration(): AbstractControl {
    return this.form.get('minDuration');
  }
  earliestStartDate: FormControl;
  earliestStartTime: FormControl;
  latestStartDate: FormControl;
  latestStartTime: FormControl;
  showError = showError;

  constructor(
    public controlContainer: ControlContainer,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._form = this.controlContainer.control as FormGroup;
    this.earliestStartDate = this.form.get('earliestStartDate') as FormControl;
    this.earliestStartTime = this.form.get('earliestStartTime') as FormControl;
    this.latestStartDate = this.form.get('latestStartDate') as FormControl;
    this.latestStartTime = this.form.get('latestStartTime') as FormControl;
    this.changeSub = this._form?.valueChanges.subscribe(() => {
      this.changeDetector.detectChanges();
    });
    this.form.setValidators(this.breakRequestValidator.bind(this));
  }

  static createFormGroup(fb: FormBuilder): FormGroup {
    return fb.group({
      earliestStartDate: fb.control(null, [Validators.required]),
      earliestStartTime: fb.control(null, [timeStringValidator, Validators.required]),
      latestStartDate: fb.control(null, [Validators.required]),
      latestStartTime: fb.control(null, [timeStringValidator, Validators.required]),
      minDuration: fb.group(
        {
          min: [null, [Validators.min(0)]],
          sec: [null, [Validators.min(0)]],
        },
        {
          validators: [requireAny(['min', 'sec'])],
        }
      ),
    });
  }

  static createFormValues(
    breakRequests: IBreakRequest[],
    timezoneOffset: number
  ): BreakRequestFormValue[] {
    return breakRequests.map((breakRequest: IBreakRequest) =>
      BreakRequestFormComponent.createFormValue(breakRequest, timezoneOffset)
    );
  }

  static createFormValue(
    breakRequest: IBreakRequest,
    timezoneOffset: number
  ): BreakRequestFormValue {
    const earliestStartTime = breakRequest.earliestStartTime
      ? durationSeconds(breakRequest.earliestStartTime)
      : null;
    const latestStartTime = breakRequest.latestStartTime
      ? durationSeconds(breakRequest.latestStartTime)
      : null;
    const minDurationObj = {
      min: breakRequest.minDuration ? durationMinutesSeconds(breakRequest.minDuration).minutes : 0,
      sec: breakRequest.minDuration ? durationMinutesSeconds(breakRequest.minDuration).seconds : 0,
    };
    return {
      earliestStartDate:
        earliestStartTime != null ? timeToDate(earliestStartTime, timezoneOffset) : null,
      earliestStartTime:
        earliestStartTime != null
          ? formatTime(earliestStartTime.toNumber(), null, timezoneOffset)
          : null,
      latestStartDate: latestStartTime != null ? timeToDate(latestStartTime, timezoneOffset) : null,
      latestStartTime:
        latestStartTime != null
          ? formatTime(latestStartTime.toNumber(), null, timezoneOffset)
          : null,
      minDuration: minDurationObj,
    };
  }

  static readFormValues(formArray: FormArray, timezoneOffset): IBreakRequest[] {
    return formArray.controls.map((form: FormGroup) =>
      BreakRequestFormComponent.readFormValue(form, timezoneOffset)
    );
  }

  static readFormValue(form: FormGroup, timezoneOffset: number): IBreakRequest {
    const earliestStartTime = localDateTimeToUtcSeconds(
      form.get('earliestStartDate').value,
      form.get('earliestStartTime').value,
      timezoneOffset
    );
    const latestStartTime = localDateTimeToUtcSeconds(
      form.get('latestStartDate').value,
      form.get('latestStartTime').value,
      timezoneOffset
    );
    const minDuration = form.get('minDuration').value.min * 60 + form.get('minDuration').value.sec;
    return {
      earliestStartTime: secondsToDuration(earliestStartTime),
      latestStartTime: secondsToDuration(latestStartTime),
      minDuration: secondsToDuration(minDuration),
    };
  }

  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }

  private breakRequestValidator(control: FormGroup): { [error: string]: boolean } {
    const errors: { [key: string]: boolean } = {};
    const earliestStartDate = control.get('earliestStartDate').value as Date;
    const latestStartDate = control.get('latestStartDate').value as Date;
    const earliestStartTime = control.get('earliestStartTime').value as string;
    const latestStartTime = control.get('latestStartTime').value as string;
    const startSeconds = localDateTimeToUtcSeconds(earliestStartDate, earliestStartTime, 0);
    const latestSeconds = localDateTimeToUtcSeconds(latestStartDate, latestStartTime, 0);
    if ((earliestStartDate == null) !== !earliestStartTime) {
      errors.earliestIncomplete = true;
    }
    if ((latestStartDate == null) !== !latestStartTime) {
      errors.latestIncomplete = true;
    }

    // Start date must be less than or equal to end date
    if (
      earliestStartDate != null &&
      latestStartDate != null &&
      earliestStartDate > latestStartDate
    ) {
      errors.latestStartDate = true;
    }
    // Start time must be less than or equal to end time
    if (startSeconds != null && latestSeconds != null && startSeconds > latestSeconds) {
      errors.latestStartTime = true;
    }
    return Object.keys(errors).length ? errors : null;
  }
}
