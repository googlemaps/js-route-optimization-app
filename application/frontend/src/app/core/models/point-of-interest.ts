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
