/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Dictionary } from '@ngrx/entity';
import { Shipment, VisitRequest } from '../core/models';

interface ShipmentChanges {
  shipment: {
    upsert: Shipment[];
  };
  visitRequest: {
    upsert: VisitRequest[];
    delete: number[];
  };
}

export function getShipmentEditChanges(
  shipment: Shipment,
  visitRequests: VisitRequest[],
  shipmentEntities: Dictionary<Shipment>
): ShipmentChanges {
  const previous = shipmentEntities[shipment.id] || ({} as Shipment);
  const previousVisitRequestIds = (previous.pickups || []).concat(previous.deliveries || []);
  const currentVisitRequestIds = new Set<number>(visitRequests.map((vr) => vr.id));
  const changeTime = Date.now();
  return {
    shipment: {
      upsert: [
        {
          ...shipment,
          pickups: visitRequests.filter((vr) => vr.pickup).map((vr) => vr.id),
          deliveries: visitRequests.filter((vr) => !vr.pickup).map((vr) => vr.id),
          changeTime,
        },
      ],
    },
    visitRequest: {
      upsert: visitRequests.map((vr) => ({ ...vr, changeTime })),
      delete: previousVisitRequestIds.filter((id) => !currentVisitRequestIds.has(id)),
    },
  };
}
