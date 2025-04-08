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
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Dictionary } from '@ngrx/entity';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { MockFormVisitRequestLayerService, MockMapService } from 'src/test/service-mocks';
import { Shipment, Vehicle, Visit, VisitCategory, VisitRequest } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import * as fromMap from '../../selectors/map.selectors';
import * as fromScenario from '../../selectors/scenario.selectors';
import ShipmentSelectors from '../../selectors/shipment.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import VisitSelectors from '../../selectors/visit.selectors';
import VisitRequestSelectors from '../../selectors/visit-request.selectors';
import { FormVisitRequestLayer, MapService } from '../../services';
import { PreSolveEditShipmentDialogComponent } from './pre-solve-edit-shipment-dialog.component';
import * as fromCapacityQuantity from '../../selectors/capacity-quantity.selectors';
import { createSelector } from '@ngrx/store';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';

@Component({
  selector: 'app-base-edit-shipment-dialog',
  template: '',
})
class MockBaseEditShipmentDialogComponent {
  @Input() bulkEdit: boolean;
  @Input() bulkNumber: number;
  @Input() disabled = false;
  @Input() shipment: Shipment;
  @Input() vehicles: Dictionary<Vehicle>;
  @Input() abbreviations: { [unit: string]: string };
  @Input() appearance: string;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
  @Input() scenarioShipmentTypes: Set<string>;
  /**
   * Ids used to map vehicle to index
   * @remarks
   * For pre-solve and post-solve, this should always be fromVehicles.selectIds;
   * indexes aren't adjusted until request/download time and not reflected in the
   * store.
   */
  @Input() vehicleIds: number[];
  @Input() visitRequests: VisitRequest[];
  @Input() pickup?: Visit;
  @Input() delivery?: Visit;
  @Input() visitTags?: string[];
  @Input() visitTypes?: string[];
  @Input() visitCategory?: VisitCategory;
  @Input() nextVisitRequestId = 0;
  @Input() timezoneOffset = 0;
  @Input() bounds?: google.maps.LatLngBounds;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    shipment: Shipment;
    visitRequests: VisitRequest[];
    visit?: Visit;
  }>();
}

describe('PreSolveEditShipmentDialogComponent', () => {
  let component: PreSolveEditShipmentDialogComponent;
  let fixture: ComponentFixture<PreSolveEditShipmentDialogComponent>;
  let matDialogRef: jasmine.SpyObj<MatDialogRef<PreSolveEditShipmentDialogComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [MockBaseEditShipmentDialogComponent, PreSolveEditShipmentDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('matDialogRef', ['close', 'backdropClick']),
        },
        provideMockStore({
          selectors: [
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: fromVehicle.selectVehicleState, value: { entities: {}, ids: [] } },
            { selector: fromScenario.selectVisitTags, value: [] },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: VisitRequestSelectors.selectNextVisitRequestId, value: 0 },
            { selector: fromMap.selectPreSolveEditShipmentFormBounds, value: null },
            { selector: fromConfig.selectUnitAbbreviations, value: null },
            { selector: fromCapacityQuantity.selectUniqueCapacities, value: [] },
            { selector: fromCapacityQuantity.selectUniqueDemands, value: [] },
          ],
        }),
      ],
    })
      .overrideProvider(MapService, { useValue: new MockMapService() })
      .overrideProvider(FormVisitRequestLayer, { useValue: new MockFormVisitRequestLayerService() })
      .compileComponents();
    matDialogRef = TestBed.inject(MatDialogRef) as any;
    const mockMouseEvent = jasmine.createSpyObj('mouseEvent', [
      'stopImmediatePropagation',
    ]) as MouseEvent;
    matDialogRef.backdropClick.and.callFake(() => of(mockMouseEvent));

    fixture = TestBed.createComponent(PreSolveEditShipmentDialogComponent);
    component = fixture.componentInstance;
    component.shipmentIds = [];

    spyOn(VisitSelectors, 'selectPickupByShipmentId').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    spyOn(VisitSelectors, 'selectDeliveryByShipmentId').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    spyOn(VisitRequestSelectors, 'selectShipmentsVisitRequests').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    spyOn(ShipmentSelectors, 'selectShipmentForEdit').and.returnValue(
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
