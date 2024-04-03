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
