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

import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import * as Long from 'long';
import { take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { durationSeconds, getAvailableTimeRange, ValidationTimeWindow } from '../../util';
import {
  IDuration,
  ILoad,
  ILoadLimit,
  IShipmentTypeIncompatibility,
  IShipmentTypeRequirement,
  ITimeWindow,
  Shipment,
  ShipmentRoute,
  ShipmentTypeIncompatibilityMode,
  ShipmentTypeRequirementMode,
  ShipmentValidationResult,
  ValidationContext,
  ValidationRequest,
  ValidationResult,
  Vehicle,
  VehicleValidationResult,
  Visit,
  VisitValidationResult,
} from '../models';
import * as fromValidation from '../selectors/validation.selectors';

interface RouteShipment {
  shipmentId: number;
  shipmentType: string;
  shipmentDemands: { [type: string]: number };
  pickupDemands?: { [type: string]: number };
  pickupTime?: number;
  deliveryTime?: number;
  deliveryDemands?: { [type: string]: number };
}

/**
 * Validation service for CFR request and response overrides
 * @remarks
 * Does not attempt thorough validation.  Assumes uploaded scenarios
 * follow the spec, so the focus for validation is on situations that
 * can arise by the application's design such as cross-cutting
 * validation (e.g. global time limit), situations that arrise due to
 * the ability to form a request from a selection/subset, and post-solve
 * overrides to CFR's solution (e.g. changing the visit time,
 * chaning the route a visit is assigned to).
 */
@Injectable({
  providedIn: 'root',
})
export class ValidationService {
  constructor(private store: Store<fromRoot.State>) {}

  /** Gets entity ids of a specific error from an entity's validation result */
  getErrorEntityIds<T>(entityValidationResult: { [id: number]: T }, error: keyof T): number[] {
    const ids: number[] = [];
    Object.entries(entityValidationResult || {}).forEach(([key, value]) => {
      if (value[error]) {
        ids.push(+key);
      }
    });
    return ids;
  }

  /** Validates a request for the current shipments and vehicles */
  validateRequest(): ValidationResult {
    const { shipments, vehicles, ignoreShipmentIds, ignoreVehicleIds } = this.getValidateRequest();
    return {
      shipments: this.validateShipments(shipments, ignoreShipmentIds, ignoreVehicleIds),
      vehicles: this.validateVehicles(vehicles, ignoreVehicleIds),
    };
  }

  /**
   * @remarks
   * The shipmentRouteId must reflect the {@link ShipmentRoute} to validate
   * against; the {@link ShipmentRoute} need not have the target and companion
   * visits being validated in its current list of visits.
   */
  validateVisit(target: Partial<Visit>, companion?: Partial<Visit>): VisitValidationResult {
    if (!target) {
      return null;
    }
    const { shipmentRoutes, shipments, visitRequests } = this.getValidationContext();
    const route = shipmentRoutes[target.shipmentRouteId];
    if (!route) {
      return null;
    }
    const targetRequest = visitRequests[target.id];
    const shipment = shipments[targetRequest.shipmentId];
    if (!shipment) {
      return null;
    }
    const routeShipments = this.getRouteShipments(route);
    const pickup = target.isPickup ? target : companion;
    const pickupStartTime = pickup
      ? pickup.startTime
        ? durationSeconds(pickup.startTime).toNumber()
        : null
      : this.getPickupStartTime(shipment);
    const delivery = target.isPickup ? companion : target;
    const deliveryStartTime = delivery
      ? delivery.startTime
        ? durationSeconds(delivery.startTime).toNumber()
        : null
      : this.getDeliveryStartTime(shipment);
    const errors = {
      ...this.validateVisitRouteImpl(
        target,
        pickupStartTime,
        deliveryStartTime,
        route,
        routeShipments
      ),
    };
    return Object.keys(errors).length ? errors : null;
  }

  private validateVisitRouteImpl(
    visit: Partial<Visit>,
    pickupTime: number,
    deliveryTime: number,
    route: ShipmentRoute,
    routeShipments: RouteShipment[]
  ): VisitValidationResult {
    const {
      globalDuration,
      shipments,
      shipmentTypeIncompatibilities,
      shipmentTypeRequirements,
      vehicles,
      visitRequests,
    } = this.getValidationContext();
    const errors: VisitValidationResult = {};

    const globalTimeWindow = this.getGlobalTimeRange(globalDuration);
    const visitRequest = visitRequests[visit.id];
    const visitTimeWindow = this.getVisitTimeWindow(visit, visitRequest.duration);

    // Is delivery time before pickup time?
    if (pickupTime != null && deliveryTime != null && deliveryTime < pickupTime) {
      errors.deliveryOutOfRange = true;
    }

    // Is visit time outside global time limit?
    if (!globalTimeWindow.containsTime(visitTimeWindow.startTime)) {
      errors.globalOutOfRange = true;
    }

    // Is visit start time outside the visit request's time limits?
    const visitRequestTimeWindows = this.getTimeWindows(visitRequest.timeWindows, globalTimeWindow);
    if (
      visitRequestTimeWindows.length &&
      !visitRequestTimeWindows.some((range) => range.containsTime(visitTimeWindow.startTime))
    ) {
      errors.visitRequestOutOfRange = true;
    }

    // Is visit time outside the vehicle's availability?
    const vehicle = vehicles[route.id];
    const vehicleAvailableTimeWindow = this.getAvailableTimeWindow(
      globalDuration,
      vehicle.startTimeWindows,
      vehicle.endTimeWindows
    );
    if (
      vehicleAvailableTimeWindow != null &&
      !vehicleAvailableTimeWindow.containsTime(visitTimeWindow.startTime)
    ) {
      errors.vehicleOutOfRange = true;
    }

    const shipment = shipments[visitRequest.shipmentId];
    const { shipmentType } = shipment;

    // Are there any shipment type incompatibilities on the route?
    const otherRouteShipments = routeShipments.filter((rpd) => rpd.shipmentId !== shipment.id);
    for (const incompatibility of shipmentTypeIncompatibilities || []) {
      const shipmentTypeIncompatibility = this.validateShipmentTypeIncompatibility(
        pickupTime,
        deliveryTime,
        shipmentType,
        incompatibility,
        otherRouteShipments
      );
      Object.entries(shipmentTypeIncompatibility || {}).forEach(
        ([key, value]) => (errors[key] = value)
      );
    }

    // Are there any shipment type requirement incompatibilities on the route?
    for (const requirement of shipmentTypeRequirements || []) {
      const shipmentTypeRequirement = this.validateShipmentTypeRequirement(
        pickupTime,
        deliveryTime,
        shipmentType,
        requirement,
        otherRouteShipments
      );
      Object.entries(shipmentTypeRequirement || {}).forEach(
        ([key, value]) => (errors[key] = value)
      );
    }

    // Do shipment demands exceed the vehicle's capacity?
    const pickupDemands = this.getLoadDemands(visitRequest.loadDemands);
    const excessDemand = this.validateShipmentDemands(
      shipment,
      pickupTime,
      pickupDemands,
      vehicle,
      otherRouteShipments
    );
    if (excessDemand) {
      errors.shipmentExcessDemand = excessDemand;
    }

    return Object.keys(errors).length ? errors : null;
  }

  private validateShipments(
    shipments: Shipment[],
    ignoreShipmentIds: Set<number>,
    ignoreVehicleIds: Set<number>
  ): { [id: number]: ShipmentValidationResult } {
    const { globalDuration, visitRequests, vehicleIndexById } = this.getValidationContext();
    const errors: { [id: number]: ShipmentValidationResult } = {};
    const ignoreVehicleIndices = new Set(
      Array.from(ignoreVehicleIds.values()).map((id) => vehicleIndexById.get(id))
    );
    const globalRange = this.getGlobalTimeRange(globalDuration);
    for (const shipment of shipments) {
      if (ignoreShipmentIds.has(shipment.id)) {
        continue;
      }
      const shipmentErrors = {
        ...this.validateTimeWindows(
          shipment.pickups
            .map((id) => visitRequests[id]?.timeWindows)
            .filter((tw) => tw?.length)
            .flat(),
          globalRange
        ),
        ...this.validateTimeWindows(
          shipment.deliveries
            .map((id) => visitRequests[id]?.timeWindows)
            .filter((tw) => tw?.length)
            .flat(),
          globalRange
        ),
        ...this.validateShipmentAllowedVehicleIndices(shipment, ignoreVehicleIndices),
      };
      if (Object.keys(shipmentErrors).length) {
        errors[shipment.id] = shipmentErrors;
      }
    }
    return Object.keys(errors).length ? errors : null;
  }

  private validateVehicles(
    vehicles: Vehicle[],
    ignoreVehicleIds: Set<number>
  ): { [id: number]: VehicleValidationResult } {
    const { globalDuration } = this.getValidationContext();
    const errors: { [id: number]: VehicleValidationResult } = {};
    const globalRange = this.getGlobalTimeRange(globalDuration);
    for (const vehicle of vehicles) {
      if (ignoreVehicleIds.has(vehicle.id)) {
        continue;
      }
      const vehicleErrors = {
        ...this.validateTimeWindows(vehicle.startTimeWindows, globalRange),
        ...this.validateTimeWindows(vehicle.endTimeWindows, globalRange),
      };
      if (Object.keys(vehicleErrors).length) {
        errors[vehicle.id] = vehicleErrors;
      }
    }
    return Object.keys(errors).length ? errors : null;
  }

  private findRequiredRouteShipment(
    time: number,
    otherRouteShipments: RouteShipment[]
  ): RouteShipment {
    if (time == null) {
      return;
    }
    // Attempt to find a required shipment present at the dependent time
    return otherRouteShipments.find((osv) => {
      return (
        (osv.pickupTime == null || osv.pickupTime < time) &&
        (osv.deliveryTime == null || osv.deliveryTime > time)
      );
    });
  }

  private getValidateRequest(): ValidationRequest {
    let validateRequest: ValidationRequest = null;
    this.store
      .pipe(select(fromValidation.selectValidateRequest), take(1))
      .subscribe((value) => (validateRequest = value));
    return validateRequest;
  }

  private getValidationContext(): ValidationContext {
    let validationContext: ValidationContext = null;
    this.store
      .pipe(select(fromValidation.selectValidationContext), take(1))
      .subscribe((value) => (validationContext = value));
    return validationContext;
  }

  private getGlobalTimeRange(globalDuration: [Long, Long]): ValidationTimeWindow {
    return new ValidationTimeWindow({
      startTime: globalDuration?.[0]?.toNumber() || 0,
      endTime: globalDuration?.[1]?.toNumber() || 0,
    });
  }

  private getAvailableTimeWindow(
    globalDuration: [Long, Long],
    startTimeWindows: ITimeWindow[],
    endTimeWindows: ITimeWindow[]
  ): ValidationTimeWindow {
    const availableTimeRange = getAvailableTimeRange(
      globalDuration,
      startTimeWindows,
      endTimeWindows
    );
    if (availableTimeRange) {
      return new ValidationTimeWindow({
        startTime: availableTimeRange.start.toNumber(),
        endTime: availableTimeRange.end.toNumber(),
      });
    }
  }

  private getLoadDemands(loadDemands: { [k: string]: ILoad }): { [k: string]: number } {
    const lookup: { [type: string]: number } = {};
    Object.keys(loadDemands || {}).forEach((demand) => {
      const entry = loadDemands[demand];
      lookup[demand] = entry.amount ? Long.fromValue(entry.amount).toNumber() : 0;
    });
    return lookup;
  }

  private getLoadLimits(loadLimits: { [k: string]: ILoadLimit }): { [k: string]: number } {
    const lookup: { [type: string]: number } = {};
    Object.keys(loadLimits || {}).forEach((limit) => {
      const entry = loadLimits[limit];
      lookup[limit] = entry.maxLoad ? Long.fromValue(entry.maxLoad).toNumber() : 0;
    });
    return lookup;
  }

  private getDeliveryStartTime(shipment: Shipment): number {
    const { visits } = this.getValidationContext();
    const deliveryIds = shipment?.deliveries || [];
    for (const deliveryId of deliveryIds) {
      if (visits[deliveryId]) {
        return durationSeconds(visits[deliveryId].startTime, null)?.toNumber();
      }
    }
  }

  private getPickupStartTime(shipment: Shipment): number {
    const { visits } = this.getValidationContext();
    const pickupIds = shipment?.pickups || [];
    for (const pickupId of pickupIds) {
      if (visits[pickupId]) {
        return durationSeconds(visits[pickupId].startTime, null)?.toNumber();
      }
    }
  }

  /**
   * Gets route-shipment representations for a route
   * @param route ShipmentRoute source
   */
  private getRouteShipments(route: ShipmentRoute): RouteShipment[] {
    const { shipments, visitRequests, visits } = this.getValidationContext();
    const routeShipments = new Map<number, RouteShipment>();
    route.visits.forEach((id) => {
      const visitRequest = visitRequests[id];
      const shipment = shipments[visitRequest.shipmentId];
      const visit = visits[id];
      let routeShipment = routeShipments.get(shipment.id);
      if (!routeShipment) {
        routeShipment = {
          shipmentId: shipment.id,
          shipmentType: shipment.shipmentType,
          shipmentDemands: this.getLoadDemands(shipment.loadDemands),
        };
        routeShipments.set(shipment.id, routeShipment);
      }
      if (visit.isPickup) {
        // Shipment considered picked up at start of pickup visit
        routeShipment.pickupTime = visit.startTime
          ? durationSeconds(visit.startTime).toNumber()
          : null;
        routeShipment.pickupDemands = this.getLoadDemands(visitRequest.loadDemands);
      } else {
        // Shipment considered delivered at end of delivery visit
        routeShipment.deliveryTime = this.getVisitTimeWindow(visit, visitRequest.duration).endTime;
        routeShipment.deliveryDemands = this.getLoadDemands(visitRequest.loadDemands);
      }
    });
    return Array.from(routeShipments.values());
  }

  private getTimeWindows(
    timeWindows: ITimeWindow[],
    globalRange: ValidationTimeWindow
  ): ValidationTimeWindow[] {
    return timeWindows?.length > 0
      ? timeWindows.map((tw) => this.getHardTimeWindow(tw, globalRange))
      : [];
  }

  private getVisitTimeWindow(visit: Partial<Visit>, duration: IDuration): ValidationTimeWindow {
    const startTime = visit.startTime ? durationSeconds(visit.startTime).toNumber() : null;
    const endTime = startTime != null ? startTime + durationSeconds(duration).toNumber() : null;
    return new ValidationTimeWindow({ startTime, endTime });
  }

  private getPickupDeliveryTimeWindow(
    pickupTime: number,
    deliveryTime: number
  ): ValidationTimeWindow {
    return new ValidationTimeWindow({
      startTime: pickupTime ?? Number.MIN_SAFE_INTEGER,
      endTime: deliveryTime ?? Number.MAX_SAFE_INTEGER,
    });
  }

  private getHardTimeWindow(
    timeWindow: ITimeWindow,
    globalRange: ValidationTimeWindow
  ): ValidationTimeWindow {
    const { startTime: globalStartTime, endTime: globalEndTime } = globalRange || {};
    return new ValidationTimeWindow({
      startTime: timeWindow?.startTime
        ? durationSeconds(timeWindow.startTime).toNumber()
        : globalStartTime,
      endTime: timeWindow?.endTime ? durationSeconds(timeWindow.endTime).toNumber() : globalEndTime,
    });
  }

  private validateShipmentDemands(
    shipment: Shipment,
    pickupTime: number,
    pickupDemands: { [type: string]: number },
    vehicle: Vehicle,
    otherRouteShipments: RouteShipment[]
  ): { [type: string]: number } {
    const capacities = this.getLoadLimits(vehicle.loadLimits);
    const shipmentDemands = this.getLoadDemands(shipment.loadDemands);
    // Does this shipment + pickup have demands aligned to this vehicle?
    if (
      !Object.keys(shipmentDemands).some((type) => type in capacities) &&
      !Object.keys(pickupDemands).some((type) => type in capacities)
    ) {
      return null;
    }
    // Adjust the capacities for other shipment + pickup/delivery demands up to this pickup time
    for (const osv of otherRouteShipments) {
      const adjustForPickup = osv.pickupTime != null && osv.pickupTime < pickupTime;
      const adjustForDelivery = osv.deliveryTime != null && osv.deliveryTime < pickupTime;
      if (adjustForPickup) {
        Object.entries(osv.shipmentDemands)
          .concat(Object.entries(osv.pickupDemands))
          .filter(([type]) => type in capacities)
          .forEach(([type, value]) => (capacities[type] -= value));
      }
      if (adjustForDelivery) {
        Object.entries(osv.shipmentDemands)
          .concat(Object.entries(osv.deliveryDemands))
          .filter(([type]) => type in capacities)
          .forEach(([type, value]) => (capacities[type] += value));
      }
    }
    // Determine what demands exceed capacity and by how much
    const errors: { [type: string]: number } = {};
    this.addDemands(
      Object.entries(shipmentDemands)
        .concat(Object.entries(pickupDemands))
        .filter(([type]) => type in capacities)
    ).forEach(([type, value]) => {
      const capacity = capacities[type];
      if (capacity - value < 0) {
        errors[type] = capacity > 0 ? -(capacity - value) : value;
      }
    });
    return Object.keys(errors).length ? errors : null;
  }

  private addDemands(...demands: [string, number][][]): [string, number][] {
    const total: { [type: string]: number } = {};
    for (const demand of demands) {
      for (const [type, value] of demand) {
        const current = total[type] ?? 0;
        total[type] = current + value;
      }
    }
    return Array.from(Object.entries(total));
  }

  private validateShipmentTypeIncompatibility(
    pickupTime: number,
    deliveryTime: number,
    shipmentType: string,
    incompatibility: IShipmentTypeIncompatibility,
    otherRouteShipments: RouteShipment[]
  ): {
    shipmentTypeCannotBePerformedBySameVehicle?: {
      shipmentType: string;
      otherShipmentTypes: string[];
    };
    shipmentTypeCannotBeInSameVehicleSimultaneously?: {
      shipmentType: string;
      otherShipmentTypes: string[];
    };
  } {
    const incompatibleTypes = new Set(incompatibility.types || []);
    if (!shipmentType || !incompatibleTypes.has(shipmentType)) {
      return null;
    }
    const incompatibleShipmentVisits = otherRouteShipments.filter(
      ({ shipmentType: otherShipmentType }) =>
        otherShipmentType !== shipmentType && incompatibleTypes.has(otherShipmentType)
    );
    if (!incompatibleShipmentVisits.length) {
      return null;
    }
    const mode = incompatibility.incompatibilityMode;
    if (mode == null || mode === ShipmentTypeIncompatibilityMode.NOT_PERFORMED_BY_SAME_VEHICLE) {
      return {
        shipmentTypeCannotBePerformedBySameVehicle: {
          shipmentType,
          otherShipmentTypes: Array.from(incompatibleTypes.values()).filter(
            (type) => type !== shipmentType
          ),
        },
      };
    }
    if (mode === ShipmentTypeIncompatibilityMode.NOT_IN_SAME_VEHICLE_SIMULTANEOUSLY) {
      // The two shipments can share the same vehicle iff the former shipment before the latter is picked up
      const pickupDeliveryTimeWindow = this.getPickupDeliveryTimeWindow(pickupTime, deliveryTime);
      const otherShipmentTypes = incompatibleShipmentVisits
        .map((other) => {
          const otherPickupDeliveryTimeWindow = this.getPickupDeliveryTimeWindow(
            other.pickupTime,
            other.deliveryTime
          );
          if (pickupDeliveryTimeWindow.overlaps(otherPickupDeliveryTimeWindow)) {
            return other.shipmentType;
          }
        })
        .filter(Boolean);
      if (otherShipmentTypes.length) {
        return {
          shipmentTypeCannotBeInSameVehicleSimultaneously: {
            shipmentType,
            otherShipmentTypes,
          },
        };
      }
    }
    return null;
  }

  private validateShipmentTypeRequirement(
    pickupTime: number,
    deliveryTime: number,
    shipmentType: string,
    requirement: IShipmentTypeRequirement,
    otherShipmentVisits: RouteShipment[]
  ): {
    shipmentTypeMustBePerformedBySameVehicle?: {
      shipmentType: string;
      otherShipmentTypes: string[];
    };
    shipmentTypeMustBePerformedBySameVehicleAtPickupTime?: {
      shipmentType: string;
      otherShipmentTypes: string[];
    };
    shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime?: {
      shipmentType: string;
      otherShipmentTypes: string[];
    };
  } {
    if (!requirement.dependentShipmentTypes?.includes(shipmentType)) {
      return null;
    }
    if (!requirement.requiredShipmentTypeAlternatives?.length) {
      return null;
    }
    const requiredShipmentTypeAlternatives = new Set(requirement.requiredShipmentTypeAlternatives);
    const mode = requirement.requirementMode;
    if (mode == null || mode === ShipmentTypeRequirementMode.PERFORMED_BY_SAME_VEHICLE) {
      if (
        otherShipmentVisits.find((osv) => requiredShipmentTypeAlternatives.has(osv.shipmentType))
      ) {
        return null;
      }
      return {
        shipmentTypeMustBePerformedBySameVehicle: {
          shipmentType,
          otherShipmentTypes: Array.from(requiredShipmentTypeAlternatives.values()),
        },
      };
    }
    if (mode === ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_PICKUP_TIME) {
      const pickupRequirement = this.findRequiredRouteShipment(pickupTime, otherShipmentVisits);
      if (pickupRequirement) {
        return null;
      }
      return {
        shipmentTypeMustBePerformedBySameVehicleAtPickupTime: {
          shipmentType,
          otherShipmentTypes: requirement.requiredShipmentTypeAlternatives,
        },
      };
    }
    if (mode === ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_DELIVERY_TIME) {
      const deliveryRequirement = this.findRequiredRouteShipment(deliveryTime, otherShipmentVisits);
      if (deliveryRequirement) {
        return null;
      }
      return {
        shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime: {
          shipmentType,
          otherShipmentTypes: requirement.requiredShipmentTypeAlternatives,
        },
      };
    }
    return null;
  }

  private validateShipmentAllowedVehicleIndices(
    shipment: Shipment,
    ignoreVehicleIndices: Set<number>
  ): { allowedVehicleIndices: boolean } | undefined {
    if (shipment.allowedVehicleIndices?.length) {
      // Filter those ignored
      const allowedVehicleIndices = shipment.allowedVehicleIndices.filter(
        (index) => !ignoreVehicleIndices.has(index)
      );
      // Are all allowed vehicles ignored?
      if (!allowedVehicleIndices.length) {
        return { allowedVehicleIndices: true };
      }
    }
    return null;
  }

  /**
   * @remarks
   * Validates only aspects of time windows not enforced by the forms e.g. global time limit.
   */
  private validateTimeWindows(
    timeWindows: ITimeWindow[],
    globalRange: ValidationTimeWindow
  ): { timeWindowOutOfRange: boolean } | undefined {
    const validationTimeWindows = this.getTimeWindows(timeWindows, globalRange);
    if (validationTimeWindows.some((tw) => !globalRange.contains(tw))) {
      return { timeWindowOutOfRange: true };
    }
    return null;
  }
}
