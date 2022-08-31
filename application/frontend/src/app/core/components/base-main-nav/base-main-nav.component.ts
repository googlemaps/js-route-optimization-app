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
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Page } from '../../models';

@Component({
  selector: 'app-base-main-nav',
  templateUrl: './base-main-nav.component.html',
  styleUrls: ['./base-main-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseMainNavComponent implements OnChanges {
  @Input() allowExperimentalFeatures: boolean;
  @Input() disabled: boolean;
  @Input() hasSolution: boolean;
  @Input() isSolutionStale: boolean;
  @Input() isSolutionIllegal: boolean;
  @Input() selectedShipmentCount: number;
  @Input() selectedVehicleCount: number;
  @Input() selectedVehicleOperatorCount: number;
  @Input() solving: boolean;
  @Input() page: Page;
  @Output() shipmentsClick = new EventEmitter();
  @Output() solutionClick = new EventEmitter();
  @Output() vehiclesClick = new EventEmitter();
  @Output() vehicleOperatorsClick = new EventEmitter();

  label: string;
  pages = Page;

  get hasSolutionWarning(): boolean {
    return this.isSolutionStale || this.isSolutionIllegal;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasSolution || changes.solving) {
      if (this.solving) {
        this.label = 'Cancel';
      } else {
        this.label = this.hasSolution ? 'Regenerate' : 'Generate';
      }
    }
  }
}
