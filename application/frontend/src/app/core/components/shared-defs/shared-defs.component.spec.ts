/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedDefsComponent } from './shared-defs.component';

describe('SharedDefsComponent', () => {
  let component: SharedDefsComponent;
  let fixture: ComponentFixture<SharedDefsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SharedDefsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SharedDefsComponent);
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
