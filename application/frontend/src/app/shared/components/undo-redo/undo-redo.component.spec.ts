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
import * as fromUndoRedo from 'src/app/core/selectors/undo-redo.selectors';
import { UndoRedoComponent } from './undo-redo.component';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';

describe('UndoRedoComponent', () => {
  let component: UndoRedoComponent;
  let fixture: ComponentFixture<UndoRedoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [UndoRedoComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromUndoRedo.selectCanUndo, value: false },
            { selector: fromUndoRedo.selectCanRedo, value: false },
            { selector: fromScenario.selectChangeDisabled, value: false },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(UndoRedoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
