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
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { take, withLatestFrom } from 'rxjs/operators';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import {
  createTimestamp,
  durationSeconds,
  formatLongTime,
  localDateTimeToUtcSeconds,
  timeToDate,
} from 'src/app/util';
import {
  durationWithinGlobalStartEndTime,
  nonNegativeIntegerValidator,
  noUnspecifiedRelaxationLevelValidator,
  timeStringValidator,
} from 'src/app/util/validators';
import { RequestSettingsActions } from '../../actions';
import { IConstraintRelaxation, RelaxationLevel } from '../../models';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';

@Component({
  selector: 'app-edit-global-relaxation-constrains',
  templateUrl: './edit-global-relaxation-constraints-dialog.component.html',
  styleUrls: ['./edit-global-relaxation-constraints-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditGlobalRelaxationConstraintsDialogComponent implements OnInit, OnChanges {
  get formConstraintRelaxations(): UntypedFormArray {
    return this.form.get('constraintRelaxations') as UntypedFormArray;
  }

  currentTimezoneOffset: number;
  form: UntypedFormGroup;
  globalStartSeconds: Long;
  globalEndSeconds: Long;

  constraintRelaxations: IConstraintRelaxation;

  constructor(
    private dialogRef: MatDialogRef<EditGlobalRelaxationConstraintsDialogComponent>,
    private fb: UntypedFormBuilder,
    private store: Store
  ) {
    this.form = this.fb.group({
      constraintRelaxations: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.store
      .pipe(
        select(fromConfig.selectTimezoneOffset),
        withLatestFrom(this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration))),
        take(1)
      )
      .subscribe(([offset, duration]) => {
        this.currentTimezoneOffset = offset;
        this.globalStartSeconds = duration[0];
        this.globalEndSeconds = duration[1];
        this.initForm(this.constraintRelaxations);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.constraintRelaxations) {
      this.initForm(changes.constraintRelaxations.currentValue);
    }
  }

  initForm(constraintRelaxations: IConstraintRelaxation): void {
    this.formConstraintRelaxations.clear();
    constraintRelaxations?.relaxations?.forEach((_) => this.addConstraintRelaxation());

    this.form.reset({
      constraintRelaxations: this.constraintRelaxationsToFormValues(constraintRelaxations),
    });
  }

  constraintRelaxationsToFormValues(constraintRelaxations: IConstraintRelaxation): {
    index: number;
    date: Date;
    level: RelaxationLevel;
    numberOfVisits: number;
    time;
  }[] {
    if (!constraintRelaxations) {
      return;
    }

    const values = [];
    for (let i = 0; i < constraintRelaxations.relaxations.length; i++) {
      const seconds = durationSeconds(constraintRelaxations.relaxations[i].thresholdTime);
      values.push({
        index: i,
        date: timeToDate(seconds),
        level: constraintRelaxations.relaxations[i].level,
        numberOfVisits: constraintRelaxations.relaxations[i].thresholdVisitCount,
        time: formatLongTime(seconds, null, this.currentTimezoneOffset),
      });
    }
    return values;
  }

  addConstraintRelaxation(): void {
    this.formConstraintRelaxations.push(
      this.fb.group(
        {
          index: [null],
          date: [null, Validators.required],
          level: [null, [Validators.required, noUnspecifiedRelaxationLevelValidator]],
          numberOfVisits: [null, [Validators.required, nonNegativeIntegerValidator]],
          time: [null, [Validators.required, timeStringValidator]],
        },
        {
          validators: [
            durationWithinGlobalStartEndTime(
              this.globalStartSeconds,
              this.globalEndSeconds,
              this.currentTimezoneOffset
            ),
          ],
        }
      )
    );
    this.formConstraintRelaxations.markAllAsTouched();
    this.form.updateValueAndValidity();
  }

  removeConstraintRelaxation(index: number): void {
    this.formConstraintRelaxations.removeAt(index);
  }

  save(): void {
    this.store.dispatch(
      RequestSettingsActions.setGlobalConstraints({
        constraints: this.formValuesToConstraintRelaxations(),
      })
    );
    this.dialogRef.close();
  }

  formValuesToConstraintRelaxations(): any {
    return this.formConstraintRelaxations.value.map((threshold) => ({
      index: threshold.index,
      level: threshold.level,
      thresholdTime: createTimestamp(
        localDateTimeToUtcSeconds(threshold.date, threshold.time, this.currentTimezoneOffset)
      ),
      thresholdVisits: threshold.numberOfVisits,
      vehicleIndices: [],
    }));
  }
}
