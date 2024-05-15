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
