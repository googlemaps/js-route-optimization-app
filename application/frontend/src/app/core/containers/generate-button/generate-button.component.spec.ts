/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ValidationService } from '../../services';
import { GenerateButtonComponent } from './generate-button.component';

@Component({
  selector: 'app-base-generate-button',
  template: '',
})
class MockBaseGenerateButtonComponent {
  @Input() disabled = false;
  @Input() label = 'Generate';
  @Input() solving = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() solve = new EventEmitter<void>();
}

describe('GenerateButtonComponent', () => {
  let component: GenerateButtonComponent;
  let fixture: ComponentFixture<GenerateButtonComponent>;
  let _validationService: jasmine.SpyObj<ValidationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockBaseGenerateButtonComponent, GenerateButtonComponent],
      providers: [
        {
          provide: ValidationService,
          useValue: jasmine.createSpyObj('validationService', ['validate']),
        },
        provideMockStore(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GenerateButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    _validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
