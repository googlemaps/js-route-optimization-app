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

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatLegacySelectChange as MatSelectChange } from '@angular/material/legacy-select';
import { MatLegacySlideToggleChange as MatSlideToggleChange } from '@angular/material/legacy-slide-toggle';
import { select, Store } from '@ngrx/store';
import Long from 'long';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { Timezone } from 'src/app/shared/models';
import {
  createTimestamp,
  durationSeconds,
  formatLongTime,
  localDateTimeToUtcSeconds,
  maxInt32Value,
  RelaxationLevelNames,
  SEARCH_MODE_LABELS,
  secondsToDuration,
  timeToDate,
} from 'src/app/util';
import {
  durationWithinGlobalStartEndTime,
  nonNegativeIntegerValidator,
  noUnspecifiedRelaxationLevelValidator,
  timeStringValidator,
} from 'src/app/util/validators';
import {
  IConstraintRelaxation,
  IDuration,
  ITimestamp,
  RelaxationLevel,
} from '../../../core/models';
import { selectTimezone } from '../../../core/selectors/config.selectors';
import RequestSettingsSelectors from '../../../core/selectors/request-settings.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import { RequestSettings, TimeThreshold } from '../../../core/models/request-settings';
import ShipmentModelSelectors from '../../../core/selectors/shipment-model.selectors';
import { RequestSettingsActions } from '../../../core/actions';

