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

@Component({
  selector: 'app-top-bar',
  template: '',
})
export class MockTopBarComponent {
  @Input() started: boolean;
}

describe('AppComponent', () => {
  let actions$: Observable<any>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockBodyComponent,
        MockSharedDefsComponent,
        MockSideBarComponent,
        MockTopBarComponent,
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
