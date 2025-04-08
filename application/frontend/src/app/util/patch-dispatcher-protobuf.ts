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

import { google } from '@googlemaps/routeoptimization/build/protos/protos';
import { isCanonicalDuration, isCanonicalTimestamp } from './canonical-protobuf';

export function patchConstraintRelaxation(): void {
  const fromObject =
    google.maps.routeoptimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.fromObject;
  google.maps.routeoptimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.fromObject = (
    object: google.maps.routeoptimization.v1.InjectedSolutionConstraint.IConstraintRelaxation
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (Array.isArray(object.relaxations)) {
      object.relaxations = object.relaxations.map((relaxation) => {
        if (isCanonicalTimestamp(relaxation.thresholdTime)) {
          return {
            ...relaxation,
            thresholdTime: google.protobuf.Timestamp.fromObject(relaxation.thresholdTime),
          };
        }
        return relaxation;
      });
    }
    return fromObject(object);
  };
}

export function patchOptimizeToursRequest(): void {
  const fromObject = google.maps.routeoptimization.v1.OptimizeToursRequest.fromObject;
  google.maps.routeoptimization.v1.OptimizeToursRequest.fromObject = (
    object: google.maps.routeoptimization.v1.IOptimizeToursRequest
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    if (isCanonicalDuration(object.timeout)) {
      object = {
        ...object,
        timeout: google.protobuf.Duration.fromObject(object.timeout),
      };
    }
    return fromObject(object);
  };
}

export function patchRow(): void {
  const fromObject =
    google.maps.routeoptimization.v1.ShipmentModel.DurationDistanceMatrix.Row.fromObject;
  google.maps.routeoptimization.v1.ShipmentModel.DurationDistanceMatrix.Row.fromObject = (
    object: google.maps.routeoptimization.v1.ShipmentModel.DurationDistanceMatrix.IRow
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (Array.isArray(object.durations)) {
      object.durations = object.durations.map((duration) => {
        if (isCanonicalDuration(duration)) {
          return google.protobuf.Duration.fromObject(duration);
        }
        return duration;
      });
    }
    return fromObject(object);
  };
}

export function patchShipment(): void {
  const fromObject = google.maps.routeoptimization.v1.Shipment.fromObject;
  google.maps.routeoptimization.v1.Shipment.fromObject = (
    object: google.maps.routeoptimization.v1.IShipment
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.pickupToDeliveryAbsoluteDetourLimit)) {
      object.pickupToDeliveryAbsoluteDetourLimit = google.protobuf.Duration.fromObject(
        object.pickupToDeliveryAbsoluteDetourLimit
      );
    }
    if (isCanonicalDuration(object.pickupToDeliveryTimeLimit)) {
      object.pickupToDeliveryTimeLimit = google.protobuf.Duration.fromObject(
        object.pickupToDeliveryTimeLimit
      );
    }
    return fromObject(object);
  };
}

export function patchShipmentModel(): void {
  const fromObject = google.maps.routeoptimization.v1.ShipmentModel.fromObject;
  google.maps.routeoptimization.v1.ShipmentModel.fromObject = (
    object: google.maps.routeoptimization.v1.IShipmentModel
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.globalStartTime)) {
      object.globalStartTime = google.protobuf.Timestamp.fromObject(object.globalStartTime);
    }
    if (isCanonicalTimestamp(object.globalEndTime)) {
      object.globalEndTime = google.protobuf.Timestamp.fromObject(object.globalEndTime);
    }
    return fromObject(object);
  };
}

export function patchShipmentModelBreakRuleBreakRequest(): void {
  const fromObject = google.maps.routeoptimization.v1.BreakRule.BreakRequest.fromObject;
  google.maps.routeoptimization.v1.BreakRule.BreakRequest.fromObject = (
    object: google.maps.routeoptimization.v1.BreakRule.IBreakRequest
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.earliestStartTime)) {
      object.earliestStartTime = google.protobuf.Timestamp.fromObject(object.earliestStartTime);
    }
    if (isCanonicalTimestamp(object.latestStartTime)) {
      object.latestStartTime = google.protobuf.Timestamp.fromObject(object.latestStartTime);
    }
    if (isCanonicalDuration(object.minDuration)) {
      object.minDuration = google.protobuf.Duration.fromObject(object.minDuration);
    }
    return fromObject(object);
  };
}

