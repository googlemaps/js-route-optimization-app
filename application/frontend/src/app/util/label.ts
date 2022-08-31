/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Shipment, Vehicle, VehicleOperator, VisitRequest } from '../core/models';

export function joinLabel(value: string[]): string {
  return value?.join(',') || null;
}

export function splitLabel(value: string): string[] {
  return (
    value
      ?.split(',')
      .map((l) => l.trim())
      .filter(Boolean) || null
  );
}

export function getEntityName(
  entity: Shipment | Vehicle | VisitRequest | VehicleOperator,
  defaultNamePrefix = ''
): string {
  return entity && (entity.label || defaultNamePrefix + ' #' + entity.id);
}
