/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { DispatcherService } from './dispatcher.service';
import { ShipmentModel } from '../models';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  constructor(private dispatcherService: DispatcherService) {}

  validateSolutionFormat(data: any): Error | null {
    try {
      this.dispatcherService.objectToSolution(data);
    } catch (error) {
      return error;
    }
    return null;
  }

  validateScenarioFormat(data: any): Error | null {
    try {
      const scenario = this.dispatcherService.objectToScenario(data);
      ShipmentModel.fromObject(scenario?.model);
    } catch (error) {
      return error;
    }
    return null;
  }
}
