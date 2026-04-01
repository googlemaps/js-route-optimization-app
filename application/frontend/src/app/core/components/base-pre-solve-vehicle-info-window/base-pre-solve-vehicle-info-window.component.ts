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
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Vehicle } from '../../models';

@Component({
  selector: 'app-base-pre-solve-vehicle-info-window',
  templateUrl: './base-pre-solve-vehicle-info-window.component.html',
  styleUrl: './base-pre-solve-vehicle-info-window.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasePreSolveVehicleInfoWindowComponent implements OnChanges {
  @Input() vehicle: Vehicle;

  loadLimitsNames: string[] = [];
  loadLimitsValues: string[] = [];

  ngOnChanges(_changes: SimpleChanges): void {
    this.getFormattedLoadLimits();
  }

  getFormattedLoadLimits(): void {
    this.loadLimitsNames = [];
    this.loadLimitsValues = [];

    if (!this.vehicle) {
      return;
    }

    Object.keys(this.vehicle.loadLimits || {}).forEach((key) => {
      if (this.vehicle.loadLimits[key].maxLoad) {
        this.loadLimitsNames.push(key);
        this.loadLimitsValues.push(`${this.vehicle.loadLimits[key].maxLoad}`);
      }
    });
  }
}
