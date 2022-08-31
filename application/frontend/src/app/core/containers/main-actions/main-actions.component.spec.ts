/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
