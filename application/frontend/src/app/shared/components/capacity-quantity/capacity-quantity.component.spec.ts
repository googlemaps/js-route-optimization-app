/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CapacityQuantityComponent } from './capacity-quantity.component';
import { MaterialModule } from 'src/app/material';
import { ReactiveFormsModule } from '@angular/forms';
import { UnitAbbreviationPipe } from '../../pipes';

describe('CapacityQuantityComponent', () => {
  let component: CapacityQuantityComponent;
  let fixture: ComponentFixture<CapacityQuantityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule],
      declarations: [UnitAbbreviationPipe, CapacityQuantityComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CapacityQuantityComponent);
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
