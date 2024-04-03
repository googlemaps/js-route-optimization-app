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
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { ActiveFilter } from '../../models';
import { TableControlBarComponent } from './table-control-bar.component';

@Component({
  selector: 'app-filter-list',
  template: '',
})
class MockFilterListComponent {
  @Input() filters: ActiveFilter[];
  @Output() editFilter = new EventEmitter<{ filter: ActiveFilter; element: HTMLElement }>();
  @Output() removeFilter = new EventEmitter<ActiveFilter>();
}

describe('TableControlBarComponent', () => {
  let component: TableControlBarComponent;
  let fixture: ComponentFixture<TableControlBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [MockFilterListComponent, TableControlBarComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(TableControlBarComponent);
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
