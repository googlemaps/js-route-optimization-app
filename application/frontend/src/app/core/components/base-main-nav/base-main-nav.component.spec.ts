/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material';
import { BaseMainNavComponent } from './base-main-nav.component';

@Component({
  selector: 'app-generate-button',
  template: '',
})
class MockGenerateButtonComponent {
  @Input() disabled = false;
  @Input() label = 'Generate';
  @Input() prompt = false;
  @Input() solving = false;
}

@Component({
  selector: 'app-post-solve-message',
  template: '',
})
class MockPostSolveMessageComponent {}

@Component({
  selector: 'app-pre-solve-message',
  template: '',
})
class MockPreSolveMessageComponent {}

describe('MainNavComponent', () => {
  let component: BaseMainNavComponent;
  let fixture: ComponentFixture<BaseMainNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [
        MockGenerateButtonComponent,
        MockPostSolveMessageComponent,
        MockPreSolveMessageComponent,
        BaseMainNavComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseMainNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
