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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-map-type-button',
  templateUrl: './map-type-button.component.html',
  styleUrls: ['./map-type-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapTypeButtonComponent {
  @Input() type = false;
  @Output() typeChange = new EventEmitter<boolean>();
  @HostBinding('class.app-map-panel') readonly mapPanel = true;

  get icon(): string {
    return this.type ? 'map' : 'satellite';
  }

  get title(): string {
    return this.type ? 'Show map' : 'Show satellite';
  }

  toggle(): void {
    this.type = !this.type;
    this.typeChange.emit(this.type);
  }
}
