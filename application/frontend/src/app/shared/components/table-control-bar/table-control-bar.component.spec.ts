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
