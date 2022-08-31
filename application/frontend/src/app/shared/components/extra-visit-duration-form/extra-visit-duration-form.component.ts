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
  Input,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
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
  ExtraVisitDurationFormValue,
  ExtraVisitDurationValue,
} from '../../models/extra-visit-duration';
import { durationMinutesSeconds, requireAny, showError } from '../../../util';
import { ErrorStateMatcher } from '@angular/material/core';
import { IDuration } from '../../../core/models';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

class ExtraVisitDurationErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('visitType')) ||
        showError(ngForm.form.get('extraDuration')));
    return !!(invalid && show);
  }
}

@Component({
  selector: 'app-extra-visit-duration-form',
  templateUrl: './extra-visit-duration-form.component.html',
  styleUrls: ['./extra-visit-duration-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtraVisitDurationFormComponent implements OnInit, OnDestroy {
  @Input() appearance: string;
  @Input() disabled = false;
  @Input() visitTypeOptions?: string[];
  control: FormArray;
  currentFilterIndex: number;
  readonly extraVisitDurationErrorStateMatcher = new ExtraVisitDurationErrorStateMatcher();
  changeSub: Subscription;
  filteredVisitTypes$: Observable<string[]>;

  constructor(
    public controlContainer: ControlContainer,
    private changeDetector: ChangeDetectorRef
  ) {}

  static createFormGroup(fb: FormBuilder): FormGroup {
    return fb.group({
      visitType: fb.control(null, [Validators.required]),
      extraDuration: fb.group(
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
    extraVisitDurations: Array<ExtraVisitDurationFormValue>
  ): ExtraVisitDurationValue[] {
    return extraVisitDurations?.map((extraVisitDuration) =>
      ExtraVisitDurationFormComponent.createFormValue(extraVisitDuration)
    );
  }

  static createFormValue(extraVisitDuration: ExtraVisitDurationFormValue): ExtraVisitDurationValue {
    return {
      visitType: extraVisitDuration.visitType,
      extraDuration: {
        min: extraVisitDuration.extraDuration
          ? durationMinutesSeconds(extraVisitDuration.extraDuration).minutes
          : 0,
        sec: extraVisitDuration.extraDuration
          ? durationMinutesSeconds(extraVisitDuration.extraDuration).seconds
          : 0,
      },
    };
  }

  static readFormValues(extraVisitDurations: ExtraVisitDurationValue[] = []): {
    [name: string]: IDuration;
  } {
    return extraVisitDurations
      .map((extraVisitDuration) => ({
        visitType: extraVisitDuration.visitType,
        extraDuration:
          extraVisitDuration.extraDuration.min * 60 + extraVisitDuration.extraDuration.sec,
      }))
      .reduce(
        (obj, item) => Object.assign(obj, { [item.visitType]: { seconds: item.extraDuration } }),
        {}
      );
  }

  ngOnInit(): void {
    this.control = this.controlContainer.control as FormArray;
    this.changeSub = this.control?.valueChanges.subscribe(() => {
      this.changeDetector.detectChanges();
    });
  }

  removeExtraVisitDuration(index: number): void {
    this.control.removeAt(index);
    this.changeDetector.detectChanges();
  }

  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }

  setAutocompleteFocus(index: number): void {
    if (this.currentFilterIndex === index) {
      return;
    }
    this.currentFilterIndex = index;
    this.filteredVisitTypes$ = this.control.controls[index].get('visitType').valueChanges.pipe(
      startWith(''),
      map((value: string) => {
        return this.filterVisitTypes(value);
      })
    );
  }

  private filterVisitTypes(value: string): string[] {
    return this.visitTypeOptions.filter(this.getVisitTypesPredicateFn(value));
  }

  private getVisitTypesPredicateFn(value: string): (visitType: string) => boolean {
    const visitTypesInUse = this.controlContainer.value.map((obj) =>
      obj.visitType ? obj.visitType : ''
    );
    const isAvailable = ((visitType: string) =>
      !((visitTypesInUse as string[]) || []).includes(visitType)).bind(this);
    if (value == null) {
      return isAvailable;
    }
    const lowerValue = value.toLowerCase();
    return ((visitType: string) =>
      isAvailable(visitType) && visitType.toLowerCase().includes(lowerValue)).bind(this);
  }
}
