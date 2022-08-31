/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { MaterialModule } from 'src/app/material';
import { FakeMatIconRegistry } from 'src/test/material-fakes';

import { BaseRegenerateConfirmationDialogComponent } from './base-regenerate-confirmation-dialog.component';

describe('BaseRegenerateConfirmationDialogComponent', () => {
  let component: BaseRegenerateConfirmationDialogComponent;
  let fixture: ComponentFixture<BaseRegenerateConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [BaseRegenerateConfirmationDialogComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BaseRegenerateConfirmationDialogComponent);
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
