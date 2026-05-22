/* eslint-disable @typescript-eslint/no-explicit-any */

import { isCanonicalDuration, isCanonicalTimestamp } from './canonical-protobuf';

describe('isCanonical helpers', () => {
  describe('isCanonicalDuration', () => {
    it('should return true for a canonical duration string (e.g. "60s")', () => {
      expect(isCanonicalDuration('60s' as any)).toBe(true);
    });

    it('should return false for a plain object with seconds field', () => {
      expect(isCanonicalDuration({ seconds: 100 })).toBe(false);
    });
  });

  describe('isCanonicalTimestamp', () => {
    it('should return true for an ISO 8601 timestamp string', () => {
      expect(isCanonicalTimestamp('2022-07-08T18:00:0+00:00' as any)).toBe(true);
    });

    it('should return false for a plain object with seconds field', () => {
      expect(isCanonicalTimestamp({ seconds: 1657303000 })).toBe(false);
    });
  });
});
