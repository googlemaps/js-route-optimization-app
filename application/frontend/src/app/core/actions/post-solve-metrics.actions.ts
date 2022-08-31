/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';

export const showSkippedShipments = createAction('[Post-Solve Metrics] Show Skipped Shipments');

export const showMetadataForRoute = createAction(
  '[Post-Solve Metrics] Show Metadata for Route',
  props<{ id: number }>()
);