@Component({
  selector: 'app-pre-solve-global-settings',
  templateUrl: './pre-solve-global-settings.component.html',
  styleUrls: ['./pre-solve-global-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSolveGlobalSettingsComponent implements OnDestroy {
  get constraintRelaxations(): UntypedFormArray {
    return this.form.get('constraintRelaxations') as UntypedFormArray;
  }
  get timeout(): AbstractControl {
    return this.form.get('timeout');
  }
  get populateTransitionPolylines(): AbstractControl {
    return this.form.get('populateTransitionPolylines');
  }
  get allowLargeDeadlineDespiteInterruptionRisk(): AbstractControl {
    return this.form.get('allowLargeDeadlineDespiteInterruptionRisk');
  }
  get interpretInjectedSolutionsUsingLabels(): AbstractControl {
    return this.form.get('interpretInjectedSolutionsUsingLabels');
  }

  maxInt32 = maxInt32Value;
  searchModeLabels = SEARCH_MODE_LABELS;
  searchModeKeys = Object.keys(SEARCH_MODE_LABELS);
  RelaxationLevel = RelaxationLevel;
  RelaxationLevelNames = RelaxationLevelNames;
  relaxationLevelKeys = Object.keys(this.RelaxationLevelNames);

  hasSolution$: Observable<boolean>;
  injectedSolution: boolean;

  isInterpretInjectedSolutionsUsingLabels: boolean;
  isSelectPopulateTransitionPolylines: boolean;
  isSelectAllowLargeDeadlineDespiteInterruptionRisk: boolean;
  updatedTimeThresholds: TimeThreshold[];

  currentSearchMode: string;
  currentTimezone: Timezone;
  private globalStartDateValue: Date;
  private globalStartTimeValue: string;
  private globalStartSeconds: Long;
  private globalEndSeconds: Long;
  globalSettings: Partial<RequestSettings> = {};

  form: UntypedFormGroup;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.initForm();
    this.initData();
  }

  resetData(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.initData();
  }

  initData(): void {
    this.subscriptions.push(
      combineLatest([
        this.store.pipe(select(selectTimezone)),
        this.store.pipe(select(ShipmentModelSelectors.selectGlobalStartTime)),
        this.store.pipe(select(ShipmentModelSelectors.selectGlobalEndTime)),
        this.store.pipe(select(RequestSettingsSelectors.selectTimeout)),
        this.store.pipe(select(RequestSettingsSelectors.selectGlobalConstraintRelaxations)),
        this.store.pipe(select(RequestSettingsSelectors.selectInjectedSolution)),
        this.store.pipe(
          select(RequestSettingsSelectors.selectInterpretInjectedSolutionsUsingLabels)
        ),
        this.store.pipe(select(RequestSettingsSelectors.selectPopulateTransitionPolylines)),
        this.store.pipe(
          select(RequestSettingsSelectors.selectAllowLargeDeadlineDespiteInterruptionRisk)
        ),
      ]).subscribe(
        ([
          selectTimezone,
          selectGlobalStartTime,
          selectGlobalEndTime,
          selectTimeout,
          selectGlobalConstraintRelaxations,
          injectedSolution,
          selectInterpretInjectedSolutionsUsingLabels,
          selectPopulateTransitionPolylines,
          selectAllowLargeDeadlineDespiteInterruptionRisk,
        ]) => {
          this.currentTimezone = selectTimezone as Timezone;
          this.globalStartSeconds = Long.fromValue(selectGlobalStartTime as Long);
          this.globalEndSeconds = Long.fromValue(selectGlobalEndTime as Long);
          this.globalStartDateValue = timeToDate(
            this.globalStartSeconds,
            this.currentTimezone.offset
          );
          this.globalStartTimeValue = this.formatTime(this.globalStartSeconds);
          this.injectedSolution = injectedSolution as boolean;
          this.updatedTimeThresholds = this.constraintRelaxationToTimeThresholds(
            selectGlobalConstraintRelaxations as IConstraintRelaxation
          );
          this.isInterpretInjectedSolutionsUsingLabels =
            selectInterpretInjectedSolutionsUsingLabels as boolean;
          this.isSelectPopulateTransitionPolylines = selectPopulateTransitionPolylines as boolean;
          this.isSelectAllowLargeDeadlineDespiteInterruptionRisk =
            selectAllowLargeDeadlineDespiteInterruptionRisk as boolean;
          this.setFormValues(
            this.globalStartSeconds,
            this.globalEndSeconds,
            durationSeconds(selectTimeout as IDuration).toNumber() || null,
            selectGlobalConstraintRelaxations as IConstraintRelaxation,
            selectInterpretInjectedSolutionsUsingLabels as boolean,
            selectPopulateTransitionPolylines as boolean,
            selectAllowLargeDeadlineDespiteInterruptionRisk as boolean
          );
        }
      )
    );

    this.subscriptions.push(
      this.store
        .pipe(select(RequestSettingsSelectors.selectGlobalConstraintRelaxations))
        .subscribe((relaxations) => {
          this.updatedTimeThresholds = this.constraintRelaxationToTimeThresholds(
            relaxations as IConstraintRelaxation
          );
          this.constraintRelaxations.reset(this.constraintRelaxationsToFormValues(relaxations));
        })
    );

    this.subscriptions.push(
      this.store
        .pipe(select(RequestSettingsSelectors.selectSearchMode))
        .subscribe((currentSearchMode) => {
          this.currentSearchMode = (currentSearchMode || '').toString();
        })
    );

    this.subscriptions.push(
      this.store
        .pipe(select(RequestSettingsSelectors.selectLabel))
        .subscribe((value) => (this.globalSettings.label = value))
    );
    this.subscriptions.push(
      this.store
        .pipe(select(RequestSettingsSelectors.selectTraffic))
        .subscribe((value) => (this.globalSettings.traffic = value))
    );
    this.hasSolution$ = this.store.pipe(select(fromSolution.selectHasSolution));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  constraintRelaxationToTimeThresholds(
    constraintRelaxation: IConstraintRelaxation
  ): TimeThreshold[] {
    return (
      constraintRelaxation?.relaxations?.map(
        (relaxation) =>
          ({
            level: relaxation.level,
            thresholdTime: relaxation.thresholdTime,
            thresholdVisits: relaxation.thresholdVisitCount,
          } as TimeThreshold)
      ) || []
    );
  }

  initForm(): void {
    this.form = this.fb.group({
      constraintRelaxations: this.fb.array([]),
      timeout: [null, [Validators.min(1), Validators.max(maxInt32Value)]],
      populateTransitionPolylines: false,
      allowLargeDeadlineDespiteInterruptionRisk: false,
      interpretInjectedSolutionsUsingLabels: false,
    });
  }

  setFormValues(
    globalStartSeconds: Long,
    globalEndSeconds: Long,
    timeout: number,
    relaxations: IConstraintRelaxation,
    interpretInjectedSolutionsUsingLabels: boolean,
    populateTransitionPolylines: boolean,
    allowLargeDeadlineDespiteInterruptionRisk: boolean
  ): void {
    this.constraintRelaxations.clear();
    for (const _ of relaxations?.relaxations || []) {
      this.constraintRelaxations.push(
        this.fb.group(
          {
            date: [null, Validators.required],
            level: [null, [Validators.required, noUnspecifiedRelaxationLevelValidator]],
            numberOfVisits: [null, [Validators.required, nonNegativeIntegerValidator]],
            time: [null, [Validators.required, timeStringValidator]],
          },
          {
            validators: [
              durationWithinGlobalStartEndTime(
                globalStartSeconds,
                globalEndSeconds,
                this.currentTimezone.offset
              ),
            ],
          }
        )
      );
    }

    this.form.reset({
      constraintRelaxations: this.constraintRelaxationsToFormValues(relaxations),
      timeout,
      populateTransitionPolylines: populateTransitionPolylines,
      allowLargeDeadlineDespiteInterruptionRisk: allowLargeDeadlineDespiteInterruptionRisk,
      interpretInjectedSolutionsUsingLabels: interpretInjectedSolutionsUsingLabels,
    });
  }

  constraintRelaxationsToFormValues(constraintRelaxations: IConstraintRelaxation): any[] {
    if (!constraintRelaxations) {
      return;
    }
    const values = [];

    constraintRelaxations.relaxations.forEach((relaxation) => {
      const seconds = durationSeconds(relaxation.thresholdTime);
      values.push({
        date: timeToDate(seconds),
        level: relaxation.level,
        numberOfVisits: relaxation.thresholdVisitCount,
        time: this.formatTime(seconds),
      });
    });
    return values;
  }

  onUpdateTimezone(timezone: Timezone): void {
    this.currentTimezone = timezone;
  }

  onUpdateLabel(label: string): void {
    this.globalSettings.label = label;
  }

  onUpdateSearchMode(selection: string): void {
    this.globalSettings.searchMode = parseInt(selection);
    this.currentSearchMode = selection;
  }

  onUpdateTraffic(selection: boolean): void {
    this.globalSettings.traffic = selection;
  }

  onUpdateTimeout(): void {
    if (!this.timeout.errors) {
      this.globalSettings.timeout = secondsToDuration(this.timeout.value);
    }
  }

  formatTime(seconds: Long): string {
    return formatLongTime(seconds, null, this.currentTimezone.offset);
  }

  toggleInjectedSolution(event: MatSlideToggleChange): void {
    this.injectedSolution = event.checked;
    this.globalSettings.injectedSolution = this.injectedSolution;
  }

  toggleSelectPopulateTransitionPolylines(event: MatSlideToggleChange): void {
    this.isSelectPopulateTransitionPolylines = event.checked;
    this.globalSettings.populateTransitionPolylines = this.isSelectPopulateTransitionPolylines;
  }

  toggleSelectAllowLargeDeadlineDespiteInterruptionRisk(event: MatSlideToggleChange): void {
    this.isSelectAllowLargeDeadlineDespiteInterruptionRisk = event.checked;
    this.globalSettings.allowLargeDeadlineDespiteInterruptionRisk =
      this.isSelectAllowLargeDeadlineDespiteInterruptionRisk;
  }

  toggleInterpretInjectedSolutionsUsingLabels(event: MatSlideToggleChange): void {
    this.isInterpretInjectedSolutionsUsingLabels = event.checked;
    this.globalSettings.interpretInjectedSolutionsUsingLabels =
      this.isInterpretInjectedSolutionsUsingLabels;
  }

  toggleAllowLargeDeadlineDespiteInterruptionRisk(event: MatSlideToggleChange): void {
    this.globalSettings.allowLargeDeadlineDespiteInterruptionRisk = event.checked;
  }

  updateThresholds(): void {
    if (this.constraintRelaxations.valid) {
      this.updatedTimeThresholds = this.formValuesToTimeThresholds();
    }
  }

  upsertThreshold(
    level: number,
    thresholdTime: ITimestamp,
    thresholdVisits: number,
    index = -1
  ): void {
    if (index >= 0 && this.updatedTimeThresholds.length > index) {
      this.updatedTimeThresholds[index].level = level;
      this.updatedTimeThresholds[index].thresholdTime = thresholdTime;
      this.updatedTimeThresholds[index].thresholdVisits = thresholdVisits;
      return;
    }

    this.updatedTimeThresholds.push({
      level,
      thresholdTime,
      thresholdVisits,
    });

    this.constraintRelaxations.clear();
    this.updatedTimeThresholds.forEach((_) => {
      this.constraintRelaxations.push(
        this.fb.group(
          {
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
                this.currentTimezone.offset
              ),
            ],
          }
        )
      );
    });

    this.constraintRelaxations.reset(
      this.constraintRelaxationsToFormValues(this.timeThresholdsToConstraintRelaxations())
    );
  }

  timeThresholdsToConstraintRelaxations(): IConstraintRelaxation {
    return {
      relaxations: this.updatedTimeThresholds.map((constraint) => ({
        level: constraint.level,
        thresholdTime: constraint.thresholdTime,
        thresholdVisitCount: constraint.thresholdVisits,
      })),
      vehicleIndices: [],
    };
  }

  removeThreshold(index: number): void {
    this.updatedTimeThresholds.splice(index, 1);
    this.constraintRelaxations.removeAt(index);
  }

  formValuesToTimeThresholds(): TimeThreshold[] {
    return this.constraintRelaxations.value.map((threshold) => ({
      index: threshold.index,
      level: threshold.level,
      thresholdTime: createTimestamp(
        localDateTimeToUtcSeconds(threshold.date, threshold.time, this.currentTimezone.offset)
      ),
      thresholdVisits: threshold.numberOfVisits,
    }));
  }

  initialRelaxationConstraintChanged(e: MatSelectChange): void {
    this.upsertThreshold(
      e.value,
      createTimestamp(
        localDateTimeToUtcSeconds(
          this.globalStartDateValue,
          this.globalStartTimeValue,
          this.currentTimezone.offset
        )
      ),
      0,
      0
    );
  }

  editAllThresholds(): void {
    this.store.dispatch(
      RequestSettingsActions.editAllGlobalRelaxationConstraints({
        constraintRelaxations: this.timeThresholdsToConstraintRelaxations(),
      })
    );
  }
}
