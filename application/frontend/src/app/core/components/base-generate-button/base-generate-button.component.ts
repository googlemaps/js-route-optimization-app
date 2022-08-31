/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-base-generate-button',
  templateUrl: './base-generate-button.component.html',
  styleUrls: ['./base-generate-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseGenerateButtonComponent {
  @Input() disabled = false;
  @Input() label = 'Generate';
  @Input() solving = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() solve = new EventEmitter<void>();

  get color(): string {
    return this.solving ? 'warn' : 'primary';
  }

  get svgIcon(): string {
    return this.solving ? 'clear' : 'navigate_next';
  }

  onClick(): void {
    if (this.solving) {
      this.cancel.emit();
    } else {
      this.solve.emit();
    }
  }
}
