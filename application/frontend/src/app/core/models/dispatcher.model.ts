/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { google } from '@google-cloud/optimization/build/protos/protos';
import dispatcher = google.cloud.optimization.v1;

import IncompatibilityMode = dispatcher.ShipmentTypeIncompatibility.IncompatibilityMode;
import RequirementMode = dispatcher.ShipmentTypeRequirement.RequirementMode;
import OptimizeToursRequest = dispatcher.OptimizeToursRequest;
import OptimizeToursResponse = dispatcher.OptimizeToursResponse;
import RelaxationLevel = dispatcher.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.Level;
import SearchMode = dispatcher.OptimizeToursRequest.SearchMode;
import ShipmentModel = dispatcher.ShipmentModel;
import ShipmentTypeIncompatibilityMode = dispatcher.ShipmentTypeIncompatibility.IncompatibilityMode;
import ShipmentTypeRequirementMode = dispatcher.ShipmentTypeRequirement.RequirementMode;
import SkippedShipmentReasonCode = dispatcher.SkippedShipment.Reason.Code;
import SolvingMode = dispatcher.OptimizeToursRequest.SolvingMode;
import TimeWindow = dispatcher.TimeWindow;
import TravelMode = dispatcher.Vehicle.TravelMode;
import UnloadingPolicy = dispatcher.Vehicle.UnloadingPolicy;
export {
  IncompatibilityMode,
  RequirementMode,
  OptimizeToursRequest,
  OptimizeToursResponse,
  RelaxationLevel,
  SearchMode,
  ShipmentModel,
  ShipmentTypeIncompatibilityMode,
  ShipmentTypeRequirementMode,
  SkippedShipmentReasonCode,
  SolvingMode,
  TimeWindow,
  TravelMode,
  UnloadingPolicy,
};

export type IBreak = dispatcher.ShipmentRoute.IBreak;
export type IBreakRule = dispatcher.IBreakRule;
export type IBreakRequest = dispatcher.BreakRule.IBreakRequest;
export type ICapacityQuantity = dispatcher.ICapacityQuantity;
export type IConstraintRelaxation = dispatcher.InjectedSolutionConstraint.IConstraintRelaxation;
export type IDistanceLimit = dispatcher.IDistanceLimit;
export type IDuration = google.protobuf.IDuration;
export type IDurationLimit = dispatcher.Vehicle.IDurationLimit;
export type IEncodedPolyline = dispatcher.ShipmentRoute.IEncodedPolyline;
export type IFrequencyConstraint = dispatcher.BreakRule.IFrequencyConstraint;
export type IInjectedSolution = dispatcher.IInjectedSolutionConstraint;
export type ILatLng = google.type.ILatLng;
export type ILoad = dispatcher.Shipment.ILoad;
export type ILoadLimit = dispatcher.Vehicle.ILoadLimit;
export type IOptimizeToursRequest = dispatcher.IOptimizeToursRequest;
export type IOptimizeToursResponse = dispatcher.IOptimizeToursResponse;
export type IPrecedenceRule = dispatcher.ShipmentModel.IPrecedenceRule;
export type IRelaxation = dispatcher.InjectedSolutionConstraint.ConstraintRelaxation.IRelaxation;
export type IShipment = dispatcher.IShipment;
export type IShipmentModel = dispatcher.IShipmentModel;
export type IShipmentRoute = dispatcher.IShipmentRoute;
export type IShipmentTypeIncompatibility = dispatcher.IShipmentTypeIncompatibility;
export type IShipmentTypeRequirement = dispatcher.IShipmentTypeRequirement;
export type ISkippedShipmentReason = dispatcher.SkippedShipment.IReason;
export type ITimestamp = google.protobuf.ITimestamp;
export type ITimeWindow = dispatcher.ITimeWindow;
export type ITransitionAttributes = dispatcher.ITransitionAttributes;
export type ITravelStep = dispatcher.ShipmentRoute.ITravelStep;
export type IVehicle = dispatcher.IVehicle;
export type IVehicleOperator = dispatcher.IVehicleOperator;
export type IVisit = dispatcher.ShipmentRoute.IVisit;
export type IVisitRequest = dispatcher.Shipment.IVisitRequest;
export type IWaypoint = dispatcher.IWaypoint;

// Typing copied from IOptimizeToursRequest
// Required since the scenario interface supports numbers and string forms of the enumerator
export type ShipmentModelIncompatibilityMode =
  | dispatcher.ShipmentTypeIncompatibility.IncompatibilityMode
  | keyof typeof dispatcher.ShipmentTypeIncompatibility.IncompatibilityMode
  | null;
export type ShipmentModelRequirementMode =
  | dispatcher.ShipmentTypeRequirement.RequirementMode
  | keyof typeof dispatcher.ShipmentTypeRequirement.RequirementMode
  | null;
export type ScenarioSearchMode =
  | dispatcher.OptimizeToursRequest.SearchMode
  | keyof typeof dispatcher.OptimizeToursRequest.SearchMode
  | null;
export type ScenarioSolvingMode =
  | dispatcher.OptimizeToursRequest.SolvingMode
  | keyof typeof dispatcher.OptimizeToursRequest.SolvingMode
  | null;
