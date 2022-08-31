/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
