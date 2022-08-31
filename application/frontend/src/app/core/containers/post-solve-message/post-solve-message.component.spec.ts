/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
