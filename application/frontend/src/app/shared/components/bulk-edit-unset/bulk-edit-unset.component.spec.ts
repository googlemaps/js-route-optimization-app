/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEditUnsetComponent } from './bulk-edit-unset.component';

describe('BulkEditUnsetComponent', () => {
  let component: BulkEditUnsetComponent;
  let fixture: ComponentFixture<BulkEditUnsetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BulkEditUnsetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkEditUnsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
