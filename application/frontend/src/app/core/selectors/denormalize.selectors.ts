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
import { createSelector } from '@ngrx/store';
import * as Long from 'long';
import {
  IConstraintRelaxation,
  IOptimizeToursRequest,
  IOptimizeToursResponse,
  IShipment,
  IShipmentRoute,
  IVehicle,
  Scenario,
  ShipmentRoute,
  Solution,
} from '../models';
import { Shipment } from '../models/shipment.model';
import { Vehicle } from '../models/vehicle.model';
import { VisitRequest } from '../models/visit-request.model';
import { Visit } from '../models/visit.model';
import { State as RequestSettingsState } from '../reducers/request-settings.reducer';
import * as fromDispatcher from './dispatcher.selectors';
import PreSolveShipmentSelectors from './pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from './pre-solve-vehicle.selectors';
import * as fromPreSolve from './pre-solve.selectors';
import RequestSettingsSelectors, * as fromRequestSettings from './request-settings.selectors';
import * as fromShipment from './shipment.selectors';
import * as fromShipmentModel from './shipment-model.selectors';
import { State as ShipmentModelState } from '../reducers/shipment-model.reducer';
import ShipmentRouteSelectors, * as fromShipmentRoute from './shipment-route.selectors';
import * as fromVehicle from './vehicle.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import * as fromVisit from './visit.selectors';
import { durationToRequestString } from 'src/app/util';

const denormalizeVisitRequests = (requests: number[], entities: Dictionary<VisitRequest>) => {
  return requests.map((requestId) => {
    const {
      id: _id,
      shipmentId: _shipmentId,
      pickup: _pickup,
      ...visitRequest
    } = entities[requestId] || {};
    return visitRequest;
  });
};

const denormalizeShipments = (
  shipments: Shipment[],
  visitRequestEntities: Dictionary<VisitRequest>
) => {
  return shipments.map(({ id: _id, ...shipment }) => {
    const denormalizedShipment: IShipment = shipment as any;
    denormalizedShipment.pickups = denormalizeVisitRequests(shipment.pickups, visitRequestEntities);
    denormalizedShipment.deliveries = denormalizeVisitRequests(
      shipment.deliveries,
      visitRequestEntities
    );
    return denormalizedShipment;
  });
};

const denormalizeVehicles = (vehicles: Vehicle[]) =>
  vehicles.map(({ id: _id, ...vehicle }) => vehicle);

const denormalizeVisit = (entity: Visit) => {
  const { id: _id, shipmentRouteId: _shipmentRouteId, ...visit } = entity || {};
  return visit;
};

const selectIgnoredShipmentIds = createSelector(
  fromPreSolve.selectActive,
  PreSolveShipmentSelectors.selectDeselectedIds,
  PreSolveShipmentSelectors.selectUnrequestedIds,
  (preSolve, deselectedIds, unrequestedIds) => (preSolve ? deselectedIds : unrequestedIds)
);

const selectIgnoredVehicleIds = createSelector(
  fromPreSolve.selectActive,
  PreSolveVehicleSelectors.selectDeselectedIds,
  PreSolveVehicleSelectors.selectUnrequestedIds,
  (preSolve, deselectedIds, unrequestedIds) => (preSolve ? deselectedIds : unrequestedIds)
);

const selectRequestShipments = createSelector(
  fromShipment.selectAll,
  PreSolveShipmentSelectors.selectSelectedLookup,
  (shipments, selected): Shipment[] =>
    shipments.map((shipment) => ({ ...shipment, ignore: !selected[shipment.id] || null }))
);

const selectRequestVehicles = createSelector(
  fromVehicle.selectAll,
  PreSolveVehicleSelectors.selectSelectedLookup,
  (vehicles, selected): Vehicle[] =>
    vehicles.map((vehicle) => {
      const ignore = !selected[vehicle.id] || null;
      return { ...vehicle, usedIfRouteIsEmpty: vehicle.usedIfRouteIsEmpty, ignore };
    })
);

const selectRequestedShipments = createSelector(
  fromShipment.selectAll,
  PreSolveShipmentSelectors.selectRequestedLookup,
  (shipments, requested): Shipment[] =>
    shipments.map((shipment) => ({ ...shipment, ignore: !requested.has(shipment.id) || null }))
);

const selectRequestedVehicles = createSelector(
  fromVehicle.selectAll,
  PreSolveVehicleSelectors.selectRequestedLookup,
  (vehicles, requested): Vehicle[] =>
    vehicles.map((vehicle) => {
      const ignore = !requested.has(vehicle.id) || null;
      return { ...vehicle, usedIfRouteIsEmpty: vehicle.usedIfRouteIsEmpty, ignore };
    })
);

