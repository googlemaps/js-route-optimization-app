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
