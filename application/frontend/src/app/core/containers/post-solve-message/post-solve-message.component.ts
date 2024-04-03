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