export function patchShipmentModelBreakRuleFrequencyConstraint(): void {
  const fromObject = google.maps.routeoptimization.v1.BreakRule.FrequencyConstraint.fromObject;
  google.maps.routeoptimization.v1.BreakRule.FrequencyConstraint.fromObject = (
    object: google.maps.routeoptimization.v1.BreakRule.IFrequencyConstraint
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.minBreakDuration)) {
      object.minBreakDuration = google.protobuf.Duration.fromObject(object.minBreakDuration);
    }
    if (isCanonicalDuration(object.maxInterBreakDuration)) {
      object.maxInterBreakDuration = google.protobuf.Duration.fromObject(
        object.maxInterBreakDuration
      );
    }
    return fromObject(object);
  };
}

export function patchShipmentModelPrecedenceRule(): void {
  const fromObject = google.maps.routeoptimization.v1.ShipmentModel.PrecedenceRule.fromObject;
  google.maps.routeoptimization.v1.ShipmentModel.PrecedenceRule.fromObject = (
    object: google.maps.routeoptimization.v1.ShipmentModel.IPrecedenceRule
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.offsetDuration)) {
      object.offsetDuration = google.protobuf.Duration.fromObject(object.offsetDuration);
    }
    return fromObject(object);
  };
}

export function patchShipmentRoute(): void {
  const fromObject = google.maps.routeoptimization.v1.ShipmentRoute.fromObject;
  google.maps.routeoptimization.v1.ShipmentRoute.fromObject = (
    object: google.maps.routeoptimization.v1.IShipmentRoute
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.vehicleStartTime)) {
      object.vehicleStartTime = google.protobuf.Timestamp.fromObject(object.vehicleStartTime);
    }
    if (isCanonicalTimestamp(object.vehicleEndTime)) {
      object.vehicleEndTime = google.protobuf.Timestamp.fromObject(object.vehicleEndTime);
    }
    return fromObject(object);
  };
}

export function patchShipmentRouteBreak(): void {
  const fromObject = google.maps.routeoptimization.v1.ShipmentRoute.Break.fromObject;
  google.maps.routeoptimization.v1.ShipmentRoute.Break.fromObject = (
    object: google.maps.routeoptimization.v1.ShipmentRoute.IBreak
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.startTime)) {
      object.startTime = google.protobuf.Timestamp.fromObject(object.startTime);
    }
    if (isCanonicalDuration(object.duration)) {
      object.duration = google.protobuf.Duration.fromObject(object.duration);
    }
    return fromObject(object);
  };
}

export function patchShipmentRouteTransition(): void {
  const fromObject = google.maps.routeoptimization.v1.ShipmentRoute.Transition.fromObject;
  google.maps.routeoptimization.v1.ShipmentRoute.Transition.fromObject = (
    object: google.maps.routeoptimization.v1.ShipmentRoute.ITransition
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.travelDuration)) {
      object.travelDuration = google.protobuf.Duration.fromObject(object.travelDuration);
    }
    if (isCanonicalDuration(object.delayDuration)) {
      object.delayDuration = google.protobuf.Duration.fromObject(object.delayDuration);
    }
    if (isCanonicalDuration(object.breakDuration)) {
      object.breakDuration = google.protobuf.Duration.fromObject(object.breakDuration);
    }
    if (isCanonicalDuration(object.waitDuration)) {
      object.waitDuration = google.protobuf.Duration.fromObject(object.waitDuration);
    }
    if (isCanonicalDuration(object.totalDuration)) {
      object.totalDuration = google.protobuf.Duration.fromObject(object.totalDuration);
    }
    if (isCanonicalTimestamp(object.startTime)) {
      object.startTime = google.protobuf.Timestamp.fromObject(object.startTime);
    }
    return fromObject(object);
  };
}

