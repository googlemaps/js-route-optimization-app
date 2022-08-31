/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { SearchMode } from 'src/app/core/models/dispatcher.model';

export const SEARCH_MODE_LABELS = {
  [SearchMode.RETURN_FAST]: 'Return first good solution',
  [SearchMode.CONSUME_ALL_AVAILABLE_TIME]: 'Search for better solutions up to time limit',
};

export enum RelaxationLevelNames {
  RELAXATION_LEVEL_UNSPECIFIED = 'No relaxation',
  RELAX_VISIT_TIMES_AFTER_THRESHOLD = 'Relax visit time',
  RELAX_VISIT_TIMES_AND_SEQUENCE_AFTER_THRESHOLD = 'Relax visit time and sequences',
  RELAX_ALL_AFTER_THRESHOLD = 'Relax all',
}
