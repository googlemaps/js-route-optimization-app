/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { getTimezonesByName, matchTimezonesByOffset } from './timezones';

describe('timezones util', () => {
  describe('matchTimezonesByOffset', () => {
    it('should not match timezones from offest', () => {
      expect(matchTimezonesByOffset([], 100)).toEqual([]);
      expect(
        matchTimezonesByOffset(
          [
            {
              description: 'test timezone 1',
              offset: 10,
              label: 'test timezone',
            },
            {
              description: 'test timezone 2',
              offset: -500,
              label: 'test timezone 2',
            },
          ],
          100
        )
      ).toEqual([]);
    });

    it('should match timezones from offset', () => {
      expect(
        matchTimezonesByOffset(
          [
            {
              description: 'test timezone 1',
              offset: 100,
              label: 'test timezone',
            },
            {
              description: 'test timezone 2',
              offset: -500,
              label: 'test timezone 2',
            },
          ],
          100
        )
      ).toEqual([
        {
          description: 'test timezone 1',
          offset: 100,
          label: 'test timezone',
        },
      ]);

      expect(
        matchTimezonesByOffset(
          [
            {
              description: 'test timezone 1',
              offset: 100,
              label: 'test timezone',
            },
            {
              description: 'test timezone 2',
              offset: 100,
              label: 'test timezone 2',
            },
          ],
          100
        )
      ).toEqual([
        {
          description: 'test timezone 1',
          offset: 100,
          label: 'test timezone',
        },
        {
          description: 'test timezone 2',
          offset: 100,
          label: 'test timezone 2',
        },
      ]);
    });
  });

  describe('getTimezonesByName', () => {
    it('should match timezones by name', () => {
      expect(getTimezonesByName('HST')).toEqual([
        {
          label: '-10:00',
          description: 'HST',
          offset: -36000,
        },
      ]);
    });

    it('should ignore underscores and match timezones by name', () => {
      expect(getTimezonesByName('America/Dawson_Creek')).toEqual([
        {
          label: '-7:00',
          description: 'America/Dawson Creek',
          offset: -25200,
        },
      ]);
    });

    it('should match timezones by name, ignoring DST', () => {
      expect(getTimezonesByName('US/Aleutian')).toEqual([
        {
          label: '-10:00',
          description: 'US/Aleutian',
          offset: -36000,
        },
        {
          label: '-9:00',
          description: 'US/Aleutian (DST)',
          offset: -32400,
        },
      ]);
    });

    it('should not match timezones', () => {
      expect(getTimezonesByName('Not a timezone')).toEqual([]);
    });
  });
});
