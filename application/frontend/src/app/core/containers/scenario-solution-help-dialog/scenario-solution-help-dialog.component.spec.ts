/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScenarioSolutionHelpDialogComponent } from './scenario-solution-help-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';

describe('ScenarioSolutionHelpDialogComponent', () => {
  let component: ScenarioSolutionHelpDialogComponent;
  let fixture: ComponentFixture<ScenarioSolutionHelpDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScenarioSolutionHelpDialogComponent],
      providers: [{ provide: MatDialogRef, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenarioSolutionHelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
