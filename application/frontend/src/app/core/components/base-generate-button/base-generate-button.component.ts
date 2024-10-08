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
