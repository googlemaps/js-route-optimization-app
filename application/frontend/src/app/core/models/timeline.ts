/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export enum TimelineCategory {
  Service = 1,
  Driving,
  IdleTime,
  BreakTime,
}

export interface TimeSegment {
  startTime: Long;
  endTime: Long;
  duration: Long;
}

export interface TravelTimeSegment {
  startTime: Long;
  endTime: Long;
  gapStartTime: Long;
  gapEndTime: Long;
}

export interface TimelineCatagorySegment {
  category: TimelineCategory;
  startTime: Long;
  endTime: Long;
}

export type Timeline = TimelineCatagorySegment[];

export interface TimeSet {
  breakTime: number;
  idleTime: number;
  serviceTime: number;
  travelTime: number;
}
