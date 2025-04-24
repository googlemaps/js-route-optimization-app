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

import { DurationLimitPipe } from "./duration-limit.pipe";

describe('DurationLimitPipe', () => {
  const pipe = new DurationLimitPipe();

  it('returns undefined when fed a null value', () => {
    expect(pipe.transform()).toBeUndefined();
    expect(pipe.transform(null)).toBeUndefined();
  });

  it('returns undefined values when fed undefined values', () => {
    expect(pipe.transform({})).toEqual({
        maxDuration: undefined,
        softMaxDuration: undefined,
        costPerHourAfterSoftMax: undefined,
      });
  });

  it('returns numbers when fed numbers', () => {
    expect(pipe.transform({
        maxDuration: { seconds: 100, nanos: 500 },
        softMaxDuration: { seconds: 10, nanos: 20 },
        costPerHourAfterSoftMax: 10,
      })).toEqual({
        maxDuration: { seconds: 100, nanos: 500 },
        softMaxDuration: { seconds: 10, nanos: 20 },
        costPerHourAfterSoftMax: 10,
      });
  });

});
