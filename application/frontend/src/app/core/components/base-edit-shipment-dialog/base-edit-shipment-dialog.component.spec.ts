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
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import {
  MockFormVisitRequestLayerService,
  MockInfoWindowService,
  MockMapService,
} from 'src/test/service-mocks';
import { FormMapService, FormVisitRequestLayer } from '../../services';
import { FormVisitRequestInfoWindowService } from '../../services/form-visit-request-info-window.service';
import { BaseEditShipmentDialogComponent } from './base-edit-shipment-dialog.component';

describe('BaseEditShipmentDialogComponent', () => {
  let component: BaseEditShipmentDialogComponent;
  let fixture: ComponentFixture<BaseEditShipmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, SharedModule],
      declarations: [BaseEditShipmentDialogComponent],
    })
      .overrideProvider(FormMapService, { useValue: new MockMapService() })
      .overrideProvider(FormVisitRequestInfoWindowService, {
        useValue: new MockInfoWindowService(),
      })
      .overrideProvider(FormVisitRequestLayer, { useValue: new MockFormVisitRequestLayerService() })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(BaseEditShipmentDialogComponent);
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
