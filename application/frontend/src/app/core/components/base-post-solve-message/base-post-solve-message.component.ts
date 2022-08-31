/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'app-base-post-solve-message',
  templateUrl: './base-post-solve-message.component.html',
  styleUrls: ['./base-post-solve-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasePostSolveMessageComponent {
  @Input() isSolutionStale = false;
  @Input() isSolutionIllegal = false;
}