const getHasStaleSolutionEntities = <T extends { changeTime?: number }>(
  solution: Solution,
  batchTime: number,
  entities: Dictionary<T>,
  seleceted: number[],
  requestedLookup: Set<number>,
  selectedLookup: { [id: number]: boolean }
) => {
  if (solution) {
    for (const id of requestedLookup) {
      if (!selectedLookup[id]) {
        return true; // Removed
      } else if (entities[id] && entities[id].changeTime > batchTime) {
        return true; // Changed
      }
    }
    for (const id of seleceted) {
      if (!requestedLookup.has(id)) {
        return true; // Added
      }
    }
  }
  return false;
};

const selectHasStaleSolutionShipments = createSelector(
  fromDispatcher.selectSolution,
  fromDispatcher.selectBatchTime,
  fromShipment.selectEntities,
  PreSolveShipmentSelectors.selectSelected,
  PreSolveShipmentSelectors.selectRequestedLookup,
  PreSolveShipmentSelectors.selectSelectedLookup,
  getHasStaleSolutionEntities
);

const selectHasStaleSolutionVehicles = createSelector(
  fromDispatcher.selectSolution,
  fromDispatcher.selectBatchTime,
  fromVehicle.selectEntities,
  PreSolveVehicleSelectors.selectSelected,
  PreSolveVehicleSelectors.selectRequestedLookup,
  PreSolveVehicleSelectors.selectSelectedLookup,
  getHasStaleSolutionEntities
);

/**
 * @remarks
 * The solution is stale if it scenario has been modified; shipments or
 * vehicles are changed through select, deselect, add, edit, or remove.
 *
 * Request settings (global start/end, max active vehicles) aren't currently
 * taken into account.
 */
const selectIsSolutionStale = createSelector(
  selectHasStaleSolutionShipments,
  selectHasStaleSolutionVehicles,
  (hasStaleSolutionShipments, hasStaleSolutionVehicles) =>
    hasStaleSolutionShipments || hasStaleSolutionVehicles
);

const selectIsSolutionIllegal = createSelector(
  fromShipmentRoute.selectAll,
  fromVisit.selectAll,
  fromDispatcher.selectTimeOfResponse,
  (shipmentRoutes, visits, timeOfResponse) => {
    return (
      shipmentRoutes.some((shipmentRoute) => shipmentRoute.changeTime > timeOfResponse) ||
      visits.some((visit) => visit.changeTime > timeOfResponse)
    );
  }
);

const getIncompatibleSolutionEntities = <T extends { changeTime?: number }>(
  batchTime: number,
  entities: Dictionary<T>,
  requestedLookup: Set<number>,
  selectedLookup: { [id: number]: boolean }
) => {
  const incompatible = new Set<number>();
  for (const id of requestedLookup) {
    if (!selectedLookup[id]) {
      incompatible.add(id); // Removed
    } else if (entities[id] && entities[id].changeTime > batchTime) {
      incompatible.add(id); // Changed
    }
  }
  return incompatible;
};

const selectIncompatibleSolutionShipmentIds = createSelector(
  fromDispatcher.selectBatchTime,
  fromShipment.selectEntities,
  PreSolveShipmentSelectors.selectRequestedLookup,
  PreSolveShipmentSelectors.selectSelectedLookup,
  getIncompatibleSolutionEntities
);

const selectIncompatibleSolutionVehicleIds = createSelector(
  fromDispatcher.selectBatchTime,
  fromVehicle.selectEntities,
  PreSolveVehicleSelectors.selectRequestedLookup,
  PreSolveVehicleSelectors.selectSelectedLookup,
  getIncompatibleSolutionEntities
);

const selectIncompatibleSolutionVisitIdsByShipmentRouteId = createSelector(
  selectIncompatibleSolutionShipmentIds,
  fromShipment.selectEntities,
  fromVisit.selectEntities,
  (incompatibleShipments, shipments, visits) => {
    const incompatibleVisitIdsByShipmentRouteId = new Map<number, Set<number>>();
    incompatibleShipments.forEach((shipmentId) => {
      const shipment = shipments[shipmentId];
      shipment.pickups.concat(shipment.deliveries).forEach((id) => {
        const visit = visits[id];
        if (!visit) {
          return;
        }
        const incompatibleVisitIds = incompatibleVisitIdsByShipmentRouteId.get(
          visit.shipmentRouteId
        );
        if (incompatibleVisitIds) {
          incompatibleVisitIds.add(visit.id);
        } else {
          incompatibleVisitIdsByShipmentRouteId.set(visit.shipmentRouteId, new Set([visit.id]));
        }
      });
    });
    return incompatibleVisitIdsByShipmentRouteId;
  }
);

