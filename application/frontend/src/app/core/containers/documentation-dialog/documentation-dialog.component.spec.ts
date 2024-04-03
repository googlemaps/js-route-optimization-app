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
