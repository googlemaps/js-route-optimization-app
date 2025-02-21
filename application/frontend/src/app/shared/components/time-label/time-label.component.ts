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

import { Component, Input, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { pixelToTime, formatLongTime } from 'src/app/util';
import Long from 'long';

/**
 * Displays the time labels for a timeline
 *
 * @remarks Supplemental component to the timeline.
 */
@Component({
  selector: 'app-time-label',
  templateUrl: './time-label.component.html',
  styleUrls: ['./time-label.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeLabelComponent implements OnChanges {
  static readonly maxOffset = 20;

  @Input() usableWidth = 0;
  @Input() maxOffset = 0;
  @Input() duration: [Long, Long];
  @Input() timezoneOffset: number;

  readonly labelWidth = TimeLabelComponent.maxOffset * 2 + 8;
  timeLabels: [string, number][] = [];

  ngOnChanges(): void {
    if (this.usableWidth > 0) {
      this.updateTimeLabels();
    }
  }

  /** Project time labels to pixel space */
  private updateTimeLabels(): void {
    if (!this.duration || !this.usableWidth) {
      this.timeLabels = [];
      return;
    }

    const startTime = this.duration[0];
    const endTime = this.duration[1];
    const durationSeconds = endTime.subtract(startTime);
    if (durationSeconds.isZero()) {
      this.timeLabels = [];
      return;
    }

    const spacingFactor = 2;
    const labelLimit = Math.max(
      Math.floor(this.usableWidth / (spacingFactor * this.labelWidth)),
      2
    );
    const labels: [string, number][] = [];
    const labelStride = this.usableWidth / (labelLimit - 1);
    for (let i = 0; i < labelLimit; i++) {
      const timePosition = i * labelStride;
      const pixelTime = pixelToTime(timePosition, this.usableWidth, startTime, durationSeconds);
      const formattedTime = formatLongTime(pixelTime, startTime, this.timezoneOffset);
      labels.splice(0, 0, [formattedTime, this.maxOffset + timePosition]);
    }
    this.timeLabels = labels;
  }
}
