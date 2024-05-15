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

import { PointOfInterestCategory } from 'src/app/core/models/point-of-interest';

export interface PointsOfInterestImageAttribute {
  href: string;
  title: string;
  width: number;
  height: number;
  yOffset: number;
}

export const pointsOfInterestImages = {
  [PointOfInterestCategory.Depot]: {
    href: '/assets/images/depot_small.svg',
    width: 12,
    height: 13,
    yOffset: 0,
    title: 'Depot',
  },
  [PointOfInterestCategory.Pickup]: {
    href: `/assets/images/pickup.svg`,
    width: 12.316,
    height: 10.526,
    yOffset: 0,
    title: 'Pickup',
  },
  [PointOfInterestCategory.Delivery]: {
    href: '/assets/images/dropoff.svg',
    width: 12.315,
    height: 10.527,
    yOffset: -1,
    title: 'Delivery',
  },
  [PointOfInterestCategory.ServiceCall]: {
    href: '/assets/images/visit.svg',
    width: 13,
    height: 13,
    yOffset: 0,
    title: 'Visit',
  },
};
