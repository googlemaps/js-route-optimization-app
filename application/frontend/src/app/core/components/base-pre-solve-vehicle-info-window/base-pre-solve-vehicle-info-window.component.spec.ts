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
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePreSolveVehicleInfoWindowComponent } from './base-pre-solve-vehicle-info-window.component';
import { ITimeWindow, Vehicle } from '../../models';
import Long from 'long';
import { SharedModule } from 'src/app/shared/shared.module';
import { LOCALE_ID } from '@angular/core';

describe('BasePreSolveVehicleInfoWindowComponent', () => {
  let component: BasePreSolveVehicleInfoWindowComponent;
  let fixture: ComponentFixture<BasePreSolveVehicleInfoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [BasePreSolveVehicleInfoWindowComponent],
      providers: [{ provide: LOCALE_ID, useValue: 'en-US' }],
    }).compileComponents();

    fixture = TestBed.createComponent(BasePreSolveVehicleInfoWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('format time windows', () => {
    it('should format time window with start and end times', () => {
      const timeWindow: ITimeWindow = {
        startTime: { seconds: 1609459200 },
        endTime: { seconds: 1609502400 },
      };

      const result = component.formatTimeWindow(timeWindow);

      expect(result).toBe('2021/01/01 12:00 am - 2021/01/01 12:00 pm');
    });

    it('should format time window according to their timezone offset', () => {
      const timeWindow: ITimeWindow = {
        startTime: { seconds: 1609459200 },
        endTime: { seconds: 1609502400 },
      };
      component.timezoneOffset = 0;

      const result = component.formatTimeWindow(timeWindow);
      expect(result).toBe('2021/01/01 12:00 am - 2021/01/01 12:00 pm');

      component.timezoneOffset = 3600;

      const resultOffset = component.formatTimeWindow(timeWindow);
      expect(resultOffset).toBe('2021/01/01 1:00 am - 2021/01/01 1:00 pm');
    });

    it('should use globalDuration start when startTime is missing', () => {
      component.globalDuration = [Long.fromNumber(1609459200), Long.fromNumber(1699999999)];
      const timeWindow: ITimeWindow = {
        endTime: { seconds: 1609502400 },
      };

      const result = component.formatTimeWindow(timeWindow);

      expect(result).toBe('2021/01/01 12:00 am - 2021/01/01 12:00 pm');
    });

    it('should use globalDuration start when endTime is missing', () => {
      component.globalDuration = [Long.fromNumber(1609000000), Long.fromNumber(1609502400)];
      const timeWindow: ITimeWindow = {
        startTime: { seconds: 1609459200 },
      };

      const result = component.formatTimeWindow(timeWindow);

      expect(result).toBe('2021/01/01 12:00 am - 2021/01/01 12:00 pm');
    });

    it('should return an empty array when no start time windows exist', () => {
      component.vehicle = { id: 1, startTimeWindows: [] } as Vehicle;

      component.getFormattedTimeWindows();

      expect(component.startTimeWindows).toEqual([]);
    });

    it('should skip time windows without hard limits', () => {
      component.vehicle = {
        id: 1,
        startTimeWindows: [{ softStartTime: 1609459200, softEndTime: 1609480500 }],
      } as Vehicle;

      component.getFormattedTimeWindows();

      expect(component.startTimeWindows).toEqual([]);
    });

    it('should format multiple time windows', () => {
      component.vehicle = {
        id: 1,
        startTimeWindows: [
          {
            startTime: { seconds: 1609459200 },
            endTime: { seconds: 1609470000 },
          },
          {
            startTime: { seconds: 1609488000 },
            endTime: { seconds: 1609502400 },
          },
        ],
      } as Vehicle;

      component.getFormattedTimeWindows();

      expect(component.startTimeWindows.length).toBe(2);
      expect(component.startTimeWindows[0]).toBe('2021/01/01 12:00 am - 2021/01/01 3:00 am');
      expect(component.startTimeWindows[1]).toBe('2021/01/01 8:00 am - 2021/01/01 12:00 pm');
    });

    it('should clear previous time windows before processing changes', () => {
      component.startTimeWindows = [
        '2021/01/01 12:00 am - 2021/01/01 3:00 am',
        '2021/01/01 8:00 am - 2021/01/01 12:00 pm',
      ];
      component.vehicle = {
        id: 1,
        startTimeWindows: [],
      } as Vehicle;

      component.getFormattedTimeWindows();

      expect(component.startTimeWindows).toEqual([]);
    });
  });

  describe('change detection', () => {
    it('should update startTimeWindows when vehicle changes', () => {
      component.vehicle = {
        id: 1,
        startTimeWindows: [
          {
            startTime: { seconds: 1609459200 },
            endTime: { seconds: 1609502400 },
          },
        ],
      } as Vehicle;

      component.ngOnChanges({});

      expect(component.startTimeWindows.length).toBe(1);
    });
  });
});
