/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material';
import { ControlContainer, UntypedFormArray, ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { InjectedRelaxationConstraintsFormComponent } from './injected-relaxation-constraints-form.component';

const controlContainer = new UntypedFormArray([]);

describe('InjectedRelaxationConstraintsFormComponent', () => {
  let component: InjectedRelaxationConstraintsFormComponent;
  let fixture: ComponentFixture<InjectedRelaxationConstraintsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule],
      declarations: [InjectedRelaxationConstraintsFormComponent],
      providers: [{ provide: ControlContainer, useValue: controlContainer }],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(InjectedRelaxationConstraintsFormComponent);
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
