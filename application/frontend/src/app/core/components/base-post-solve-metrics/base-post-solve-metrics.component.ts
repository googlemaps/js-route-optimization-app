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
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { formatLongTime, secondsPerDay } from 'src/app/util';
import { TimeSet } from '../../models';

@Component({
  selector: 'app-base-post-solve-metrics',
  templateUrl: './base-post-solve-metrics.component.html',
  styleUrls: ['./base-post-solve-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasePostSolveMetricsComponent implements OnChanges {
  @Input() duration: [Long, Long];
  @Input() numberOfRoutes: number;
  @Input() solveTime: number;
  @Input() skippedShipmentsCount: number;
  @Input() shipmentsCount: number;
  @Input() totalCost: number;
  @Input() totalDistance: number;
  @Input() timezoneOffset = 0;
  @Input() vehicleTimeAverages: TimeSet;
  @Output() skippedShipmentsClick = new EventEmitter<void>();

  solveSeconds: number;
  formattedStart: string;
  formattedEnd: string;
  totalDays: number;

  get madeShipments(): number {
    return this.shipmentsCount - this.skippedShipmentsCount;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.solveTime) {
      this.solveSeconds = this.solveTime / 1000;
    }
    if (changes.duration) {
      this.formattedStart = formatLongTime(this.duration[0], null, this.timezoneOffset);
      this.formattedEnd = formatLongTime(this.duration[1], null, this.timezoneOffset);
      this.totalDays = Math.floor(
        this.duration[1].subtract(this.duration[0]).toNumber() / secondsPerDay
      );
    }
  }
}
