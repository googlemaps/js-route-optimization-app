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
import { BaseRoutesRowColumnHeaderComponent } from './base-routes-row-column-header.component';

describe('BaseRoutesRowColumnHeaderComponent', () => {
  let component: BaseRoutesRowColumnHeaderComponent;
  let fixture: ComponentFixture<BaseRoutesRowColumnHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [BaseRoutesRowColumnHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseRoutesRowColumnHeaderComponent);
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