export function patchShipmentRouteVisit(): void {
  const fromObject = google.maps.routeoptimization.v1.ShipmentRoute.Visit.fromObject;
  google.maps.routeoptimization.v1.ShipmentRoute.Visit.fromObject = (
    object: google.maps.routeoptimization.v1.ShipmentRoute.IVisit
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.startTime)) {
      object.startTime = google.protobuf.Timestamp.fromObject(object.startTime);
    }
    if (isCanonicalDuration(object.detour)) {
      object.detour = google.protobuf.Duration.fromObject(object.detour);
    }
    return fromObject(object);
  };
}

export function patchTimeWindow(): void {
  const fromObject = google.maps.routeoptimization.v1.TimeWindow.fromObject;
  google.maps.routeoptimization.v1.TimeWindow.fromObject = (
    object: google.maps.routeoptimization.v1.ITimeWindow
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.startTime)) {
      object.startTime = google.protobuf.Timestamp.fromObject(object.startTime);
    }
    if (isCanonicalTimestamp(object.endTime)) {
      object.endTime = google.protobuf.Timestamp.fromObject(object.endTime);
    }
    if (isCanonicalTimestamp(object.softStartTime)) {
      object.softStartTime = google.protobuf.Timestamp.fromObject(object.softStartTime);
    }
    if (isCanonicalTimestamp(object.softEndTime)) {
      object.softEndTime = google.protobuf.Timestamp.fromObject(object.softEndTime);
    }
    return fromObject(object);
  };
}

export function patchTransitionAttributes(): void {
  const fromObject = google.maps.routeoptimization.v1.TransitionAttributes.fromObject;
  google.maps.routeoptimization.v1.TransitionAttributes.fromObject = (
    object: google.maps.routeoptimization.v1.ITransitionAttributes
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    if (isCanonicalDuration(object.delay)) {
      object.delay = google.protobuf.Duration.fromObject(object.delay);
    }
    return fromObject(object);
  };
}

export function patchVehicle(): void {
  const fromObject = google.maps.routeoptimization.v1.Vehicle.fromObject;
  google.maps.routeoptimization.v1.Vehicle.fromObject = (
    object: google.maps.routeoptimization.v1.IVehicle
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (typeof object.extraVisitDurationForVisitType === 'object') {
      object.extraVisitDurationForVisitType = { ...object.extraVisitDurationForVisitType };
      for (const key of Object.keys(object.extraVisitDurationForVisitType)) {
        if (isCanonicalDuration(object.extraVisitDurationForVisitType[key])) {
          object.extraVisitDurationForVisitType[key] = google.protobuf.Duration.fromObject(
            object.extraVisitDurationForVisitType[key]
          );
        }
      }
    }
    return fromObject(object);
  };
}

export function patchBreakRequest(): void {
  const fromObject = google.maps.routeoptimization.v1.BreakRule.BreakRequest.fromObject;
  google.maps.routeoptimization.v1.BreakRule.BreakRequest.fromObject = (
    object: google.maps.routeoptimization.v1.BreakRule.IBreakRequest
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.earliestStartTime)) {
      object.earliestStartTime = google.protobuf.Timestamp.fromObject(object.earliestStartTime);
    }
    if (isCanonicalTimestamp(object.latestStartTime)) {
      object.latestStartTime = google.protobuf.Timestamp.fromObject(object.latestStartTime);
    }
    if (isCanonicalDuration(object.minDuration)) {
      object.minDuration = google.protobuf.Duration.fromObject(object.minDuration);
    }
    return fromObject(object);
  };
}

export function patchBreakRuleFrequencyConstraint(): void {
  const fromObject = google.maps.routeoptimization.v1.BreakRule.FrequencyConstraint.fromObject;
  google.maps.routeoptimization.v1.BreakRule.FrequencyConstraint.fromObject = (
    object: google.maps.routeoptimization.v1.BreakRule.IFrequencyConstraint
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.minBreakDuration)) {
      object.minBreakDuration = google.protobuf.Duration.fromObject(object.minBreakDuration);
    }
    if (isCanonicalDuration(object.maxInterBreakDuration)) {
      object.maxInterBreakDuration = google.protobuf.Duration.fromObject(
        object.maxInterBreakDuration
      );
    }
    return fromObject(object);
  };
}

