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

import { ScenarioSolutionHelpDialogComponent } from './scenario-solution-help-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from 'src/test/material-fakes';

describe('ScenarioSolutionHelpDialogComponent', () => {
  let component: ScenarioSolutionHelpDialogComponent;
  let fixture: ComponentFixture<ScenarioSolutionHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [ScenarioSolutionHelpDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(ScenarioSolutionHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
