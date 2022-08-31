/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
