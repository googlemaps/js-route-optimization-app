/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import RequestSettingsSelectors from 'src/app/core/selectors/request-settings.selectors';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { EditGlobalRelaxationConstraintsDialogComponent } from './edit-global-relaxation-constraints-dialog.component';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';

describe('EditGlobalRelaxationConstraintsDialogComponent', () => {
  let component: EditGlobalRelaxationConstraintsDialogComponent;
  let fixture: ComponentFixture<EditGlobalRelaxationConstraintsDialogComponent>;
  let store: Store;
  let matDialogRef: jasmine.SpyObj<MatDialogRef<EditGlobalRelaxationConstraintsDialogComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule, SharedModule, StoreModule.forRoot({})],
      declarations: [EditGlobalRelaxationConstraintsDialogComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: RequestSettingsSelectors.selectGlobalConstraintRelaxations, value: null },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: [0, 0] },
          ],
        }),
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('matDialogRef', ['close', 'backdropClick']),
        },
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(EditGlobalRelaxationConstraintsDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

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
