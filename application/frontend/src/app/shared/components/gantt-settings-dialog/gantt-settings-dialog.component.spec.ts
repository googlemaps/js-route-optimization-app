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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
} from '@angular/material/legacy-dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { Timezone } from '../../models';
import { GanttSettingsDialogComponent } from './gantt-settings-dialog.component';

@Component({
  selector: 'app-timezone-edit',
  template: '',
})
class MockTimezoneEditComponent {
  @Input() currentTimezone: Timezone;
  @Output() timezoneSelected = new EventEmitter<Timezone>();
}

describe('GanttSettingsDialogComponent', () => {
  let component: GanttSettingsDialogComponent;
  let fixture: ComponentFixture<GanttSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule],
      declarations: [MockTimezoneEditComponent, GanttSettingsDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            description: 'UTC',
            offset: 0,
            label: '\u00b10:00',
          },
        },
        {
          provide: MatDialogRef,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GanttSettingsDialogComponent);
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
