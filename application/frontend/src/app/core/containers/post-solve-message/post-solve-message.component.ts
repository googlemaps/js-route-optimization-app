/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import DenormalizeSelectors from '../../selectors/denormalize.selectors';

@Component({
  selector: 'app-post-solve-message',
  templateUrl: './post-solve-message.component.html',
  styleUrls: ['./post-solve-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostSolveMessageComponent implements OnInit {
  isSolutionStale$: Observable<boolean>;
  isSolutionIllegal$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.isSolutionStale$ = this.store.pipe(select(DenormalizeSelectors.selectIsSolutionStale));
    this.isSolutionIllegal$ = this.store.pipe(select(DenormalizeSelectors.selectIsSolutionIllegal));
  }
}
