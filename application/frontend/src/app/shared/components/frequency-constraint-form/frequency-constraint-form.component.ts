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
  Output,
  EventEmitter,
  ChangeDetectorRef,
  OnDestroy,
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
import { IFrequencyConstraint } from '../../../core/models';
import { durationMinutesSeconds, requireAny, secondsToDuration, showError } from '../../../util';
import { Subscription } from 'rxjs';
import { ErrorStateMatcher } from '@angular/material/core';

class FrequencyConstraintErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('minBreakDuration')) ||
        showError(ngForm.form.get('maxInterBreakDuration')));
    return !!(invalid && show);
  }
}

@Component({
  selector: 'app-frequency-constraint-form',
  templateUrl: './frequency-constraint-form.component.html',
  styleUrls: ['./frequency-constraint-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrequencyConstraintFormComponent implements OnInit, OnDestroy {
  @Output() remove = new EventEmitter<void>();
  get form(): FormGroup {
    return this._form;
  }
  private _form: FormGroup;
  changeSub: Subscription;
  get minBreakDuration(): AbstractControl {
    return this.form.get('minBreakDuration');
  }
  get maxInterBreakDuration(): AbstractControl {
    return this.form.get('maxInterBreakDuration');
  }
  readonly frequencyConstraintErrorStateMatcher = new FrequencyConstraintErrorStateMatcher();

  constructor(
    public controlContainer: ControlContainer,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._form = this.controlContainer.control as FormGroup;
    this.changeSub = this._form?.valueChanges.subscribe(() => {
      this.changeDetector.detectChanges();
    });
  }

  static createFormGroup(fb: FormBuilder): FormGroup {
    return fb.group({
      minBreakDuration: fb.group(
        {
          min: [null, [Validators.min(0)]],
          sec: [null, [Validators.min(0)]],
        },
        {
          validators: [requireAny(['min', 'sec'])],
        }
      ),
      maxInterBreakDuration: fb.group(
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

  static createFormValues(objs: IFrequencyConstraint[]): {
    minBreakDuration: { min: number; sec: number };
    maxInterBreakDuration: { min: number; sec: number };
  }[] {
    return objs?.map((obj) => FrequencyConstraintFormComponent.createFormValue(obj)) || [];
  }

  static createFormValue(obj: IFrequencyConstraint): {
    minBreakDuration: { min: number; sec: number };
    maxInterBreakDuration: { min: number; sec: number };
  } {
    const frequencyConstraint = obj || ({} as IFrequencyConstraint);
    return {
      minBreakDuration: {
        min: frequencyConstraint.minBreakDuration
          ? durationMinutesSeconds(frequencyConstraint.minBreakDuration).minutes
          : 0,
        sec: frequencyConstraint.minBreakDuration
          ? durationMinutesSeconds(frequencyConstraint.minBreakDuration).seconds
          : 0,
      },
      maxInterBreakDuration: {
        min: frequencyConstraint.maxInterBreakDuration
          ? durationMinutesSeconds(frequencyConstraint.maxInterBreakDuration).minutes
          : 0,
        sec: frequencyConstraint.maxInterBreakDuration
          ? durationMinutesSeconds(frequencyConstraint.maxInterBreakDuration).seconds
          : 0,
      },
    };
  }

  static readFormValues(formArray: FormArray): IFrequencyConstraint[] {
    return formArray.controls.map((form: FormGroup) =>
      FrequencyConstraintFormComponent.readFormValue(form)
    );
  }

  static readFormValue(form: FormGroup): IFrequencyConstraint {
    const minBreakDuration =
      form.get('minBreakDuration').value.min * 60 + form.get('minBreakDuration').value.sec;
    const maxInterBreakDuration =
      form.get('maxInterBreakDuration').value.min * 60 +
      form.get('maxInterBreakDuration').value.sec;
    return {
      minBreakDuration: secondsToDuration(minBreakDuration),
      maxInterBreakDuration: secondsToDuration(maxInterBreakDuration),
    };
  }

  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }
}
