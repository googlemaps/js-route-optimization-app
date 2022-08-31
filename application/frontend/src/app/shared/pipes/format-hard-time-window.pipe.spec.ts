/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Long from 'long';
import { ITimeWindow } from 'src/app/core/models';
import { FormatHardTimeWindowPipe } from './format-hard-time-window.pipe';

describe('FormatHardTimeWindowPipe', () => {
  const pipe = new FormatHardTimeWindowPipe('en-US');

  it('formats time windows', () => {
    expect(
      pipe.transform(
        <ITimeWindow>{
          startTime: {
            seconds: 946784640,
          },
          endTime: {
            seconds: 949553700,
          },
        },
        null,
        0
      )
    ).toEqual({
      startDate: '2000/01/02',
      startTime: '3:44am',
      endDate: '2000/02/03',
      endTime: '4:55am',
    });
  });

  it('does not return endDate when same as startDate', () => {
    expect(
      pipe.transform(
        <ITimeWindow>{
          startTime: {
            seconds: 946784640,
          },
          endTime: {
            seconds: 946788900,
          },
        },
        null,
        0
      )
    ).toEqual({
      startDate: '2000/01/02',
      startTime: '3:44am',
      // endDate: n/a,
      endTime: '4:55am',
    });
  });

  it('returns default when start not set', () => {
    expect(
      pipe.transform(
        <ITimeWindow>{
          endTime: {
            seconds: 949553700,
          },
        },
        [new Long(946784640), new Long(0)],
        0
      )
    ).toEqual({
      startDate: '2000/01/02',
      startTime: '3:44am',
      endDate: '2000/02/03',
      endTime: '4:55am',
    });
  });

  it('returns default when end not set', () => {
    expect(
      pipe.transform(
        <ITimeWindow>{
          startTime: {
            seconds: 946784640,
          },
        },
        [new Long(0), new Long(949553700)],
        0
      )
    ).toEqual({
      startDate: '2000/01/02',
      startTime: '3:44am',
      endDate: '2000/02/03',
      endTime: '4:55am',
    });
  });

  it('returns default when time window is null or undefined', () => {
    expect(pipe.transform(null, [new Long(946784640), new Long(949553700)], 0)).toEqual({
      startDate: '2000/01/02',
      startTime: '3:44am',
      endDate: '2000/02/03',
      endTime: '4:55am',
    });

    expect(pipe.transform(undefined, [new Long(946784640), new Long(949553700)], 0)).toEqual({
      startDate: '2000/01/02',
      startTime: '3:44am',
      endDate: '2000/02/03',
      endTime: '4:55am',
    });
  });

  it('returns undefined when time window not set and no defaults provided', () => {
    expect(pipe.transform(null, null, 0)).toBeUndefined();
    expect(pipe.transform({}, null, 0)).toBeUndefined();

    expect(pipe.transform({ startTime: { seconds: 946784640 } }, null, 0)).toBeUndefined();
    expect(pipe.transform({ endTime: { seconds: 946784640 } }, null, 0)).toBeUndefined();
  });
});
