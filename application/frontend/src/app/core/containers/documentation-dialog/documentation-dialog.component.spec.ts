/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { DocumentationDialogComponent } from './documentation-dialog.component';

@Component({
  selector: 'app-base-documentation-dialog',
  template: '',
})
class MockBaseDocumentationDialogComponent {}

describe('DocumentationDialogComponent', () => {
  let component: DocumentationDialogComponent;
  let fixture: ComponentFixture<DocumentationDialogComponent>;
  let store: Store;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [StoreModule.forRoot({})],
      declarations: [MockBaseDocumentationDialogComponent, DocumentationDialogComponent],
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(DocumentationDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
