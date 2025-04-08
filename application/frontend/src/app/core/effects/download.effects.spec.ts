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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { hot } from 'jasmine-marbles';
import { Observable, of } from 'rxjs';
import { download, downloadFailure, downloadSuccess } from '../actions/download.actions';
import * as fromDownload from '../selectors/download.selectors';
import { FileService, MessageService } from '../services';
import { DownloadEffects } from './download.effects';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import * as fromUI from '../selectors/ui.selectors';
import { selectScenarioName } from '../selectors/dispatcher.selectors';

describe('DownloadEffects', () => {
  let actions$: Observable<any>;
  let effects: DownloadEffects;
  let store: MockStore<any>;
  let fileService: any;
  let _matDialog: jasmine.SpyObj<MatDialog>;
  let _snackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    fileService = jasmine.createSpyObj('fileService', ['download', 'zip']);

    TestBed.configureTestingModule({
      providers: [
        DownloadEffects,
        {
          provide: MatSnackBar,
          useValue: jasmine.createSpyObj('snackBar', ['openFromComponent', 'open']),
        },
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('matDialog', ['getDialogById', 'open']),
        },
        { provide: FileService, useValue: fileService },
        {
          provide: MessageService,
          useValue: jasmine.createSpyObj('messageService', ['error'], { messages: [] }),
        },
        provideMockStore({
          selectors: [
            { selector: fromDownload.selectDownload, value: null },
            { selector: fromUI.selectModal, value: null },
            { selector: selectScenarioName, value: '' },
          ],
        }),
        provideMockActions(() => actions$),
      ],
    });
    _snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    _matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    store = TestBed.inject(Store) as MockStore<any>;
    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject<DownloadEffects>(DownloadEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('startDownload$', () => {
    it('should dispatch success with scenario and solution', () => {
      store.overrideSelector(fromDownload.selectDownload, {
        scenario: {},
        solution: { routes: [] },
      });
      const name = jasmine.stringMatching(/^gmpro_\d{14}$/);
      const blob = {};
      (fileService.zip as jasmine.Spy).and.callFake(() => of(blob));
      (fileService.download as jasmine.Spy).and.callFake(() => null);
      actions$ = hot('-a---', { a: download() });

      const expected = hot('-b---', { b: downloadSuccess({ name, blob } as any) });
      expect(effects.startDownload$).toBeObservable(expected);
      expect(fileService.zip).toHaveBeenCalledTimes(1);
      expect(fileService.download).toHaveBeenCalledTimes(1);
    });

    it('should dispatch success with scenario, solution, and custom name', () => {
      store.overrideSelector(fromDownload.selectDownload, {
        scenario: {},
        solution: { routes: [] },
      });
      store.overrideSelector(selectScenarioName, 'custom scenario');
      const name = jasmine.stringMatching('custom scenario');
      const blob = {};
      (fileService.zip as jasmine.Spy).and.callFake(() => of(blob));
      (fileService.download as jasmine.Spy).and.callFake(() => null);
      actions$ = hot('-a---', { a: download() });

      const expected = hot('-b---', { b: downloadSuccess({ name, blob } as any) });
      expect(effects.startDownload$).toBeObservable(expected);
      expect(fileService.zip).toHaveBeenCalledTimes(1);
      expect(fileService.download).toHaveBeenCalledTimes(1);
    });

    it('should dispatch success without solution', () => {
      store.overrideSelector(fromDownload.selectDownload, { scenario: {} });
      const name = jasmine.stringMatching(/^gmpro_\d{14}$/);
      const blob = {};
      (fileService.zip as jasmine.Spy).and.callFake(() => of(blob));
      (fileService.download as jasmine.Spy).and.callFake(() => null);
      actions$ = hot('-a---', { a: download() });

      const expected = hot('-b---', { b: downloadSuccess({ name, blob } as any) });
      expect(effects.startDownload$).toBeObservable(expected);
      expect(fileService.zip).toHaveBeenCalledTimes(1);
      expect(fileService.download).toHaveBeenCalledTimes(1);
    });

    it('should dispatch success without solution and custom name', () => {
      store.overrideSelector(fromDownload.selectDownload, { scenario: {} });
      store.overrideSelector(selectScenarioName, 'custom scenario');
      const name = jasmine.stringMatching('custom scenario');
      const blob = {};
      (fileService.zip as jasmine.Spy).and.callFake(() => of(blob));
      (fileService.download as jasmine.Spy).and.callFake(() => null);
      actions$ = hot('-a---', { a: download() });

      const expected = hot('-b---', { b: downloadSuccess({ name, blob } as any) });
      expect(effects.startDownload$).toBeObservable(expected);
      expect(fileService.zip).toHaveBeenCalledTimes(1);
      expect(fileService.download).toHaveBeenCalledTimes(1);
    });

    it('should dispatch failure', () => {
      store.overrideSelector(fromDownload.selectDownload, {
        scenario: null,
        solution: { routes: [] },
      });
      actions$ = hot('-a---', { a: download() });
      const expected = hot('-b---', { b: downloadFailure({ error: jasmine.anything() }) });
      expect(effects.startDownload$).toBeObservable(expected);
    });
  });
});
