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

import { getShipmentEditChanges } from '.';
import { VisitRequest } from '../core/models';

describe('util', () => {
  describe('getShipmentEditChanges', () => {
    it('no visit requests', () => {
      const shipment = {
        id: 123,
        pickups: [],
        deliveries: [],
      };
      const res = getShipmentEditChanges(shipment, [], {});
      expect(res).toEqual({
        shipment: {
          upsert: [
            {
              ...shipment,
              pickups: [],
              deliveries: [],
              changeTime: res.shipment.upsert[0].changeTime,
            },
          ],
        },
        visitRequest: {
          upsert: [],
          delete: [],
        },
      });
    });
    it('has visit requests', () => {
      const shipment = {
        id: 123,
        pickups: [],
        deliveries: [],
      };
      const visitRequests: VisitRequest[] = [
        {
          id: 211,
          pickup: true,
          shipmentId: 123,
        },
        {
          id: 212,
          pickup: true,
          shipmentId: 123,
        },
        {
          id: 213,
          pickup: false,
          shipmentId: 123,
        },
      ];
      const res = getShipmentEditChanges(shipment, visitRequests, {});
      expect(res).toEqual({
        shipment: {
          upsert: [
            {
              ...shipment,
              pickups: visitRequests.filter((vr) => vr.pickup).map((vr) => vr.id),
              deliveries: visitRequests.filter((vr) => !vr.pickup).map((vr) => vr.id),
              changeTime: res.shipment.upsert[0].changeTime,
            },
          ],
        },
        visitRequest: {
          upsert: visitRequests.map((vr) => ({
            ...vr,
            changeTime: res.shipment.upsert[0].changeTime,
          })),
          delete: [],
        },
      });
    });
    it('has previous entities', () => {
      const shipment = {
        id: 123,
        pickups: [],
        deliveries: [],
      };
      const visitRequests: VisitRequest[] = [
        {
          id: 211,
          pickup: true,
          shipmentId: 123,
        },
        {
          id: 212,
          pickup: true,
          shipmentId: 123,
        },
        {
          id: 213,
          pickup: false,
          shipmentId: 123,
        },
      ];
      const res = getShipmentEditChanges(shipment, visitRequests, {
        123: {
          id: 123,
          pickups: [111],
          deliveries: [112],
        },
      });
      expect(res).toEqual({
        shipment: {
          upsert: [
            {
              ...shipment,
              pickups: visitRequests.filter((vr) => vr.pickup).map((vr) => vr.id),
              deliveries: visitRequests.filter((vr) => !vr.pickup).map((vr) => vr.id),
              changeTime: res.shipment.upsert[0].changeTime,
            },
          ],
        },
        visitRequest: {
          upsert: visitRequests.map((vr) => ({
            ...vr,
            changeTime: res.shipment.upsert[0].changeTime,
          })),
          delete: [111, 112],
        },
      });
    });
  });
});
