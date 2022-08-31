/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromDispatcher from 'src/app/core/selectors/dispatcher.selectors';
import * as fromPostSolveShipment from 'src/app/core/selectors/post-solve-shipment.selectors';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import ShipmentRouteSelectors, {
  selectShipmentRouteState,
} from 'src/app/core/selectors/shipment-route.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import * as fromTimeline from 'src/app/core/selectors/timeline.selectors';
import { MaterialModule } from 'src/app/material';
import { TimeSet } from '../../models';
import { PostSolveMetricsComponent } from './post-solve-metrics.component';

@Component({
  selector: 'app-base-post-solve-metrics',
  template: '',
})
class MockBasePostSolveMetricsComponent {
  @Input() duration: [Long, Long];
  @Input() numberOfRoutes: number;
  @Input() solveTime: number;
  @Input() skippedShipmentsCount: number;
  @Input() shipmentsCount: number;
  @Input() totalCost: number;
  @Input() totalDistance: number;
  @Input() timezoneOffset = 0;
  @Input() vehicleTimeAverages: TimeSet;
  @Output() skippedShipmentsClick = new EventEmitter<void>();
}

describe('PostSolveMetricsComponent', () => {
  let component: PostSolveMetricsComponent;
  let fixture: ComponentFixture<PostSolveMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MaterialModule],
      declarations: [MockBasePostSolveMetricsComponent, PostSolveMetricsComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromDispatcher.selectSolutionTime, value: null },
            { selector: fromSolution.selectTotalCost, value: null },
            { selector: ShipmentRouteSelectors.selectRoutesDuration, value: null },
            { selector: fromSolution.selectTotalRoutesDistanceMeters, value: null },
            { selector: fromPostSolveShipment.selectTotalSkippedShipments, value: null },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: PreSolveShipmentSelectors.selectTotalRequested, value: 0 },
            { selector: fromSolution.selectUsedRoutesCount, value: 0 },
            { selector: selectShipmentRouteState, value: { entities: {}, ids: [] } },
            { selector: fromTimeline.selectTimelineSelectors, value: {} },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PostSolveMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
