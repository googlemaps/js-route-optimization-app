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

import { TransitionAttributesDialogComponent } from './transition-attributes-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/material';
import { provideMockStore } from '@ngrx/store/testing';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import VisitRequestSelectors from '../../selectors/visit-request.selectors';
import * as fromVehicle from '../../../core/selectors/vehicle.selectors';

describe('TransitionAttributesDialogComponent', () => {
  let component: TransitionAttributesDialogComponent;
  let fixture: ComponentFixture<TransitionAttributesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule, FormsModule, ReactiveFormsModule],
      declarations: [TransitionAttributesDialogComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ShipmentModelSelectors.selectTransitionAttributes, value: [] },
            { selector: fromVehicle.selectVisitTags, value: [] },
            { selector: VisitRequestSelectors.selectVisitTags, value: [] },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TransitionAttributesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
