/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
