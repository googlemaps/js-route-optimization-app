/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  ViewEncapsulation,
} from '@angular/core';

@Component({
  selector: 'app-bulk-edit-unset',
  templateUrl: './bulk-edit-unset.component.html',
  styleUrls: ['./bulk-edit-unset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BulkEditUnsetComponent {
  @Input() showText = false;
  @Input() isUnset: boolean;
  @Input() fieldName: string;
  @Output() unsetEvent = new EventEmitter<{ field: string }>();

  onClick(): void {
    this.unsetEvent.emit({
      field: this.fieldName,
    });
  }
}
