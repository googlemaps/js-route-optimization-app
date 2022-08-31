/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasePreSolveMessageComponent } from './base-pre-solve-message.component';

describe('BasePreSolveMessageComponent', () => {
  let component: BasePreSolveMessageComponent;
  let fixture: ComponentFixture<BasePreSolveMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasePreSolveMessageComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BasePreSolveMessageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
