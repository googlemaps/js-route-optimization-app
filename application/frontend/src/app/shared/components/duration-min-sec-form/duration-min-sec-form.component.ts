/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-duration-min-sec-form',
  templateUrl: './duration-min-sec-form.component.html',
  styleUrls: ['./duration-min-sec-form.component.scss'],
})
export class DurationMinSecFormComponent {
  @Input() appearance = 'legacy';
  @Input() parentFormGroup: UntypedFormGroup;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() labelName: string;
  @Input() showUnset: boolean;
  @Input() isUnset: boolean;
  @Input() fieldName: string;
  @Output() unsetEvent = new EventEmitter<{ field: string }>();

  onUnsetChange(result: { field: string }): void {
    this.unsetEvent.emit(result);
  }
}
