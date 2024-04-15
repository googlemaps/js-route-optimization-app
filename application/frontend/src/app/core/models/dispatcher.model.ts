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

import { google } from '@google-cloud/optimization/build/protos/protos';
import dispatcher = google.cloud.optimization.v1;

import IncompatibilityMode = dispatcher.ShipmentTypeIncompatibility.IncompatibilityMode;
import RequirementMode = dispatcher.ShipmentTypeRequirement.RequirementMode;
import OptimizeToursRequest = google.cloud.optimization.v1.OptimizeToursRequest;
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
export type IBreakRule = google.cloud.optimization.v1.IBreakRule;
export type IBreakRequest = google.cloud.optimization.v1.BreakRule.IBreakRequest;
export type ICapacityQuantity = dispatcher.ICapacityQuantity;
export type IConstraintRelaxation = dispatcher.InjectedSolutionConstraint.IConstraintRelaxation;
export type IDistanceLimit = dispatcher.IDistanceLimit;
export type IDuration = google.protobuf.IDuration;
export type IDurationLimit = dispatcher.Vehicle.IDurationLimit;
export type IEncodedPolyline = dispatcher.ShipmentRoute.IEncodedPolyline;
export type IFrequencyConstraint = google.cloud.optimization.v1.BreakRule.IFrequencyConstraint;
export type IInjectedSolution = dispatcher.IInjectedSolutionConstraint;
export type ILatLng = google.type.ILatLng;
export type ILoad = dispatcher.Shipment.ILoad;
export type ILoadLimit = google.cloud.optimization.v1.Vehicle.ILoadLimit;
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
export type ITransition = dispatcher.ShipmentRoute.ITransition;
export type ITransitionAttributes = dispatcher.ITransitionAttributes;
export type IVehicle = dispatcher.IVehicle;
export type IVehicleOperator = dispatcher.IVehicleOperator;
export type IVisit = dispatcher.ShipmentRoute.IVisit;
export type IVisitRequest = dispatcher.Shipment.IVisitRequest;
export type IWaypoint = dispatcher.IWaypoint;

// Typing copied from IOptimizeToursRequest
// Required since the scenario interface supports numbers and string forms of the enumerator
export type ShipmentModelIncompatibilityMode =
  | google.cloud.optimization.v1.ShipmentTypeIncompatibility.IncompatibilityMode
  | keyof typeof google.cloud.optimization.v1.ShipmentTypeIncompatibility.IncompatibilityMode
  | null;
export type ShipmentModelRequirementMode =
  | google.cloud.optimization.v1.ShipmentTypeRequirement.RequirementMode
  | keyof typeof google.cloud.optimization.v1.ShipmentTypeRequirement.RequirementMode
  | null;
export type ScenarioSearchMode =
  | google.cloud.optimization.v1.OptimizeToursRequest.SearchMode
  | keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SearchMode
  | null;
export type ScenarioSolvingMode =
  | google.cloud.optimization.v1.OptimizeToursRequest.SolvingMode
  | keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SolvingMode
  | null;