const selectInjectedRoutes = createSelector(
  fromShipmentRoute.selectAll,
  selectIncompatibleSolutionVisitIdsByShipmentRouteId,
  selectIncompatibleSolutionVehicleIds,
  (
    shipmentRoutes,
    incompatibleVisitIdsByShipmentRouteId,
    incompatibleVehicleIds
  ): ShipmentRoute[] => {
    const injectedRoutes: ShipmentRoute[] = [];
    shipmentRoutes.forEach((shipmentRoute) => {
      // If a vehicle is unused, remove the route completely to ensure it's unconstrained
      if (!shipmentRoute.visits.length) {
        return;
      }
      // If a vehicle is incompatible, remove the route completely
      if (incompatibleVehicleIds.has(shipmentRoute.id)) {
        return;
      }
      // If a shipment is incompatible, remove its visits and all transitions from the route
      const incompatibleVisitIds = incompatibleVisitIdsByShipmentRouteId.get(shipmentRoute.id);
      if (incompatibleVisitIds) {
        injectedRoutes.push({
          ...shipmentRoute,
          visits: shipmentRoute.visits.filter((id) => !incompatibleVisitIds.has(id)),
          transitions: null,
        });
        return;
      }
      injectedRoutes.push(shipmentRoute);
    });
    return injectedRoutes;
  }
);

const getDenormalizedRoutes = (
  shipmentRoutes: ShipmentRoute[],
  visitEntities: Dictionary<Visit>,
  shipmentRouteChanges?: ShipmentRoute[],
  visitChanges?: Visit[]
): IShipmentRoute[] => {
  const shipmentRouteChangeById = new Map((shipmentRouteChanges || []).map((r) => [r.id, r]));
  const visitChangeById = new Map((visitChanges || []).map((r) => [r.id, r]));
  return shipmentRoutes
    .map((shipmentRoute) => {
      const shipmentRouteChange = shipmentRouteChangeById.get(shipmentRoute.id);
      return shipmentRouteChange ? { ...shipmentRoute, ...shipmentRouteChange } : shipmentRoute;
    })
    .map(({ id: _id, ...shipmentRoute }) => {
      const denormalizedShipmentRoute: IShipmentRoute = shipmentRoute as any;
      denormalizedShipmentRoute.visits = shipmentRoute.visits?.map((visitId) => {
        const visit = visitEntities[visitId];
        const visitChange = visitChangeById.get(visit.id);
        return denormalizeVisit(visitChange ? { ...visit, ...visitChange } : visit);
      });
      return denormalizedShipmentRoute;
    });
};

const selectDenormalizedRoutes = (shipmentRouteChanges?: ShipmentRoute[], visitChanges?: Visit[]) =>
  createSelector(
    fromShipmentRoute.selectAll,
    fromVisit.selectEntities,
    (shipmentRoutes, visitEntities) => {
      return getDenormalizedRoutes(
        shipmentRoutes,
        visitEntities,
        shipmentRouteChanges,
        visitChanges
      );
    }
  );

const selectDenormalizedInjectedRoutes = (
  shipmentRouteChanges?: ShipmentRoute[],
  visitChanges?: Visit[]
) =>
  createSelector(
    selectInjectedRoutes,
    fromVisit.selectEntities,
    (shipmentRoutes, visitEntities) => {
      return getDenormalizedRoutes(
        shipmentRoutes,
        visitEntities,
        shipmentRouteChanges,
        visitChanges
      );
    }
  );

const selectDenormalizedShipments = createSelector(
  fromShipment.selectAll,
  fromVisitRequest.selectEntities,
  denormalizeShipments
);

const selectDenormalizedRequestShipments = createSelector(
  selectRequestShipments,
  fromVisitRequest.selectEntities,
  denormalizeShipments
);

const selectDenormalizedVehicles = createSelector(fromVehicle.selectAll, denormalizeVehicles);

const selectDenormalizedRequestVehicles = createSelector(
  selectRequestVehicles,
  denormalizeVehicles
);

const selectDenormalizedRequestedShipments = createSelector(
  selectRequestedShipments,
  fromVisitRequest.selectEntities,
  denormalizeShipments
);

