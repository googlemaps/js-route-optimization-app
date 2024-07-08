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

import { ScenarioPlanningComponent } from './scenario-planning.component';
import { Component } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/material';
import { provideMockStore } from '@ngrx/store/testing';

@Component({
  selector: 'app-pre-solve-shipment-model-settings',
  template: '',
})
export class MockPreSolveShipmentModelSettingsComponent {}

@Component({
  selector: 'app-pre-solve-global-settings',
  template: '',
})
export class MockPreSolveGlobalSettingsComponent {}

@Component({
  selector: 'app-pre-solve-settings',
  template: '',
})
export class MockPreSolveSettingsComponent {}

describe('ScenarioPlanningComponent', () => {
  let component: ScenarioPlanningComponent;
  let fixture: ComponentFixture<ScenarioPlanningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, MaterialModule],
      declarations: [
        ScenarioPlanningComponent,
        MockPreSolveShipmentModelSettingsComponent,
        MockPreSolveGlobalSettingsComponent,
        MockPreSolveSettingsComponent,
      ],
      providers: [provideMockStore()],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenarioPlanningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
