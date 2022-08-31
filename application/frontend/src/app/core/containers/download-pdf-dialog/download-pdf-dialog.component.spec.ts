/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { MaterialModule } from 'src/app/material';
import * as fromDownload from 'src/app/core/selectors/download.selectors';
import * as fromRouteLayer from 'src/app/core/selectors/route-layer.selectors';
import VisitSelectors from '../../selectors/visit.selectors';

import { DownloadPdfDialogComponent } from './download-pdf-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PdfDownloadService } from '../../services/pdf-download.service';
import { MockPdfDownloadService } from 'src/test/service-mocks';

describe('DownloadPdfDialogComponent', () => {
  let component: DownloadPdfDialogComponent;
  let fixture: ComponentFixture<DownloadPdfDialogComponent>;
  let store: Store;
  let matDialogRef: jasmine.SpyObj<MatDialogRef<DownloadPdfDialogComponent>>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        StoreModule.forRoot({}),
      ],
      declarations: [DownloadPdfDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('matDialogRef', ['close', 'backdropClick']),
        },
        provideMockStore({
          selectors: [
            { selector: fromDownload.selectDownload, value: {} },
            { selector: fromRouteLayer.selectRoutes, value: [] },
            { selector: fromRouteLayer.selectFilteredRoutesSelected, value: [] },
            { selector: VisitSelectors.selectVisitRequests, value: {} },
          ],
        }),
      ],
    }).overrideProvider(PdfDownloadService, { useValue: new MockPdfDownloadService() });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(DownloadPdfDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

    component.csvData = [{}];

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();

    matDialogRef = TestBed.inject(MatDialogRef) as any;
    const mockMouseEvent = jasmine.createSpyObj('mouseEvent', [
      'stopImmediatePropagation',
    ]) as MouseEvent;
    matDialogRef.backdropClick.and.callFake(() => of(mockMouseEvent));
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
