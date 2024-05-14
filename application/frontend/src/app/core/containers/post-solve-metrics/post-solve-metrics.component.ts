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

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap, withLatestFrom } from 'rxjs/operators';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromDispatcher from 'src/app/core/selectors/dispatcher.selectors';
import * as fromPostSolveShipment from 'src/app/core/selectors/post-solve-shipment.selectors';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import ShipmentRouteSelectors, * as fromShipmentRoute from 'src/app/core/selectors/shipment-route.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import * as fromTimeline from 'src/app/core/selectors/timeline.selectors';
import { PostSolveMetricsActions } from '../../actions';
import { Page, Timeline, TimelineCategory, TimeSet } from '../../models';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';

@Component({
  selector: 'app-post-solve-metrics',
  templateUrl: './post-solve-metrics.component.html',
  styleUrls: ['./post-solve-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostSolveMetricsComponent implements OnInit {
  duration$: Observable<[Long, Long]>;
  numberOfRoutes$: Observable<number>;
  totalDistance$: Observable<number>;
  skippedShipmentsCount$: Observable<number>;
  shipmentsCount$: Observable<number>;
  solutionTime$: Observable<number>;
  totalCost$: Observable<number>;
  timezoneOffset$: Observable<number>;
  timeline$: Observable<Timeline>;
  vehicleTimeAverages$: Observable<TimeSet>;
  numberOfVehicles$: Observable<number>;

  constructor(private router: Router, private store: Store) {}

  ngOnInit(): void {
    this.duration$ = this.store.pipe(select(ShipmentRouteSelectors.selectRoutesDuration));
    this.numberOfRoutes$ = this.store.pipe(select(fromSolution.selectUsedRoutesCount));
    this.totalDistance$ = this.store.pipe(select(fromSolution.selectTotalRoutesDistanceMeters));
    this.solutionTime$ = this.store.pipe(select(fromDispatcher.selectSolutionTime));
    this.skippedShipmentsCount$ = this.store.pipe(
      select(fromPostSolveShipment.selectTotalSkippedShipments)
    );
    this.shipmentsCount$ = this.store.pipe(select(PreSolveShipmentSelectors.selectTotalRequested));
    this.totalCost$ = this.store.pipe(select(fromSolution.selectTotalCost));
    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));

    this.vehicleTimeAverages$ = this.store.pipe(
      select(fromShipmentRoute.selectAll),
      withLatestFrom(this.store.pipe(select(fromTimeline.selectTimelineSelectors))),
      switchMap(([routes, timelineSelectors]) => {
        const timelines = routes.map((route) => timelineSelectors[route.id]);
        return combineLatest(timelines.map((tl) => this.store.pipe(select(tl))));
      }),
      map((res) => {
        return this.calculateVehicleTimeAverages(res);
      })
    );

    this.numberOfVehicles$ = this.store.pipe(
      select(PreSolveVehicleSelectors.selectSelected),
      map((selected) => selected.length)
    );
  }

  calculateVehicleTimeAverages(timelines: Timeline[]): TimeSet {
    const totalTimes = {
      breakTime: 0,
      idleTime: 0,
      serviceTime: 0,
      travelTime: 0,
    };
    timelines.forEach((timeline) => {
      if (!timeline) {
        return;
      }
      const totals = this.summarizeTimeline(timeline);
      totalTimes.breakTime += totals.breakTime;
      totalTimes.idleTime += totals.idleTime;
      totalTimes.serviceTime += totals.serviceTime;
      totalTimes.travelTime += totals.travelTime;
    });

    const sum =
      totalTimes.breakTime + totalTimes.idleTime + totalTimes.serviceTime + totalTimes.travelTime;
    const percentTimes = {
      breakTime: totalTimes.breakTime / sum,
      idleTime: totalTimes.idleTime / sum,
      serviceTime: totalTimes.serviceTime / sum,
      travelTime: totalTimes.travelTime / sum,
    };
    return percentTimes;
  }

  summarizeTimeline(timeline: Timeline): TimeSet {
    const totalTimes = {
      breakTime: 0,
      idleTime: 0,
      serviceTime: 0,
      travelTime: 0,
    };

    const minTime = timeline.reduce(
      (min, segment) => Math.min(min, segment.startTime.toNumber()),
      Infinity
    );
    const maxTime = timeline.reduce(
      (max, segment) => Math.max(max, segment.endTime.toNumber()),
      -Infinity
    );

    timeline.forEach((segment) => {
      const segmentDuration = segment.endTime.subtract(segment.startTime).toNumber();
      switch (segment.category) {
        case TimelineCategory.BreakTime:
          totalTimes.breakTime += segmentDuration;
          break;
        case TimelineCategory.Driving:
          totalTimes.travelTime += segmentDuration;
          break;
        case TimelineCategory.Service:
          totalTimes.serviceTime += segmentDuration;
          break;
      }
    });
    totalTimes.idleTime = Math.max(
      0,
      maxTime - minTime - totalTimes.breakTime - totalTimes.serviceTime - totalTimes.travelTime
    );
    return totalTimes;
  }

  onSkippedShipmentsClick(): void {
    this.store.dispatch(PostSolveMetricsActions.showSkippedShipments());
    this.router.navigateByUrl('/' + Page.ShipmentsMetadata, { skipLocationChange: true });
  }
}
