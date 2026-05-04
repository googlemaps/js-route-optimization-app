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
  @Input() solving: boolean;
  @Input() page: Page;
  @Input() solutionTime: number;
  @Input() routeCount: number;
  @Output() scenarioClick = new EventEmitter();
  @Output() shipmentsClick = new EventEmitter();
  @Output() solutionClick = new EventEmitter();
  @Output() vehiclesClick = new EventEmitter();
  @Output() addShipment = new EventEmitter();
  @Output() addVehicle = new EventEmitter();

  solveSeconds: number;
  label: string;
  pages = Page;

  get hasSolutionWarning(): boolean {
    return this.isSolutionStale || this.isSolutionIllegal;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.solutionTime) {
      this.solveSeconds = this.solutionTime / 1000;
    }
    if (changes.hasSolution || changes.solving) {
      if (this.solving) {
        this.label = 'Cancel';
      } else {
        this.label = this.hasSolution ? 'Regenerate' : 'Generate';
      }
    }
  }
}
