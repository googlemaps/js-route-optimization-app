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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
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
