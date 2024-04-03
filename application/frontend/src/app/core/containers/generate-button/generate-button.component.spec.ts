/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
