/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import { Page } from '../../models';
import DispatcherApiSelectors from '../../selectors/dispatcher-api.selectors';
import * as fromUI from '../../selectors/ui.selectors';
import { AppComponent } from './app.component';

@Component({
  selector: 'app-side-bar',
  template: '',
})
class MockSideBarComponent {}

@Component({
  selector: 'app-body',
  template: '',
})
class MockBodyComponent {
  @Input() page: Page;
  @Input() hasMap = false;
  @Input() loading = false;
  @Input() splitSizes: number[];
  @Output() splitSizesChange = new EventEmitter<number[]>();
}

@Component({
  selector: 'app-shared-defs',
  template: '',
})
class MockSharedDefsComponent {}

describe('AppComponent', () => {
  let actions$: Observable<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockBodyComponent,
        MockSharedDefsComponent,
        MockSideBarComponent,
        AppComponent,
      ],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromUI.selectStarted, value: false },
            { selector: fromUI.selectHasMap, value: false },
            { selector: DispatcherApiSelectors.selectOptimizeToursLoading, value: false },
            { selector: fromUI.selectPage, value: null },
            { selector: fromUI.selectSplitSizes, value: null },
          ],
        }),
        provideMockActions(() => actions$),
      ],
    }).compileComponents();

    actions$ = TestBed.inject(Actions);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);

    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();

    fixture.destroy();
  });
});
