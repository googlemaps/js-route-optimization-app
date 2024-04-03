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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from 'src/app/core/services';
import { MaterialModule } from 'src/app/material';
import { VisitFormComponent } from './visit-form.component';

describe('VisitFormComponent', () => {
  let component: VisitFormComponent;
  let fixture: ComponentFixture<VisitFormComponent>;
  let _validationService: jasmine.SpyObj<ValidationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [VisitFormComponent],
      providers: [
        {
          provide: ValidationService,
          useValue: jasmine.createSpyObj('validationService', ['validateVisit']),
        },
      ],
    }).compileComponents();

    _validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;

    fixture = TestBed.createComponent(VisitFormComponent);
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