export function patchVehicleDurationLimit(): void {
  const fromObject = google.maps.routeoptimization.v1.Vehicle.DurationLimit.fromObject;
  google.maps.routeoptimization.v1.Vehicle.DurationLimit.fromObject = (
    object: google.maps.routeoptimization.v1.Vehicle.IDurationLimit
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.maxDuration)) {
      object.maxDuration = google.protobuf.Duration.fromObject(object.maxDuration);
    }
    if (isCanonicalDuration(object.softMaxDuration)) {
      object.softMaxDuration = google.protobuf.Duration.fromObject(object.softMaxDuration);
    }
    if (isCanonicalDuration(object.quadraticSoftMaxDuration)) {
      object.quadraticSoftMaxDuration = google.protobuf.Duration.fromObject(
        object.quadraticSoftMaxDuration
      );
    }
    return fromObject(object);
  };
}

export function patchVisitRequest(): void {
  const fromObject = google.maps.routeoptimization.v1.Shipment.VisitRequest.fromObject;
  google.maps.routeoptimization.v1.Shipment.VisitRequest.fromObject = (
    object: google.maps.routeoptimization.v1.Shipment.IVisitRequest
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.duration)) {
      object.duration = google.protobuf.Duration.fromObject(object.duration);
    }
    return fromObject(object);
  };
}

export function patchAggregatedMetrics(): void {
  const fromObject = google.maps.routeoptimization.v1.AggregatedMetrics.fromObject;
  google.maps.routeoptimization.v1.AggregatedMetrics.fromObject = (
    object: google.maps.routeoptimization.v1.IAggregatedMetrics
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalDuration(object.travelDuration)) {
      object.travelDuration = google.protobuf.Duration.fromObject(object.travelDuration);
    }
    if (isCanonicalDuration(object.waitDuration)) {
      object.waitDuration = google.protobuf.Duration.fromObject(object.waitDuration);
    }
    if (isCanonicalDuration(object.delayDuration)) {
      object.delayDuration = google.protobuf.Duration.fromObject(object.delayDuration);
    }
    if (isCanonicalDuration(object.breakDuration)) {
      object.breakDuration = google.protobuf.Duration.fromObject(object.breakDuration);
    }
    if (isCanonicalDuration(object.visitDuration)) {
      object.visitDuration = google.protobuf.Duration.fromObject(object.visitDuration);
    }
    if (isCanonicalDuration(object.totalDuration)) {
      object.totalDuration = google.protobuf.Duration.fromObject(object.totalDuration);
    }
    return fromObject(object);
  };
}

export function patchMetrics(): void {
  const fromObject = google.maps.routeoptimization.v1.OptimizeToursResponse.Metrics.fromObject;
  google.maps.routeoptimization.v1.OptimizeToursResponse.Metrics.fromObject = (
    object: google.maps.routeoptimization.v1.OptimizeToursResponse.IMetrics
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object = { ...object };
    if (isCanonicalTimestamp(object.earliestVehicleStartTime)) {
      object.earliestVehicleStartTime = google.protobuf.Timestamp.fromObject(
        object.earliestVehicleStartTime
      );
    }
    if (isCanonicalTimestamp(object.latestVehicleEndTime)) {
      object.latestVehicleEndTime = google.protobuf.Timestamp.fromObject(
        object.latestVehicleEndTime
      );
    }

    return fromObject(object);
  };
}

export function patchDurationDistanceMatrixIRow(): void {
  const fromObject =
    google.maps.routeoptimization.v1.ShipmentModel.DurationDistanceMatrix.Row.fromObject;
  google.maps.routeoptimization.v1.ShipmentModel.DurationDistanceMatrix.Row.fromObject = (
    object: google.maps.routeoptimization.v1.ShipmentModel.DurationDistanceMatrix.IRow
  ) => {
    if (object == null) {
      return fromObject(object);
    }
    object.durations.forEach((duration, index) => {
      if (isCanonicalDuration(duration)) {
        object.durations[index] = google.protobuf.Duration.fromObject(duration);
      }
    });
    return fromObject(object);
  };
}
