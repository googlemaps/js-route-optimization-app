/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { Shipment, Vehicle, VisitRequest } from 'src/app/core/models';
import { getEntityName } from 'src/app/util';

/**
 * Returns the entity name
 */
@Pipe({ name: 'entityName' })
export class EntityNamePipe implements PipeTransform {
  transform(entity: Shipment | Vehicle | VisitRequest, defaultNamePrefix?: string): string {
    return getEntityName(entity, defaultNamePrefix);
  }
}
