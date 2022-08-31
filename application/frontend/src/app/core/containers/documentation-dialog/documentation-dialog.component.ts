/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-documentation-dialog',
  templateUrl: './documentation-dialog.component.html',
  styleUrls: ['./documentation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationDialogComponent {}
