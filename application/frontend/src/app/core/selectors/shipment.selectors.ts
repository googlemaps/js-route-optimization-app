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
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Shipment, Visit } from '../models';
import * as fromShipment from '../reducers/shipment.reducer';

export const selectShipmentState = createFeatureSelector<fromShipment.State>(
  fromShipment.shipmentsFeatureKey
);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  fromShipment.adapter.getSelectors(selectShipmentState);

const selectById = (id: number) =>
  createSelector(selectEntities, (shipments: Dictionary<Shipment>) => shipments[id]);

const selectByIds = (ids: number[]) =>
  createSelector(
    selectEntities,
    (shipments: Dictionary<Shipment>) => ids?.map((id) => shipments[id]) || []
  );

const selectChangeTime = createSelector(selectShipmentState, fromShipment.selectChangeTime);

const selectSkipped = createSelector(selectShipmentState, fromShipment.selectSkipped);

const selectSkippedReasons = createSelector(selectShipmentState, fromShipment.selectSkippedReasons);

const selectSkippedLookup = createSelector(selectSkipped, (skipped) => new Set(skipped));

const selectSkippedShipments = createSelector(selectSkipped, selectEntities, (skipped, shipments) =>
  skipped.map((id) => shipments[id])
);

const selectShipmentIndexById = createSelector(
  selectIds,
  (ids: number[] | string[]) => new Map((ids as number[]).map((id, index) => [id, index]))
);

const selectLastDeletedIndices = createSelector(
  selectShipmentState,
  fromShipment.selectLastDeletedIndices
);

export const getPickup = (shipment: Shipment, visits: Dictionary<Visit>): Visit => {
  const visitRequestIds = shipment?.pickups || [];
  for (const visitRequestId of visitRequestIds) {
    if (visits[visitRequestId]) {
      return visits[visitRequestId];
    }
  }
};

export const getDelivery = (shipment: Shipment, visits: Dictionary<Visit>): Visit => {
  const visitRequestIds = shipment?.deliveries || [];
  for (const visitRequestId of visitRequestIds) {
    if (visits[visitRequestId]) {
      return visits[visitRequestId];
    }
  }
};

const selectShipmentForEdit = (id: number) =>
  createSelector(selectById(id), selectIds, (shipment, ids: number[] | string[]): Shipment => {
    if (shipment) {
      return shipment;
    }
    const nextId = ids.length ? Math.max.apply(null, ids) + 1 : 1;
    return {
      id: nextId,
      pickups: [],
      deliveries: [],
    };
  });

const selectShipmentTypes = createSelector(selectAll, (shipments) => {
  const shipmentTypes = new Set<string>();
  shipments.forEach((shipment) => {
    if (shipment.shipmentType) {
      shipmentTypes.add(shipment.shipmentType);
    }
  });
  return shipmentTypes;
});

export const ShipmentSelectors = {
  selectById,
  selectByIds,
  selectChangeTime,
  selectSkipped,
  selectSkippedReasons,
  selectSkippedLookup,
  selectSkippedShipments,
  selectShipmentIndexById,
  selectShipmentForEdit,
  selectShipmentTypes,
  selectLastDeletedIndices,
};

export default ShipmentSelectors;
