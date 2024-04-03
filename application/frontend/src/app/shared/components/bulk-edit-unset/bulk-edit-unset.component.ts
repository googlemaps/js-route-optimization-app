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
