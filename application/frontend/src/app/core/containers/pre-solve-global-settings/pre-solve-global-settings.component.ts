/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { select, Store } from '@ngrx/store';
import * as Long from 'long';
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
import { IConstraintRelaxation, IDuration, ITimestamp, RelaxationLevel } from '../../models';
import { selectTimezone } from '../../selectors/config.selectors';
import RequestSettingsSelectors from '../../selectors/request-settings.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import { RequestSettings, TimeThreshold } from '../../models/request-settings';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { RequestSettingsActions } from '../../actions';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-pre-solve-global-settings',
  templateUrl: './pre-solve-global-settings.component.html',
  styleUrls: ['./pre-solve-global-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSolveGlobalSettingsComponent implements OnDestroy {
  get constraintRelaxations(): FormArray {
    return this.form.get('constraintRelaxations') as FormArray;
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
  label$: Observable<string>;
  traffic$: Observable<boolean>;
  injectedSolution: boolean;

  isInterpretInjectedSolutionsUsingLabels: boolean;
  isSelectPopulateTransitionPolylines: boolean;
  isSelectAllowLargeDeadlineDespiteInterruptionRisk: boolean;
  updatedTimeThresholds: TimeThreshold[];

  currentSearchMode: string;
  currentTimezone: Timezone;
  newTimeZone?: Timezone;
  private globalStartDateValue: Date;
  private globalStartTimeValue: string;
  private globalStartSeconds: Long;
  private globalEndSeconds: Long;
  globalSettings: Partial<RequestSettings> = {};

  form: FormGroup;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.initForm();

    combineLatest([
      store.pipe(select(selectTimezone)),
      store.pipe(select(ShipmentModelSelectors.selectGlobalStartTime)),
      store.pipe(select(ShipmentModelSelectors.selectGlobalEndTime)),
      store.pipe(select(RequestSettingsSelectors.selectTimeout)),
      store.pipe(select(RequestSettingsSelectors.selectGlobalConstraintRelaxations)),
      store.pipe(select(RequestSettingsSelectors.selectInjectedSolution)),
      store.pipe(select(RequestSettingsSelectors.selectInterpretInjectedSolutionsUsingLabels)),
      store.pipe(select(RequestSettingsSelectors.selectPopulateTransitionPolylines)),
      store.pipe(select(RequestSettingsSelectors.selectAllowLargeDeadlineDespiteInterruptionRisk)),
    ])
      .pipe(take(1))
      .subscribe(
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

    store
      .pipe(select(RequestSettingsSelectors.selectSearchMode))
      .subscribe(
        (currentSearchMode) => (this.currentSearchMode = (currentSearchMode || '').toString())
      );

    this.label$ = store.pipe(select(RequestSettingsSelectors.selectLabel));
    this.traffic$ = store.pipe(select(RequestSettingsSelectors.selectTraffic));
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
    this.newTimeZone = timezone;
  }

  onUpdateLabel(label: string): void {
    this.globalSettings.label = label;
  }

  onUpdateSearchMode(selection: string): void {
    this.globalSettings.searchMode = parseInt(selection);
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
