/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
