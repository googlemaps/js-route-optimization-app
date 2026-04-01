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
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { ITimeWindow, Vehicle } from '../../models';
import { durationSeconds } from 'src/app/util/duration';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-base-pre-solve-vehicle-info-window',
  templateUrl: './base-pre-solve-vehicle-info-window.component.html',
  styleUrl: './base-pre-solve-vehicle-info-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasePreSolveVehicleInfoWindowComponent implements OnChanges {
  @Input() vehicle: Vehicle;
  @Input() timezoneOffset = 0;
  @Input() globalDuration: [Long, Long];

  loadLimitsNames: string[] = [];
  loadLimitsValues: string[] = [];
  startTimeWindows: string[] = [];

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.getFormattedLoadLimits();
    this.getFormattedTimeWindows();
  }

  getFormattedTimeWindows(): void {
    this.startTimeWindows = [];

    if (!this.vehicle || !this.vehicle.startTimeWindows) {
      return;
    }

    this.vehicle.startTimeWindows.forEach((timewindow) => {
      if (!timewindow.startTime && !timewindow.endTime) {
        return;
      }
      this.startTimeWindows.push(this.formatTimeWindow(timewindow));
    });
  }

  getFormattedLoadLimits(): void {
    this.loadLimitsNames = [];
    this.loadLimitsValues = [];

    if (!this.vehicle) {
      return;
    }

    Object.keys(this.vehicle.loadLimits || {}).forEach((key) => {
      if (this.vehicle.loadLimits[key].maxLoad) {
        this.loadLimitsNames.push(key);
        this.loadLimitsValues.push(`${this.vehicle.loadLimits[key].maxLoad}`);
      }
    });
  }

  formatTimeWindow(timewindow: ITimeWindow): string {
    const startTime = timewindow.startTime
      ? durationSeconds(timewindow.startTime).toNumber()
      : this.globalDuration[0].toNumber();
    const endTime = timewindow.endTime
      ? durationSeconds(timewindow.endTime).toNumber()
      : this.globalDuration[1].toNumber();

    const formattedStart = formatDate(
      (startTime + this.timezoneOffset) * 1000,
      'yyyy/MM/dd h:mm aa',
      this.locale,
      'UTC'
    ).toLocaleLowerCase(this.locale);
    const formattedEnd = formatDate(
      (endTime + this.timezoneOffset) * 1000,
      'yyyy/MM/dd h:mm aa',
      this.locale,
      'UTC'
    ).toLocaleLowerCase(this.locale);

    return `${formattedStart} - ${formattedEnd}`;
  }
}
