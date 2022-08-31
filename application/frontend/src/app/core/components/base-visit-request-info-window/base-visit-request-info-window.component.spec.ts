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
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { BaseVisitRequestInfoWindowComponent } from './base-visit-request-info-window.component';

describe('BaseVisitRequestInfoWindowComponent', () => {
  let component: BaseVisitRequestInfoWindowComponent;
  let fixture: ComponentFixture<BaseVisitRequestInfoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, RouterTestingModule, SharedModule],
      declarations: [BaseVisitRequestInfoWindowComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(BaseVisitRequestInfoWindowComponent);
    component = fixture.componentInstance;
    component.vehicle = null;
    component.visit = null;

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
