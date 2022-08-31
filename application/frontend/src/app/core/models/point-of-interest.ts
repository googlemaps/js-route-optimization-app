/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export enum PointOfInterestCategory {
  Depot = 1,
  Pickup,
  Delivery,
  ServiceCall,
}

/** [visit id, point of interest category, time (seconds)] */
export type PointOfInterest = [number, PointOfInterestCategory, Long];

export interface PointOfInterestClick {
  category: PointOfInterestCategory;
  relativeTo: Element;
  visitId: number;
}

export interface PointOfInterestStartDrag {
  mousePosition: [number, number];
  scrollOffset: [number, number];
  secondsPerPixel: number;
  visitId: number;
}

export interface PointOfInterestEndDrag {
  mousePosition: [number, number];
}

export interface PointOfInterestTimelineOverlapBegin {
  id: number;
  scrollOffsetY: number;
  y: number;
}
