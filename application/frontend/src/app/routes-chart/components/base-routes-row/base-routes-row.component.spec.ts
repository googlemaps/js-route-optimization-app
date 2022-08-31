/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';

import { BaseRoutesRowComponent } from './base-routes-row.component';
import { selectAllowExperimentalFeatures } from '../../../core/selectors/config.selectors';

describe('BaseRoutesRowComponent', () => {
  let component: BaseRoutesRowComponent;
  let fixture: ComponentFixture<BaseRoutesRowComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule, StoreModule.forRoot({})],
      declarations: [BaseRoutesRowComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectAllowExperimentalFeatures, value: false }],
        }),
      ],
    });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(BaseRoutesRowComponent);
    component = fixture.componentInstance;
    component.vehicle = { id: 1 };
    component.vehicleOperator = '';
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
