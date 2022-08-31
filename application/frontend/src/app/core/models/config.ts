/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { MapConfig } from './map-config';
import { MessagesConfig } from './messages-config';
import { Timezone } from 'src/app/shared/models';

export interface Config {
  backendApi: {
    apiRoot: string;
  };
  storageApi: {
    apiRoot: string;
    allowUserStorage: boolean;
  };
  unitAbbreviations?: { [unit: string]: string };
  /**
   * Units by type
   * @remaks
   * Options for capacity quantities and demands used by the scenario builder.
   *
   * @example
   * ```
   * {
   *   weight: ['grams', 'kilograms'],
   *   volume: ['milliliters', 'liters']
   * }
   * ```
   */
  map: MapConfig;
  messages: MessagesConfig;
  timezone: Timezone;
  allowExperimentalFeatures?: boolean;
}