const selectDenormalizedRequestedVehicles = createSelector(
  selectRequestedVehicles,
  denormalizeVehicles
);

const selectDenormalizedSolution = (
  shipmentRouteChanges?: ShipmentRoute[],
  visitChanges?: Visit[]
) =>
  createSelector(
    fromDispatcher.selectSolution,
    selectDenormalizedRoutes(shipmentRouteChanges, visitChanges),
    (solution, routes) => ({ ...solution, routes })
  );

const selectDenormalizedInjectedSolution = (
  shipmentRouteChanges?: ShipmentRoute[],
  visitChanges?: Visit[]
) =>
  createSelector(
    fromDispatcher.selectSolution,
    selectDenormalizedInjectedRoutes(shipmentRouteChanges, visitChanges),
    (solution, routes): IOptimizeToursResponse =>
      solution
        ? {
            ...solution,
            routes,
            skippedShipments: null,
          }
        : null
  );

const selectDenormalizedConstraintRelaxations = createSelector(
  RequestSettingsSelectors.selectConstraintRelaxations,
  fromVehicle.selectVehicleIndexById,
  (constraintRelaxations, vehicleIndexById) => {
    return constraintRelaxations?.map((constraintRelaxation) => ({
      ...constraintRelaxation,
      vehicleIndices: constraintRelaxation.vehicleIndices?.map((id) => vehicleIndexById.get(id)),
    }));
  }
);

const getRequestScenario = (
  scenario: Scenario,
  shipments: IShipment[],
  vehicles: IVehicle[],
  requestSettings: RequestSettingsState,
  shipmentModel?: ShipmentModelState,
  injectedSolution?: IOptimizeToursResponse,
  injectedConstraintRelaxations?: IConstraintRelaxation[]
): Scenario => {
  const requestScenario: IOptimizeToursRequest = {
    ...scenario,
    label: requestSettings.label,
    model: {
      ...scenario?.model,

      shipments,
      vehicles,
      globalDurationCostPerHour: shipmentModel?.globalDurationCostPerHour,
      globalStartTime: { seconds: Long.fromValue(shipmentModel?.globalStartTime).toNumber() },
      globalEndTime: { seconds: Long.fromValue(shipmentModel?.globalEndTime).toNumber() },
      maxActiveVehicles: shipmentModel?.maxActiveVehicles ? shipmentModel?.maxActiveVehicles : null,
      precedenceRules: shipmentModel?.precedenceRules,
      shipmentTypeIncompatibilities: shipmentModel?.shipmentTypeIncompatibilities,
      shipmentTypeRequirements: shipmentModel?.shipmentTypeRequirements,
      transitionAttributes: shipmentModel?.transitionAttributes,
    },
    interpretInjectedSolutionsUsingLabels: requestSettings.interpretInjectedSolutionsUsingLabels,
    populateTransitionPolylines: requestSettings.populateTransitionPolylines,
    allowLargeDeadlineDespiteInterruptionRisk:
      requestSettings.allowLargeDeadlineDespiteInterruptionRisk,
    useGeodesicDistances: requestSettings.useGeodesicDistances,
    geodesicMetersPerSecond: requestSettings.geodesicMetersPerSecond,
    injectedSolutionConstraint: injectedSolution && {
      constraintRelaxations: injectedConstraintRelaxations,
      routes: injectedSolution.routes,
      skippedShipments: injectedSolution.skippedShipments,
    },
    searchMode: requestSettings.searchMode,
    considerRoadTraffic: requestSettings.traffic,
    // Ignore timeout typing since the proto typing is incorrect for the REST API
    timeout: requestSettings.timeout && (durationToRequestString(requestSettings.timeout) as any),
  };
  return requestScenario;
};

const selectScenario = createSelector(
  fromDispatcher.selectScenario,
  selectDenormalizedShipments,
  selectDenormalizedVehicles,
  fromRequestSettings.selectRequestSettingsState,
  (scenario, shipments, vehicles, requestSettings) =>
    getRequestScenario(scenario, shipments, vehicles, requestSettings)
);

const selectRequestScenario = createSelector(
  fromDispatcher.selectScenario,
  selectDenormalizedRequestShipments,
  selectDenormalizedRequestVehicles,
  fromRequestSettings.selectRequestSettingsState,
  fromShipmentModel.selectShipmentModelState,
  (scenario, shipments, vehicles, requestSettings, shipmentModel) =>
    getRequestScenario(scenario, shipments, vehicles, requestSettings, shipmentModel)
);

