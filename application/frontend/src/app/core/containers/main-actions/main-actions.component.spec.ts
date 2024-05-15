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
import { MatIconRegistry } from '@angular/material/icon';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import * as fromDownload from '../../selectors/download.selectors';
import { MainActionsComponent } from './main-actions.component';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import { selectPage } from '../../selectors/ui.selectors';

describe('MainActionsComponent', () => {
  let component: MainActionsComponent;
  let fixture: ComponentFixture<MainActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromDownload.selectHasDownload, value: false },
            { selector: fromConfig.selectHasStorageApiRoot, value: false },
            { selector: fromSolution.selectHasSolution, value: false },
            { selector: fromConfig.selectAllowUserStorage, value: false },
            { selector: selectPage, value: null },
          ],
        }),
      ],
      declarations: [MainActionsComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(MainActionsComponent);
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
