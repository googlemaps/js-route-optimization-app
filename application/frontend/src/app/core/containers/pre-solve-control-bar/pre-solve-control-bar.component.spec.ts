/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import * as fromUndoRedo from '../../selectors/undo-redo.selectors';
import { PreSolveControlBarComponent } from './pre-solve-control-bar.component';

@Component({
  selector: 'app-map-toggle-button',
  template: '',
})
class MockMapToggleButtonComponent {
  @Output() toggleMap = new EventEmitter<void>();
}

@Component({
  selector: 'app-pre-solve-global-settings',
  template: '',
})
class MockPreSolveGlobalSettingsComponent {}

describe('PreSolveControlBarComponent', () => {
  let component: PreSolveControlBarComponent;
  let fixture: ComponentFixture<PreSolveControlBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, MaterialModule, NoopAnimationsModule, RouterTestingModule],
      declarations: [
        MockMapToggleButtonComponent,
        MockPreSolveGlobalSettingsComponent,
        PreSolveControlBarComponent,
      ],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: fromUI.selectPage, value: null },
            { selector: fromUndoRedo.selectCanUndo, value: false },
            { selector: fromUndoRedo.selectCanRedo, value: false },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(PreSolveControlBarComponent);
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
