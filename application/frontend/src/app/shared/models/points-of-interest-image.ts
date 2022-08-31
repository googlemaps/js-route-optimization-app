/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
