/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadDemandsFormComponent } from './load-demands-form.component';
import { MaterialModule } from 'src/app/material';
import { ControlContainer, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from 'src/test/material-fakes';

const controlContainer = new FormArray([]);

describe('LoadDemandsFormComponent', () => {
  let component: LoadDemandsFormComponent;
  let fixture: ComponentFixture<LoadDemandsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule],
      declarations: [LoadDemandsFormComponent],
      providers: [{ provide: ControlContainer, useValue: controlContainer }],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(LoadDemandsFormComponent);
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
