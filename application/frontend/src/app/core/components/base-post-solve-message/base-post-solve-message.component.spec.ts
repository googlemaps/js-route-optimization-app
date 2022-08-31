/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePostSolveMessageComponent } from './base-post-solve-message.component';

describe('BasePostSolveMessageComponent', () => {
  let component: BasePostSolveMessageComponent;
  let fixture: ComponentFixture<BasePostSolveMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasePostSolveMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BasePostSolveMessageComponent);
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
