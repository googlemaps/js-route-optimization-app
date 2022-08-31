/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideBarComponent } from './side-bar.component';

@Component({
  selector: 'app-logo',
  template: '',
})
class MockLogoComponent {}

@Component({
  selector: 'app-main-nav',
  template: '',
})
class MockMainNavComponent {}

@Component({
  selector: 'app-main-actions',
  template: '',
})
class MockMainActionsComponent {}

describe('SideBarComponent', () => {
  let component: SideBarComponent;
  let fixture: ComponentFixture<SideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockLogoComponent,
        MockMainNavComponent,
        MockMainActionsComponent,
        SideBarComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarComponent);
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
