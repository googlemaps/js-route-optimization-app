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
import { createSelector, MemoizedSelector } from '@ngrx/store';
import * as Long from 'long';
import * as fromRoot from 'src/app/reducers';
import { durationSeconds, maxLong, minLong } from 'src/app/util';
import {
  IBreak,
  ITravelStep,
  ShipmentRoute,
  Timeline,
  TimelineCategory,
  TimelineCatagorySegment,
  TimeSegment,
  TravelTimeSegment,
  Visit,
  VisitRequest,
  VisitVisitRequest,
} from '../models';
import ShipmentRouteSelectors, * as fromShipmentRoute from './shipment-route.selectors';

const createBreakSegment = (brk: IBreak): TimeSegment => {
  const startTime = durationSeconds(brk.startTime);
  const duration = durationSeconds(brk.duration);
  return {
    startTime,
    endTime: startTime?.add(duration),
    duration,
  };
};

const createVisitSegment = (visit: Visit, visitRequest: VisitRequest): TimeSegment => {
  const startTime = durationSeconds(visit.startTime);
  const duration = durationSeconds(visitRequest?.duration);
  return {
    startTime,
    endTime: startTime?.add(duration),
    duration,
  };
};

/**
 * @remarks
 * Gap refers to the duration available between vehicle start time, subsequent visits,
 * and finally vehicle end time.
 */
const identifyTravelTimeSegment = (
  vehicleStartTime: Long,
  vehicleEndTime: Long,
  prevVisit: TimeSegment,
  nextVisit: TimeSegment,
  duration: Long
): TravelTimeSegment => {
  let travelTimeSegment: TravelTimeSegment;
  if (!prevVisit) {
    const endTime = vehicleStartTime?.add(duration);
    travelTimeSegment = {
      startTime: vehicleStartTime,
      endTime,
      gapStartTime: vehicleStartTime,
      gapEndTime: maxLong(endTime, nextVisit?.startTime ?? vehicleEndTime),
    };
  } else if (!nextVisit) {
    const startTime = vehicleEndTime?.subtract(duration);
    travelTimeSegment = {
      startTime,
      endTime: vehicleEndTime,
      gapStartTime: minLong(prevVisit.endTime ?? vehicleStartTime, startTime),
      gapEndTime: vehicleEndTime,
    };
  } else {
    const endTime = prevVisit.endTime.add(duration);
    travelTimeSegment = {
      startTime: prevVisit.endTime,
      endTime,
      gapStartTime: prevVisit.endTime,
      gapEndTime: maxLong(nextVisit.startTime, endTime),
    };
  }
  return travelTimeSegment;
};

/**
 * @remarks
 * Assumes a route's travel steps, visits, and breaks are in time ascending order.
 */
