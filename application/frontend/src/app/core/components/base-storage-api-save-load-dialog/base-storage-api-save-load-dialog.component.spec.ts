/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { MockStorageApiService } from 'src/test/service-mocks';
import { selectStorageApi } from '../../selectors/config.selectors';
import { StorageApiService } from '../../services';

import { BaseStorageApiSaveLoadDialogComponent } from './base-storage-api-save-load-dialog.component';

describe('BaseStorageApiSaveLoadDialogComponent', () => {
  let component: BaseStorageApiSaveLoadDialogComponent;
  let fixture: ComponentFixture<BaseStorageApiSaveLoadDialogComponent>;
  let _matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseStorageApiSaveLoadDialogComponent],
      imports: [FormsModule, HttpClientTestingModule, NoopAnimationsModule, MaterialModule],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('matDialog', ['open']) },
        { provide: StorageApiService, use: MockStorageApiService },
        provideMockStore({
          selectors: [{ selector: selectStorageApi, value: { apiRoot: null } }],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();
    _matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    fixture = TestBed.createComponent(BaseStorageApiSaveLoadDialogComponent);
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
