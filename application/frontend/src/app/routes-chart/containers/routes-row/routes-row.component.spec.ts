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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import * as Long from 'long';
import {
  PointOfInterest,
  PointOfInterestClick,
  ShipmentRoute,
  Timeline,
  ChangedVisits,
  Vehicle,
} from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromPointOfInterest from 'src/app/core/selectors/point-of-interest.selectors';
import RequestSettingsSelectors from 'src/app/core/selectors/request-settings.selectors';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import ShipmentRouteSelectors from 'src/app/core/selectors/shipment-route.selectors';
import * as fromTimeline from 'src/app/core/selectors/timeline.selectors';
import * as fromVehicle from 'src/app/core/selectors/vehicle.selectors';
import VisitSelectors from 'src/app/core/selectors/visit.selectors';
import { SharedModule } from 'src/app/shared/shared.module';
import { MapService, ValidationService } from '../../../core/services';
import { RoutesRowComponent } from './routes-row.component';
import * as fromDispatcher from 'src/app/core/selectors/dispatcher.selectors';
import ShipmentModelSelectors from '../../../core/selectors/shipment-model.selectors';
import { MockMapService } from 'src/test/service-mocks';

@Component({
  selector: 'app-base-routes-row',
  template: '',
})
class MockBaseRoutesRowComponent {
  @Input() route: ShipmentRoute;
  @Input() vehicle: Vehicle;
  @Input() shipmentCount: number;
  @Input() selected = false;
  @Input() timeline: Timeline;
  @Input() duration: [Long, Long];
  @Input() availability: [Long, Long];
  @Input() pointsOfInterest: PointOfInterest[];
  @Input() pendingNewPois: PointOfInterest[];
  @Input() pendingOldVisitIds: Set<number>;
  @Input() range: number;
  @Input() relaxationTimes: Long[];
  @Input() timezoneOffset: number;
  @Input() changedVisits: ChangedVisits;
  @Input() color = '#1a73e8';
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() pointOfInterestClick = new EventEmitter<PointOfInterestClick>();
  @Output() editVehicle = new EventEmitter<number>();
  @Output() viewMetadata = new EventEmitter<number>();
}

describe('RoutesRowComponent', () => {
  let component: RoutesRowComponent;
  let fixture: ComponentFixture<RoutesRowComponent>;
  let _validationService: jasmine.SpyObj<ValidationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [MockBaseRoutesRowComponent, RoutesRowComponent],
      providers: [
        { provide: MapService, useClass: MockMapService },
        {
          provide: ValidationService,
          useValue: jasmine.createSpyObj('validationService', ['getErrorEntityIds']),
        },
        provideMockStore({
          selectors: [
            { selector: fromTimeline.selectTimelineSelectors, value: {} },
            { selector: fromPointOfInterest.selectPointsOfInterestSelectors, value: {} },
            { selector: fromPointOfInterest.selectSaveChanges, value: null },
            { selector: ShipmentRouteSelectors.selectRouteByIdFn, value: () => ({}) },
            { selector: fromVehicle.selectByIdFn, value: () => ({}) },
            { selector: ShipmentRouteSelectors.selectStatsFn, value: () => ({}) },
            { selector: RoutesChartSelectors.selectDuration, value: [Long.ZERO, Long.ZERO] },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: fromPointOfInterest.selectIsDragging, value: null },
            { selector: fromPointOfInterest.selectDragVisitId, value: null },
            { selector: fromPointOfInterest.selectOverlapTimelineId, value: null },
            { selector: fromPointOfInterest.selectDragVisitsToEdit, value: [] },
            { selector: RoutesChartSelectors.selectRange, value: 0 },

            // For fromVehicle.selectVehicleAvailability
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: null },

            // For fromVehicle.selectVehicleAvailability
            { selector: fromVehicle.selectVehicleState, value: { entities: {}, ids: [] } },

            // For fromDispatcher.selectTimeOfResponse
            { selector: fromDispatcher.selectTimeOfResponse, value: null },
          ],
        }),
      ],
    }).compileComponents();

    _validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;

    fixture = TestBed.createComponent(RoutesRowComponent);
    component = fixture.componentInstance;
    component.route = { id: 0, visits: [] };

    spyOn(
      RequestSettingsSelectors,
      'selectGlobalAndVehicleConstraintRelaxationsForVehicle'
    ).and.returnValue(
      createSelector(
        () => null,
        (_state) => []
      )
    );
    spyOn(RoutesChartSelectors, 'selectSelectedRoute').and.returnValue(
      createSelector(
        () => null,
        (_state) => true
      )
    );
    spyOn(VisitSelectors, 'selectChangedVisitsFromIds').and.returnValue(
      createSelector(
        () => null,
        (_state) => ({})
      )
    );

    spyOn(VisitSelectors, 'selectVisitRequestsByIds').and.returnValue(
      createSelector(
        () => null,
        (_state) => []
      )
    );

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
