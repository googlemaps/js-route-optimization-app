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
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { IFrequencyConstraint } from '../../../core/models';
import { durationMinutesSeconds, requireAny, secondsToDuration, showError } from '../../../util';
import { Subscription } from 'rxjs';
import { ErrorStateMatcher } from '@angular/material/core';

class FrequencyConstraintErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
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
  get form(): UntypedFormGroup {
    return this._form;
  }
  private _form: UntypedFormGroup;
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
    this._form = this.controlContainer.control as UntypedFormGroup;
    this.changeSub = this._form?.valueChanges.subscribe(() => {
      this.changeDetector.detectChanges();
    });
  }

  static createFormGroup(fb: UntypedFormBuilder): UntypedFormGroup {
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

  static readFormValues(formArray: UntypedFormArray): IFrequencyConstraint[] {
    return formArray.controls.map((form: UntypedFormGroup) =>
      FrequencyConstraintFormComponent.readFormValue(form)
    );
  }

  static readFormValue(form: UntypedFormGroup): IFrequencyConstraint {
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
