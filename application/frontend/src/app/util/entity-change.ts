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
