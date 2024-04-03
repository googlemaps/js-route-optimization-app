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
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import RequestSettingsSelectors from 'src/app/core/selectors/request-settings.selectors';
import { MaterialModule } from 'src/app/material';
import { MockMapService } from 'src/test/service-mocks';
import { IConstraintRelaxation, Vehicle } from '../../models';
import { TimeThreshold } from '../../models/request-settings';
import * as fromCapacityQuantity from '../../selectors/capacity-quantity.selectors';
import { selectTimezoneOffset } from '../../selectors/config.selectors';
import * as fromMap from '../../selectors/map.selectors';
import * as fromScenario from '../../selectors/scenario.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { MapService } from '../../services';
import { PreSolveEditVehicleDialogComponent } from './pre-solve-edit-vehicle-dialog.component';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';

@Component({
  selector: 'app-base-edit-vehicle-dialog',
  template: '',
})
class MockBaseEditVehicleDialogComponent {
  @Input() abbreviations: { [unit: string]: string };
  @Input() allowExperimentalFeatures: boolean;
  @Input() appearance: string;
  @Input() bulkEdit: boolean;
  @Input() bulkNumber: number;
  @Input() globalDuration: [Long, Long];
  @Input() injectedSolution: boolean;
  @Input() relaxationSettings: IConstraintRelaxation;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
  @Input() disabled: boolean;
  @Input() nextVehicleId: number;
  @Input() scenarioBounds?: google.maps.LatLngBounds;
  @Input() visitTags?: string[];
  @Input() visitTypes?: string[];
  @Input() operatorTypes?: Set<string>;
  @Input() existingOperatorTypes?: Set<string>;
  @Input() timezoneOffset?: number;
  @Input() vehicle: Vehicle;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    timeThresholds: TimeThreshold[];
    vehicle: Vehicle;
    unsetFields: string[];
  }>();
}

describe('PreSolveEditVehicleDialogComponent', () => {
  let component: PreSolveEditVehicleDialogComponent;
  let fixture: ComponentFixture<PreSolveEditVehicleDialogComponent>;
  let _matDialogRef: jasmine.SpyObj<MatDialogRef<PreSolveEditVehicleDialogComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [MockBaseEditVehicleDialogComponent, PreSolveEditVehicleDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('matDialogRef', ['close']) },
        provideMockStore({
          selectors: [
            { selector: fromMap.selectFormScenarioBounds, value: null },
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: fromScenario.selectVisitTags, value: [] },
            { selector: selectTimezoneOffset, value: 0 },
            { selector: fromVehicle.selectVehicleState, value: { entities: {}, ids: [] } },
            { selector: fromVehicle.selectNextVehicleId, value: 0 },
            { selector: fromConfig.selectUnitAbbreviations, value: null },
            { selector: fromCapacityQuantity.selectUniqueCapacities, value: [] },
            { selector: fromCapacityQuantity.selectUniqueDemands, value: [] },
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: [] },
            { selector: RequestSettingsSelectors.selectInjectedSolution, value: false },
          ],
        }),
      ],
    })
      .overrideProvider(MapService, { useValue: new MockMapService() })
      .compileComponents();
    _matDialogRef = TestBed.inject(MatDialogRef) as any;

    fixture = TestBed.createComponent(PreSolveEditVehicleDialogComponent);
    component = fixture.componentInstance;
    component.vehicleIds = [];

    spyOn(RequestSettingsSelectors, 'selectConstraintRelaxationsForVehicle').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
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