const selectRequestIncrementalScenario = (
  shipmentRouteChanges?: ShipmentRoute[],
  visitChanges?: Visit[]
) =>
  createSelector(
    fromDispatcher.selectScenario,
    selectDenormalizedRequestShipments,
    selectDenormalizedRequestVehicles,
    fromRequestSettings.selectRequestSettingsState,
    fromShipmentModel.selectShipmentModelState,
    selectDenormalizedInjectedSolution(shipmentRouteChanges, visitChanges),
    selectDenormalizedConstraintRelaxations,
    (
      scenario,
      shipments,
      vehicles,
      requestSettings,
      shipmentModel,
      solution,
      constraintRelaxations
    ) =>
      getRequestScenario(
        scenario,
        shipments,
        vehicles,
        requestSettings,
        shipmentModel,
        solution,
        constraintRelaxations
      )
  );

const selectRequestedScenario = createSelector(
  fromDispatcher.selectScenario,
  selectDenormalizedRequestedShipments,
  selectDenormalizedRequestedVehicles,
  fromRequestSettings.selectRequestSettingsState,
  fromShipmentModel.selectShipmentModelState,
  (scenario, shipments, vehicles, requestSettings, shipmentModel) =>
    getRequestScenario(scenario, shipments, vehicles, requestSettings, shipmentModel)
);

const selectShipmentRouteChangeIndices = (shipmentRouteChanges?: ShipmentRoute[]) =>
  createSelector(ShipmentRouteSelectors.selectRouteIndexById, (routeIndexById): Set<number> => {
    if (shipmentRouteChanges?.length) {
      return new Set(
        shipmentRouteChanges.map((shipmentRoute) => routeIndexById.get(shipmentRoute.id))
      );
    }
    return new Set<number>();
  });

/** {@link Scenario} to recalculate all shipment route polylines */
const selectRequestRecalculatePolylines = (
  shipmentRouteChanges: ShipmentRoute[],
  visitChanges: Visit[]
) =>
  createSelector(
    selectRequestedScenario,
    selectDenormalizedSolution(shipmentRouteChanges, visitChanges),
    selectShipmentRouteChangeIndices(shipmentRouteChanges),
    (request, solution, shipmentRouteChangeIndices): Scenario => {
      const { globalStartTime, globalEndTime } = request.model;
      return {
        ...request,
        model: {
          ...request.model,
          shipments: request.model.shipments.map((shipment) => ({
            ...shipment,
            pickups: shipment.pickups.map((vr) => ({ ...vr, duration: null, timeWindows: [] })),
            deliveries: shipment.deliveries.map((vr) => ({
              ...vr,
              duration: null,
              timeWindows: [],
            })),
          })),
          vehicles: request.model.vehicles.map((vehicle) => ({
            ...vehicle,
            startTimeWindows: [],
            endTimeWindows: [],
          })),
        },
        refreshDetailsRoutes: solution.routes
          .filter((_, index) => shipmentRouteChangeIndices.has(index))
          .map((route) => ({
            ...route,
            visits: route.visits.map((visit) => ({
              ...visit,
              arrivalLoads: null,
            })),
            endLoads: null,
            transitions: null,
            routePolyline: null,
            vehicleStartTime: globalStartTime,
            vehicleEndTime: globalEndTime,
          })),
      };
    }
  );

export const DenormalizeSelectors = {
  selectIgnoredShipmentIds,
  selectIgnoredVehicleIds,
  selectRequestShipments,
  selectRequestVehicles,
  selectRequestedShipments,
  selectRequestedVehicles,
  selectHasStaleSolutionShipments,
  selectHasStaleSolutionVehicles,
  selectIsSolutionStale,
  selectIsSolutionIllegal,
  selectIncompatibleSolutionShipmentIds,
  selectIncompatibleSolutionVehicleIds,
  selectIncompatibleSolutionVisitIdsByShipmentRouteId,
  selectInjectedRoutes,
  selectDenormalizedRoutes,
  selectDenormalizedInjectedRoutes,
  selectDenormalizedShipments,
  selectDenormalizedRequestShipments,
  selectDenormalizedVehicles,
  selectDenormalizedRequestVehicles,
  selectDenormalizedRequestedShipments,
  selectDenormalizedRequestedVehicles,
  selectDenormalizedSolution,
  selectDenormalizedInjectedSolution,
  selectScenario,
  selectRequestScenario,
  selectRequestIncrementalScenario,
  selectRequestedScenario,
  selectRequestRecalculatePolylines,
};

export default DenormalizeSelectors;
