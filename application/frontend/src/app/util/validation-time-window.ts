/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export interface IValidationTimeWindow {
  startTime: number;
  endTime: number;
}

export function detectTimeWindowOverlap(timeWindows: IValidationTimeWindow[]): boolean {
  for (let i = 0, l = timeWindows.length - 1; i < l; i++) {
    const timeWindow = timeWindows[i];
    for (let j = i + 1; j < timeWindows.length; j++) {
      const otherTimeWindow = timeWindows[j];
      if (
        timeWindow.startTime <= otherTimeWindow.endTime &&
        timeWindow.endTime >= otherTimeWindow.startTime
      ) {
        return true;
      }
    }
  }
}

/** Representation of a time window (not strictly ITimeWindow) for validation */
export class ValidationTimeWindow implements IValidationTimeWindow {
  startTime: number;
  endTime: number;

  private get valid(): boolean {
    return this.startTime != null && this.endTime != null && this.startTime <= this.endTime;
  }

  constructor(props?: { startTime: number; endTime: number }) {
    Object.assign(this, props);
  }

  contains(range: ValidationTimeWindow): boolean {
    if (this.valid && range.valid) {
      return this.startTime <= range.startTime && range.endTime <= this.endTime;
    }
    return false;
  }

  containsTime(time: number): boolean {
    if (this.valid) {
      return this.startTime <= time && time <= this.endTime;
    }
    return false;
  }

  overlaps(range: ValidationTimeWindow): boolean {
    if (this.valid && range.valid) {
      return this.startTime <= range.endTime && this.endTime >= range.startTime;
    }
    return false;
  }
}
