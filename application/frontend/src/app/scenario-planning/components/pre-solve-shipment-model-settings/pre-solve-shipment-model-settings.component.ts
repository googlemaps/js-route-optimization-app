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

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { Subscription, combineLatest, Observable } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { NormalizedShipmentModel } from '../../../core/models';
import { ShipmentModelSelectors } from '../../../core/selectors/shipment-model.selectors';
import { timeStringValidator } from '../../../util/validators';
import {
  durationSeconds,
  formatLongTime,
  localDateTimeToUtcSeconds,
  maxInt32Value,
  timeToDate,
} from 'src/app/util';
import { Timezone } from '../../../shared/models';
import { selectTimezone, selectTimezoneOffset } from '../../../core/selectors/config.selectors';
import Long from 'long';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-pre-solve-shipment-model-settings',
  templateUrl: './pre-solve-shipment-model-settings.component.html',
  styleUrls: ['./pre-solve-shipment-model-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSolveShipmentModelSettingsComponent implements OnInit, OnDestroy {
  timezoneOffset$: Observable<number>;

  maxInt32 = maxInt32Value;
  currentTimezone: Timezone;

  updatedShipmentModelSettings: NormalizedShipmentModel = {};

  get globalDurationCostPerHourControl(): UntypedFormControl {
    return this.form.get('globalDurationCostPerHour') as UntypedFormControl;
  }
  get maxActiveVehicles(): UntypedFormControl {
    return this.form.get('maxActiveVehicles') as UntypedFormControl;
  }
  get globalStartDate(): UntypedFormControl {
    return this.form.get('globalStartDate') as UntypedFormControl;
  }
  get globalStartTime(): UntypedFormControl {
    return this.form.get('globalStartTime') as UntypedFormControl;
  }
  get globalEndDate(): UntypedFormControl {
    return this.form.get('globalEndDate') as UntypedFormControl;
  }
  get globalEndTime(): UntypedFormControl {
    return this.form.get('globalEndTime') as UntypedFormControl;
  }

  startAt(): { startAt: Date } {
    const startTime = durationSeconds(null, null);
    return {
      startAt: startTime != null ? new Date(startTime.toNumber() * 1000) : null,
    };
  }

  endAt(): { startAt: Date } {
    const endTime = durationSeconds(null, null);
    return {
      startAt: endTime != null ? new Date(endTime.toNumber() * 1000) : null,
    };
  }

  keys = Object.keys;
  parseInt = parseInt;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  form: UntypedFormGroup;

  private readonly subscriptions: Subscription[] = [];
  scenarioShipmentTypes: string[] = []; // shipment types anywhere in the scenario
  shipmentsShipmentTypes: string[] = []; // shipment types only on shipments

  constructor(private fb: UntypedFormBuilder, private store: Store) {
    this.initForm();
    this.initData();
  }
  ngOnInit(): void {
    this.timezoneOffset$ = this.store.pipe(select(selectTimezoneOffset), take(1));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  resetData(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.initData();
  }

  initData(): void {
    // global duration cost per hour
    this.subscriptions.push(
      this.store
        .pipe(select(ShipmentModelSelectors.selectGlobalDurationCostPerHour))
        .subscribe((globalDurationCostPerHour) => {
          this.globalDurationCostPerHourControl.reset(globalDurationCostPerHour);
        })
    );

    // max active vehicles
    this.subscriptions.push(
      this.store
        .pipe(select(ShipmentModelSelectors.selectMaxActiveVehicles))
        .subscribe((maxActiveVehicles) => {
          this.maxActiveVehicles.reset(maxActiveVehicles);
        })
    );

    this.subscriptions.push(
      combineLatest([
        this.store.pipe(select(selectTimezone)),
        this.store.pipe(select(ShipmentModelSelectors.selectGlobalStartTime)),
        this.store.pipe(select(ShipmentModelSelectors.selectGlobalEndTime)),
      ]).subscribe(([selectTimezone, selectGlobalStartTime, selectGlobalEndTime]) => {
        this.currentTimezone = selectTimezone as Timezone;
        this.globalStartDate.reset(
          timeToDate(Long.fromValue(selectGlobalStartTime), this.currentTimezone.offset)
        );
        this.globalStartTime.reset(this.formatTime(Long.fromValue(selectGlobalStartTime)));
        this.globalEndDate.reset(
          timeToDate(Long.fromValue(selectGlobalEndTime), this.currentTimezone.offset)
        );
        this.globalEndTime.reset(this.formatTime(Long.fromValue(selectGlobalEndTime)));
      })
    );
  }

  initForm(): void {
    this.form = this.fb.group({
      globalDurationCostPerHour: [null],
      maxActiveVehicles: [null, [Validators.min(1), Validators.max(maxInt32Value)]],
      globalStartDate: [null, Validators.required],
      globalStartTime: [null, [Validators.required, timeStringValidator]],
      globalEndDate: [null, Validators.required],
      globalEndTime: [null, [Validators.required, timeStringValidator]],
    });
  }

  // global duration cost per hour
  onUpdateGlobalDurationCostPerHour(): void {
    if (this.globalDurationCostPerHourControl.status === 'VALID') {
      this.updatedShipmentModelSettings.globalDurationCostPerHour =
        this.globalDurationCostPerHourControl.value;
    }
  }

  // max active vehicles
  onUpdateMaxActiveVehicles(): void {
    if (this.maxActiveVehicles.status === 'VALID') {
      this.updatedShipmentModelSettings.maxActiveVehicles = this.maxActiveVehicles.value;
    }
  }

  // global start date time
  onUpdateStartDatetime(): void {
    if (
      this.globalStartDate.value == null ||
      this.globalStartTime.value == null ||
      this.globalStartTime.value === ''
    ) {
      return;
    }
    this.updatedShipmentModelSettings.globalStartTime = localDateTimeToUtcSeconds(
      this.globalStartDate.value,
      this.globalStartTime.value,
      this.currentTimezone.offset
    );
  }

  // global end date time
  onUpdateEndDatetime(): void {
    if (
      this.globalEndDate.value == null ||
      this.globalEndTime.value == null ||
      this.globalEndTime.value === ''
    ) {
      return;
    }
    this.updatedShipmentModelSettings.globalEndTime = localDateTimeToUtcSeconds(
      this.globalEndDate.value,
      this.globalEndTime.value,
      this.currentTimezone.offset
    );
  }

  private shouldUpdateState(control: AbstractControl): boolean {
    return control.enabled && (control.touched || control.dirty) && control.valid;
  }

  formatTime(seconds: Long): string {
    return formatLongTime(seconds, null, this.currentTimezone.offset);
  }
}
