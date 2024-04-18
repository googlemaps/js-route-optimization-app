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

import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, take } from 'rxjs/operators';
import * as RoutesChartActions from 'src/app/core/actions/routes-chart.actions';
import { PreSolveVehicleActions } from 'src/app/core/actions';
import {
  PointOfInterest,
  ShipmentRoute,
  PointOfInterestStartDrag,
  Timeline,
  Vehicle,
  PointOfInterestClick,
  PointOfInterestTimelineOverlapBegin,
  IConstraintRelaxation,
  ChangedVisits,
} from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromPointsOfInterest from 'src/app/core/selectors/point-of-interest.selectors';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import * as fromTimeline from 'src/app/core/selectors/timeline.selectors';
import ShipmentRouteSelectors from 'src/app/core/selectors/shipment-route.selectors';
import * as fromVehicle from 'src/app/core/selectors/vehicle.selectors';
import * as fromRoot from 'src/app/reducers';
import * as PoiActions from 'src/app/core/actions/points-of-interest.actions';
import RequestSettingsSelectors from 'src/app/core/selectors/request-settings.selectors';
import VisitSelectors from 'src/app/core/selectors/visit.selectors';
import { ValidationService } from 'src/app/core/services';
import { PostSolveMetricsActions } from 'src/app/core/actions';
import { Router } from '@angular/router';
import { Page } from 'src/app/core/models';
import { durationSeconds, getEntityName } from 'src/app/util';
import * as fromDispatcher from 'src/app/core/selectors/dispatcher.selectors';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-routes-row',
  templateUrl: './routes-row.component.html',
  styleUrls: ['./routes-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesRowComponent implements OnChanges, OnInit, OnDestroy {
  @Input() route: ShipmentRoute;

  isDragging$: Observable<boolean>;
  dragVisitIds$: Observable<number[]>;
  currentOverlapId$: Observable<number>;
  selected$: Observable<boolean>;
  vehicle$: Observable<Vehicle>;
  shipmentCount$: Observable<number>;
  timeline$: Observable<Timeline>;
  duration$: Observable<[Long, Long]>;
  availability$: Observable<[Long, Long]>;
  pointsOfInterest$: Observable<PointOfInterest[]>;
  pendingNewPois$: Observable<PointOfInterest[]>;
  pendingOldVisitIds$: Observable<Set<number>>;
  range$: Observable<number>;
  relaxationTimes$: Observable<Long[]>;
  timezoneOffset$: Observable<number>;
  changedVisits$: Observable<ChangedVisits>;
  private readonly route$ = new BehaviorSubject<ShipmentRoute>(null);

  constructor(
    private router: Router,
    private store: Store<fromRoot.State>,
    private validationService: ValidationService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.route) {
      this.route$.next(changes.route.currentValue);
    }
  }

  ngOnInit(): void {
    this.timeline$ = this.store.pipe(
      select(fromTimeline.selectTimelineSelectors),
      switchMap((timelineSelectors) =>
        this.route$.pipe(
          switchMap((route) => {
            const selectTimeline = timelineSelectors[route?.id];
            return selectTimeline ? this.store.pipe(select(selectTimeline)) : of([]);
          })
        )
      )
    );
    this.pointsOfInterest$ = this.store.pipe(
      select(fromPointsOfInterest.selectPointsOfInterestSelectors),
      switchMap((pointsOfInterestSelectors) =>
        this.route$.pipe(
          switchMap((route) => {
            const selectPointsOfInterest = pointsOfInterestSelectors[route?.id];
            return selectPointsOfInterest
              ? this.store.pipe(select(selectPointsOfInterest))
              : of([]);
          })
        )
      )
    );
    this.duration$ = this.store.pipe(select(RoutesChartSelectors.selectDuration));
    this.availability$ = this.route$.pipe(
      switchMap((route) =>
        this.store.pipe(select(fromVehicle.selectVehicleAvailability(route?.id)))
      )
    );
    this.vehicle$ = this.route$.pipe(
      switchMap((route) =>
        this.store.pipe(
          select(fromVehicle.selectByIdFn),
          map((vehicleByIdFn) => vehicleByIdFn(route?.id))
        )
      )
    );

    this.shipmentCount$ = this.route$.pipe(
      switchMap((route) =>
        this.store.pipe(
          select(ShipmentRouteSelectors.selectStatsFn),
          map((statsFn) => statsFn(route?.id).shipmentCount)
        )
      )
    );
    this.selected$ = this.route$.pipe(
      switchMap((route) =>
        this.store.pipe(select(RoutesChartSelectors.selectSelectedRoute(route?.id)))
      )
    );
    this.pendingNewPois$ = this.route$.pipe(
      switchMap((route) =>
        this.store.pipe(select(fromPointsOfInterest.selectPendingNewPois(route?.id)))
      )
    );
    this.pendingOldVisitIds$ = this.route$.pipe(
      switchMap((route) =>
        this.store.pipe(select(fromPointsOfInterest.selectPendingOldVisitIds(route?.id)))
      )
    );

    this.changedVisits$ = this.route$.pipe(
      switchMap((route) =>
        this.store.pipe(select(VisitSelectors.selectChangedVisitsFromIds(route?.visits || [])))
      ),
      mergeMap((visits) =>
        this.store.pipe(
          select(fromDispatcher.selectTimeOfResponse),
          map((timeOfResponse) => {
            const result = {};
            Object.keys(visits).forEach((id) => {
              if (visits[id].changeTime !== timeOfResponse) {
                result[id] = true;
              }
            });
            return result;
          })
        )
      )
    );

    this.timezoneOffset$ = this.store.pipe(select(fromConfig.selectTimezoneOffset));
    this.isDragging$ = this.store.pipe(select(fromPointsOfInterest.selectIsDragging));
    this.currentOverlapId$ = this.store.pipe(select(fromPointsOfInterest.selectOverlapTimelineId));
    this.dragVisitIds$ = this.store.pipe(
      select(fromPointsOfInterest.selectDragVisitsToEdit),
      map((visits) => visits.map((visit) => visit.id))
    );
    this.relaxationTimes$ = this.store.pipe(
      select(
        RequestSettingsSelectors.selectGlobalAndVehicleConstraintRelaxationsForVehicle(
          this.route.id
        )
      ),
      map((relaxations) => {
        return relaxations.flatMap((r) =>
          (r as IConstraintRelaxation).relaxations.map((relaxation) =>
            durationSeconds(relaxation.thresholdTime)
          )
        );
      })
    );
    this.range$ = this.store.pipe(select(RoutesChartSelectors.selectRange));
  }

  ngOnDestroy(): void {
    this.route$.complete();
  }

  onSelectedChange(selected: boolean): void {
    const action = selected ? RoutesChartActions.selectRoute : RoutesChartActions.deselectRoute;
    this.store.dispatch(action({ routeId: this.route.id }));
  }

  onDragStart(dragStart: PointOfInterestStartDrag): void {
    this.store.dispatch(PoiActions.startDrag({ dragStart }));
  }

  onTimelineEnter(overlap: PointOfInterestTimelineOverlapBegin): void {
    this.store.dispatch(PoiActions.beginTimelineOverlap({ overlap }));
  }

  onTimelineLeave(): void {
    this.store.dispatch(PoiActions.endTimelineOverlap());
  }

  onPointOfInterestClick(pointOfInterestClick: PointOfInterestClick): void {
    if (pointOfInterestClick.visitId < 1) {
      return;
    }
    this.store.dispatch(RoutesChartActions.editVisit({ visitId: pointOfInterestClick.visitId }));
  }

  onEditVehicle(vehicleId: number): void {
    this.store.dispatch(PreSolveVehicleActions.editVehicle({ vehicleId }));
  }

  onViewMetadata(id: number): void {
    this.store.dispatch(PostSolveMetricsActions.showMetadataForRoute({ id }));
    this.router.navigateByUrl('/' + Page.RoutesMetadata, { skipLocationChange: true });
  }

  onMouseEnterVisit(id: number): void {
    this.store.dispatch(RoutesChartActions.mouseEnterVisitRequest({ id }));
  }

  onMouseExitVisit(): void {
    this.store.dispatch(RoutesChartActions.mouseExitVisitRequest());
  }
}
