/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IInjectedSolution, ITimestamp, RelaxationLevel } from 'src/app/core/models';
import {
  IDuration,
  IShipmentRoute,
  ScenarioSearchMode,
  ScenarioSolvingMode,
} from './dispatcher.model';

export interface RequestSettings {
  firstSolutionRoutes: IShipmentRoute[];
  injectedModelConstraint: IInjectedSolution;
  injectedSolution: boolean;
  label: string;
  interpretInjectedSolutionsUsingLabels: boolean;
  populateTransitionPolylines: boolean;
  allowLargeDeadlineDespiteInterruptionRisk: boolean;
  useGeodesicDistances: boolean;
  geodesicMetersPerSecond: number;
  timeout: IDuration;
  searchMode: ScenarioSearchMode;
  solvingMode: ScenarioSolvingMode;
  timeThreshold: string | number;
  traffic: boolean;
  constraints: TimeThreshold[];
}

export interface TimeThreshold {
  index?: number;
  level: RelaxationLevel;
  thresholdTime: ITimestamp;
  thresholdVisits: number;
  vehicleIndices?: number[];
}
