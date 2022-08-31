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
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import { MaterialModule } from 'src/app/material';
import { FilterDateFormComponent } from './filter-date-form.component';

describe('FilterDateFormComponent', () => {
  let component: FilterDateFormComponent;
  let fixture: ComponentFixture<FilterDateFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, NoopAnimationsModule, MaterialModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: fromConfig.selectTimezoneOffset, value: 0 }],
        }),
      ],
      declarations: [FilterDateFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterDateFormComponent);
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
