/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { isCanonicalDuration, isCanonicalTimestamp } from './canonical-protobuf';

describe('linear referencing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should determine duration is canonical', () => {
    expect(isCanonicalDuration('60s' as any)).toBe(true);
  });

  it('should determine duration is not canonical', () => {
    expect(isCanonicalDuration({ seconds: 100 })).toBe(false);
  });

  it('should determine timestamp is canonical', () => {
    expect(isCanonicalTimestamp('2022-07-08T18:00:0+00:00' as any)).toBe(true);
  });

  it('should determine timestamp is not canonical', () => {
    expect(isCanonicalDuration({ seconds: 1657303000 })).toBe(false);
  });
});
