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
