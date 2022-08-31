/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material';
import { ActiveFilter } from '../../models';
import { FilterComponent } from './filter.component';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;
  let _matDialogRef: jasmine.SpyObj<MatDialogRef<FilterComponent, ActiveFilter>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('matDialogRef', ['close']) },
      ],
      declarations: [FilterComponent],
    }).compileComponents();
    _matDialogRef = TestBed.inject(MatDialogRef) as any;

    fixture = TestBed.createComponent(FilterComponent);
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
