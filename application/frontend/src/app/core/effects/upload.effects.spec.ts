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

import { TestBed } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';
import { Observable, of } from 'rxjs';
import { State } from 'src/app/reducers';
import { UploadActions } from '../actions';
import { closeDialog } from '../actions/upload.actions';
import { UploadDialogComponent } from '../containers';
import { Modal } from '../models';
import * as fromUI from '../selectors/ui.selectors';
import { MessageService, NormalizationService } from '../services';
import { UploadEffects } from './upload.effects';

describe('UploadEffects', () => {
  let actions$: Observable<any>;
  let effects: UploadEffects;
  let _store: MockStore<State>;
  let dialog: jasmine.SpyObj<MatDialogRef<UploadDialogComponent>>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let _normalizationService: jasmine.SpyObj<NormalizationService>;

  beforeEach(() => {
    dialog = jasmine.createSpyObj('dialog', ['close', 'afterClosed']);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MessageService,
          useValue: jasmine.createSpyObj('messageService', ['error', 'warning'], { messages: [] }),
        },
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('snackBar', ['open']),
        },
        UploadEffects,
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('matDialog', ['getDialogById', 'open']),
        },
        {
          provide: NormalizationService,
          useValue: jasmine.createSpyObj('normalizationService', ['normalizeScenario']),
        },
        provideMockStore({
          selectors: [{ selector: fromUI.selectModal, value: Modal.Upload }],
        }),
        provideMockActions(() => actions$),
      ],
    });

    matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    _normalizationService = TestBed.inject(
      NormalizationService
    ) as jasmine.SpyObj<NormalizationService>;
    _store = TestBed.inject(Store) as MockStore<State>;
    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject<UploadEffects>(UploadEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('openDialog$', () => {
    it('should open upload dialog', () => {
      matDialog.getDialogById.and.callFake(() => null);
      matDialog.open.and.callFake(() => dialog as any);
      dialog.afterClosed.and.callFake(() => of(null));

      actions$ = cold('-a-----', { a: UploadActions.openDialog() });
      effects.openDialog$.subscribe(() => {
        expect(matDialog.getDialogById).toHaveBeenCalledWith(Modal.Upload);
        expect(matDialog.open).toHaveBeenCalledWith(UploadDialogComponent, {
          id: Modal.Upload,
          width: jasmine.any(String),
        });
      });
    });

    it('dialog close should dispatch close dialog', () => {
      matDialog.getDialogById.and.callFake(() => null);
      matDialog.open.and.callFake(() => dialog as any);
      dialog.afterClosed.and.callFake(() => of(null));

      actions$ = cold('-a-----', { a: UploadActions.openDialog() });
      expect(effects.openDialog$).toBeObservable(cold('-a---', { a: closeDialog() }));
    });
  });
});