const getTimeline = (
  route: ShipmentRoute,
  visitVisitRequests: VisitVisitRequest[]
): Timeline | undefined => {
  if (!visitVisitRequests?.length) {
    return;
  }

  const timeline: Timeline = [];
  const visits = visitVisitRequests.map(({ visit, visitRequest }) =>
    createVisitSegment(visit, visitRequest)
  );

  // Visits must be traveled to and from, so travel steps should be +1 in length
  // eslint-disable-next-line no-console
  console.assert(
    visits.length === route.travelSteps.length - 1,
    'Visits and travel steps not aligned.'
  );

  const routeStartTime = route.vehicleStartTime ? durationSeconds(route.vehicleStartTime) : null;
  const routeEndTime = route.vehicleEndTime ? durationSeconds(route.vehicleEndTime) : null;
  // Create break segments, excluding those that are outside of the vehicle's day
  const breaks = route.breaks
    ? route.breaks
        .map(createBreakSegment)
        .filter(
          (brk) =>
            brk.startTime.greaterThanOrEqual(routeStartTime) &&
            brk.startTime.lessThanOrEqual(routeEndTime)
        )
    : [];

  // Add breaks before travel to the timeline
  for (const brk of breaks) {
    if (brk.startTime.greaterThanOrEqual(routeStartTime)) {
      break;
    }
    timeline.push({
      category: TimelineCategory.BreakTime,
      startTime: brk.startTime,
      endTime: brk.endTime,
    });
  }
  breaks.splice(0, timeline.length);

  // Add travel + visits and interspersed breaks to the timeline
  let lastTravelSegment: TimelineCatagorySegment;
  route.travelSteps.forEach((travelStep: ITravelStep, index: number) => {
    const nextVisit = visits[index];
    try {
      const travelDuration = durationSeconds(travelStep.duration);
      if (travelDuration.isZero()) {
        return;
      }

      const prevVisit = visits[index - 1];
      const travel = identifyTravelTimeSegment(
        routeStartTime,
        routeEndTime,
        prevVisit,
        nextVisit,
        travelDuration
      );
      const identifiedTravelDuration = travel.endTime.subtract(travel.startTime);

      // Look for any remaining break that interrupts this gap
      const breakIndex = breaks.findIndex(
        (b) =>
          b.startTime.greaterThanOrEqual(travel.gapStartTime) &&
          b.startTime.lessThan(travel.gapEndTime)
      );

      if (breakIndex < 0) {
        // No breaks interrupt this gap
        timeline.push(
          (lastTravelSegment = {
            category: TimelineCategory.Driving,
            startTime: travel.startTime,
            // Clamp end time to avoid travel duration spillover as a result of traffic infeasibilities
            endTime: minLong(travel.endTime, travel.gapEndTime),
          })
        );
        return;
      }

      const brk = breaks.splice(breakIndex, 1)[0];
      const gapDuration = travel.gapEndTime.subtract(travel.gapStartTime);
      const fits = brk.duration.add(identifiedTravelDuration).lessThanOrEqual(gapDuration);
      let availableTravelDuration = identifiedTravelDuration;
      if (!fits) {
        // travel + break don't fit into available duration, squeezing travel
        travel.startTime = travel.gapStartTime;
        travel.endTime = travel.gapEndTime;
        availableTravelDuration = gapDuration.subtract(brk.duration);
      }

      // Bisect travel as necessary to accommodate the break
      const beforeBreakTravelDuration = maxLong(
        brk.startTime.subtract(travel.startTime),
        Long.ZERO
      );
      const afterBreakTravelDuration = availableTravelDuration.subtract(beforeBreakTravelDuration);
      if (beforeBreakTravelDuration.greaterThan(Long.ZERO)) {
        timeline.push(
          (lastTravelSegment = {
            category: TimelineCategory.Driving,
            startTime: travel.startTime,
            endTime: brk.startTime,
          })
        );
      }
      timeline.push({
        category: TimelineCategory.BreakTime,
        startTime: brk.startTime,
        endTime: brk.endTime,
      });
      if (afterBreakTravelDuration.greaterThan(Long.ZERO)) {
        timeline.push(
          (lastTravelSegment = {
            category: TimelineCategory.Driving,
            startTime: brk.endTime,
            endTime: brk.endTime.add(afterBreakTravelDuration),
          })
        );
      }
    } finally {
      // Place the next visit that follows the travel step
      if (nextVisit) {
        timeline.push({
          category: TimelineCategory.Service,
          startTime: nextVisit.startTime,
          endTime: nextVisit.endTime,
        });
      }
    }
  });

  // Add breaks after travel (any remaining) to the timeline
  breaks.forEach((b) =>
    timeline.push({
      category: TimelineCategory.BreakTime,
      startTime: b.startTime,
      endTime: b.endTime,
    })
  );

  // Ensure the last travel segment ends on the vehicle end time; this is to make it easier for the POIs
  // to place the depot POI after user visit manipulation (max of last visit end time or vehicle end time)
  // and still be consistent with the timeline
  if (lastTravelSegment) {
    lastTravelSegment.endTime = maxLong(routeEndTime, lastTravelSegment.startTime);
  }

  // User visit modification introduces potential for overlap that breaks assumptions that would
  // otherwise have produced a sorted timeline, so make sure the resulting timeline is sorted.
  return timeline.sort((a, b) => a.startTime.compare(b.startTime) || a.endTime.compare(b.endTime));
};

export const selectTimeline = (routeId: number) =>
  createSelector(
    fromShipmentRoute.selectEntities,
    ShipmentRouteSelectors.selectRouteVisitVisitRequestsFn,
    (routes: Dictionary<ShipmentRoute>, visitVisitRequestsFn) =>
      getTimeline(routes[routeId], visitVisitRequestsFn(routeId))
  );

/** Creates a memoized selector for each route's timeline */
export const selectTimelineSelectors = createSelector(
  fromShipmentRoute.selectEntities,
  (routes) => {
    const lookup: { [id: number]: MemoizedSelector<fromRoot.State, Timeline> } = {};
    Object.values(routes).forEach((route) => (lookup[route.id] = selectTimeline(route?.id)));
    return lookup;
  }
);
