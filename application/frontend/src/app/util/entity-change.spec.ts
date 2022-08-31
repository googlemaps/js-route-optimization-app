/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
