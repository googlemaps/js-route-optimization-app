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
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { Timezone } from 'src/app/shared/models';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { selectTimezone } from '../../selectors/config.selectors';
import RequestSettingsSelectors from '../../selectors/request-settings.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import { PreSolveGlobalSettingsComponent } from './pre-solve-global-settings.component';

@Component({
  selector: 'app-timezone-edit',
  template: '',
})
class MockTimezoneEditComponent {
  @Input() currentTimezone: Timezone;
  @Output() timezoneSelected = new EventEmitter<Timezone>();
}

describe('PreSolveGlobalSettingsComponent', () => {
  let component: PreSolveGlobalSettingsComponent;
  let fixture: ComponentFixture<PreSolveGlobalSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      declarations: [MockTimezoneEditComponent, PreSolveGlobalSettingsComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: RequestSettingsSelectors.selectLabel, value: '' },
            { selector: RequestSettingsSelectors.selectInjectedSolution, value: false },
            { selector: RequestSettingsSelectors.selectInjectedModelConstraint, value: null },
            { selector: RequestSettingsSelectors.selectTimeout, value: 0 },
            { selector: RequestSettingsSelectors.selectSearchMode, value: 0 },
            { selector: RequestSettingsSelectors.selectTimeThreshold, value: 0 },
            { selector: RequestSettingsSelectors.selectTraffic, value: false },
            { selector: fromSolution.selectHasSolution, value: false },
            {
              selector: selectTimezone,
              value: {
                description: '',
                offset: 0,
                label: '',
              },
            },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(PreSolveGlobalSettingsComponent);
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
