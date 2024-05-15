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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import DenormalizeSelectors from '../../selectors/denormalize.selectors';
import { PostSolveMessageComponent } from './post-solve-message.component';

@Component({
  selector: 'app-base-post-solve-message',
  template: '',
})
class BasePostSolveMessageComponent {
  @Input() isSolutionStale = false;
  @Input() isSolutionIllegal = false;
}

describe('PostSolveMessageComponent', () => {
  let component: PostSolveMessageComponent;
  let fixture: ComponentFixture<PostSolveMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: DenormalizeSelectors.selectIsSolutionStale, value: false },
            { selector: DenormalizeSelectors.selectIsSolutionIllegal, value: false },
          ],
        }),
      ],
      declarations: [BasePostSolveMessageComponent, PostSolveMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostSolveMessageComponent);
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
