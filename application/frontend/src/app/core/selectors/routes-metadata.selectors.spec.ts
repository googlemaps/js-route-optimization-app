/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as fromRoutesMetadata from '../reducers/routes-metadata.reducer';
import { selectRoutesMetadataState } from './routes-metadata.selectors';

describe('RoutesMetadata Selectors', () => {
  it('should select the feature state', () => {
    const result = selectRoutesMetadataState({
      [fromRoutesMetadata.routesMetadataFeatureKey]: {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        displayColumns: null,
      },
    });

    expect(result).toEqual({
      pageIndex: 0,
      pageSize: 25,
      sort: { active: null, direction: null },
      filters: [],
      selected: [],
      displayColumns: null,
    });
  });
});
