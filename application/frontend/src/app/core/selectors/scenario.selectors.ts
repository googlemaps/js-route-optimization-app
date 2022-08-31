/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import { durationSeconds } from 'src/app/util';
import { IShipmentModel } from '../models';
import DispatcherApiSelectors from './dispatcher-api.selectors';
import * as fromDispatcher from './dispatcher.selectors';
import * as fromEditVisit from './edit-visit.selectors';
import * as fromPoi from './point-of-interest.selectors';
import ShipmentSelectors from './shipment.selectors';
import ShipmentModelSelectors from './shipment-model.selectors';
import * as fromVehicle from './vehicle.selectors';
import VisitRequestSelectors from 'src/app/core/selectors/visit-request.selectors';
import PreSolveVehicleOperatorSelectors from './pre-solve-vehicle-operator.selectors';

export const selectModel = createSelector(
  fromDispatcher.selectScenario,
  (scenario) => scenario?.model
);

export const selectDuration = createSelector(selectModel, (model: IShipmentModel): [Long, Long] => {
  if (!model) {
    return;
  }

  const globalStartTime = model.globalStartTime ? durationSeconds(model.globalStartTime) : null;
  const globalEndTime = model.globalEndTime ? durationSeconds(model.globalEndTime) : null;
  if (globalStartTime == null || globalEndTime == null) {
    return;
  }

  return [globalStartTime, globalEndTime];
});

export const selectShipments = createSelector(selectModel, (model) => model?.shipments || []);

export const selectChangeTime = createSelector(
  ShipmentSelectors.selectChangeTime,
  VisitRequestSelectors.selectChangeTime,
  fromVehicle.selectChangeTime,
  (shipmentChangeTime, visitRequestChangeTime, vehicleChangeTime) =>
    Math.max(shipmentChangeTime, visitRequestChangeTime, vehicleChangeTime)
);

export const selectPendingChange = createSelector(
  fromPoi.selectSavePending,
  fromEditVisit.selectSavePending,
  (polylinePending, savePending) => polylinePending || savePending
);

/**
 * Whether scenario changes are disabled
 * @remarks
 * Scenario changes should not be allowed while the application waits for solution updates.
 * Scenario changes include all aspects that can affect request state e.g. pre-solve selection,
 * vehicle/shipment/visit request/visit modification.
 */
export const selectChangeDisabled = createSelector(
  DispatcherApiSelectors.selectOptimizeToursLoading,
  selectPendingChange,
  (loading, pendingChange) => loading || pendingChange
);

export const selectVisitTags = createSelector(
  selectModel,
  VisitRequestSelectors.selectVisitTags,
  fromVehicle.selectVisitTags,
  (model, visitRequestTags, vehicleVisitTags) => {
    const visitTags = new Set<string>();
    model?.transitionAttributes?.forEach((attribute) => {
      if (attribute.srcTag) {
        visitTags.add(attribute.srcTag);
      }
      if (attribute.dstTag) {
        visitTags.add(attribute.dstTag);
      }
    });
    visitRequestTags.forEach((tag) => visitTags.add(tag));
    vehicleVisitTags.forEach((tag) => visitTags.add(tag));
    return Array.from(visitTags).sort();
  }
);

export const selectVisitTypes = createSelector(
  VisitRequestSelectors.selectVisitTypes,
  fromVehicle.selectVisitTypes,
  (visitRequestTypes, vehicleVisitTypes) => {
    const visitTypes = new Set<string>();
    visitRequestTypes.forEach((type) => visitTypes.add(type));
    vehicleVisitTypes.forEach((type) => visitTypes.add(type));
    return Array.from(visitTypes).sort();
  }
);

export const selectShipmentTypes = createSelector(
  ShipmentSelectors.selectShipmentTypes,
  ShipmentModelSelectors.selectShipmentTypeIncompatibilities,
  ShipmentModelSelectors.selectShipmentTypeRequirements,
  (shipmentShipmentTypes, shipmentTypeIncompats, shipmentTypeReqs) => {
    const types = new Set<string>(shipmentShipmentTypes);

    shipmentTypeIncompats?.forEach((i) => i.types?.forEach((t) => types.add(t)));
    shipmentTypeReqs?.forEach((r) => {
      r.requiredShipmentTypeAlternatives?.forEach((t) => types.add(t));
      r.dependentShipmentTypes?.forEach((t) => types.add(t));
    });

    return Array.from(types).sort();
  }
);

export const selectVehicleOperatorTypes = createSelector(
  fromVehicle.selectOperatorTypes,
  PreSolveVehicleOperatorSelectors.selectVehicleOperatorTypes,
  (vehicleOperatorTypes, shipmentModelVehicleOperatorTypes) => {
    return new Set([...vehicleOperatorTypes, ...shipmentModelVehicleOperatorTypes]);
  }
);
