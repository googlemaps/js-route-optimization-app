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

import { PrecedenceRulesDialogComponent } from './precedence-rules-dialog.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/material';
import { provideMockStore } from '@ngrx/store/testing';
import * as shipmentSelectors from '../../../core/selectors/shipment.selectors';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import * as fromShipment from '../../reducers/shipment.reducer';

describe('PrecedenceRulesDialogComponent', () => {
  let component: PrecedenceRulesDialogComponent;
  let fixture: ComponentFixture<PrecedenceRulesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PrecedenceRulesDialogComponent],
      imports: [FormsModule, ReactiveFormsModule, SharedModule, MaterialModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: ShipmentModelSelectors.selectPrecedenceRules, value: [] }],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    spyOn(fromShipment.adapter, 'getSelectors').and.returnValue([
      () => [],
      () => {},
      () => [],
      () => 0,
    ] as any);

    fixture = TestBed.createComponent(PrecedenceRulesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
