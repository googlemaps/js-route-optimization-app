/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Scenario } from './scenario';
import { Solution } from './solution';

export interface StorageFile {
  name: string;
  fileContent: any;
}

export interface StoredSolution {
  name: string;
  scenario: Scenario;
  solution: Solution;
}

export interface SearchResult {
  name: string;
  dateModified: string;
  timeCreated: string;
  pageToken?: {
    prefix: string;
    maxResutls: number;
    autoPaginate: boolean;
    pageToken: string;
  };
}

export interface ScenarioSolutionPair {
  scenario: Scenario;
  solution: Solution;
}
