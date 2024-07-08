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

import { ScenarioKpisComponent } from './scenario-kpis.component';
import { provideMockStore } from '@ngrx/store/testing';
import { selectScenarioKpis } from '../../selectors/pre-solve.selectors';
import { MatDialog } from '@angular/material/dialog';

describe('ScenarioKpisComponent', () => {
  let component: ScenarioKpisComponent;
  let fixture: ComponentFixture<ScenarioKpisComponent>;
  let _matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScenarioKpisComponent],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('matDialog', ['open']) },
        provideMockStore({
          selectors: [
            {
              selector: selectScenarioKpis,
              value: {
                shipmentKpis: {
                  total: 0,
                  selected: 0,
                  demands: [],
                  pickups: 0,
                  deliveries: 0,
                  dwellTime: 0,
                },
                vehicleKpis: {
                  total: 0,
                  selected: 0,
                  capacities: [],
                },
              },
            },
          ],
        }),
      ],
    }).compileComponents();

    _matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    fixture = TestBed.createComponent(ScenarioKpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort load demands by type', () => {
    const capacities = [
      {
        selected: 0,
        total: 0,
        type: 'weight',
      },
      {
        selected: 0,
        total: 0,
        type: 'volume',
      },
    ];
    capacities.sort(component.sortLoadDemandsByType);
    expect(capacities[0].type).toBe('volume');
    expect(capacities[1].type).toBe('weight');
  });
});
