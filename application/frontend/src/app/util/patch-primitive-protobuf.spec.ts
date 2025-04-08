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

import Long from 'long';
import * as protobuf from 'protobufjs/minimal';
import { google } from '@googlemaps/routeoptimization/build/protos/protos';
import { ExtendedConversionOptions } from './canonical-protobuf';
import { patchDuration, patchTimestamp } from './patch-primitive-protobuf';

const nonCanonicalOptions = { json: true, longs: String };
const canonicalOptions = { ...nonCanonicalOptions, canonical: false } as ExtendedConversionOptions;

describe('util', () => {
  beforeAll(() => {
    protobuf.util.Long = Long;
    protobuf.configure();
  });

  describe('patchDuration', () => {
    beforeAll(() => {
      patchDuration();
    });

    describe('fromObject', () => {
      it('should convert from object', () => {
        const duration = {
          seconds: '123456789',
          nanos: 9.99e8,
        };

        const message = google.protobuf.Duration.fromObject(duration);

        expect(message.seconds).toEqual(Long.fromNumber(123456789));
        expect(message.nanos).toEqual(9.99e8);
      });

      it('should convert from string', () => {
        const duration = '123456789s';

        const message = google.protobuf.Duration.fromObject(duration as any);

        expect(message.seconds).toEqual(Long.fromNumber(123456789));
        expect(message.nanos).toEqual(0);
      });

      it('should ignore string fractional seconds', () => {
        const duration = '123456789.999s';

        const message = google.protobuf.Duration.fromObject(duration as any);

        expect(message.seconds).toEqual(Long.fromNumber(123456789));
        expect(message.nanos).toEqual(0);
      });

      it('should throw when string is without "s" suffix', () => {
        const duration = '123456789';

        expect(() => google.protobuf.Duration.fromObject(duration as any)).toThrowError(
          'Invalid duration: the suffix "s" is required'
        );
      });
    });

    describe('toObject', () => {
      it('should convert to object', () => {
        const message = google.protobuf.Duration.fromObject({ seconds: '123456789', nanos: 999 });

        const object = google.protobuf.Duration.toObject(message, nonCanonicalOptions) as any;

        expect(object).toEqual({ seconds: '123456789', nanos: 999 });
      });

      it('should convert to object with canonical options', () => {
        const message = google.protobuf.Duration.fromObject({ seconds: 123456789, nanos: 999 });

        const object = google.protobuf.Duration.toObject(message, canonicalOptions) as any;

        expect(object).toEqual({ seconds: '123456789', nanos: 999 });
      });

      it('should convert to canonical json', () => {
        const message = google.protobuf.Duration.fromObject({ seconds: 60 });

        const object = google.protobuf.Duration.toObject(message, {
          ...canonicalOptions,
          canonical: true,
        } as any) as any;

        expect(object).toEqual('60s');
      });

      it('should convert canonical duration', () => {
        const message = '60s';

        const object = google.protobuf.Duration.toObject(message as any, canonicalOptions) as any;

        expect(object).toEqual({ seconds: '60' });
      });
    });
  });

  describe('patchTimestamp', () => {
    beforeAll(() => {
      patchTimestamp();
    });

    describe('patched Timestamp fromObject', () => {
      it('should convert from object', () => {
        const timestamp = {
          seconds: '123456789',
          nanos: 9.99e8,
        };

        const message = google.protobuf.Timestamp.fromObject(timestamp);

        expect(message.seconds).toEqual(Long.fromNumber(123456789));
        expect(message.nanos).toEqual(9.99e8);
      });

      it('should convert from string', () => {
        const timestamp = '2019-10-02T22:39:00.999Z';

        const message = google.protobuf.Timestamp.fromObject(timestamp as any);

        expect(message.seconds).toEqual(
          Long.fromNumber(Date.parse('2019-10-02T22:39:00.000Z') / 1000)
        );
        expect(message.nanos).toEqual(0.999e9);
      });

      it('should convert using default fromObject', () => {
        expect(google.protobuf.Timestamp.fromObject('a' as any)).toEqual(
          new google.protobuf.Timestamp()
        );
      });
    });

    describe('patched Timestamp toObject', () => {
      it('should convert to object', () => {
        const message = google.protobuf.Timestamp.fromObject({
          seconds: Date.parse('2019-10-02T22:39:00.000Z') / 1000,
          nanos: 9.99e8,
        });

        const object = google.protobuf.Timestamp.toObject(message, nonCanonicalOptions) as any;

        expect(object).toEqual({
          seconds: (Date.parse('2019-10-02T22:39:00.000Z') / 1000).toString(),
          nanos: 9.99e8,
        });
      });

      it('should convert to object with canonical options', () => {
        const message = google.protobuf.Timestamp.fromObject({
          seconds: Date.parse('2019-10-02T22:39:00.000Z') / 1000,
          nanos: 9.99e8,
        });

        const object = google.protobuf.Timestamp.toObject(message, canonicalOptions) as any;

        expect(object).toEqual({
          seconds: (Date.parse('2019-10-02T22:39:00.000Z') / 1000).toString(),
          nanos: 9.99e8,
        });
      });

      it('should convert to canonical object', () => {
        const message = google.protobuf.Timestamp.fromObject({
          seconds: Date.parse('2019-10-02T22:39:00.000Z') / 1000,
        });

        const result = google.protobuf.Timestamp.toObject(message, {
          ...canonicalOptions,
          canonical: true,
        } as any);

        expect(result).toBe('2019-10-02T22:39:00.000Z' as any);
      });

      it('should convert numerical seconds to canonical object', () => {
        const message = google.protobuf.Timestamp.fromObject({
          seconds: Date.parse('2019-10-02T22:39:00.000Z') / 1000,
        });

        message.seconds = Date.parse('2019-10-02T22:39:00.000Z') / 1000;

        const result = google.protobuf.Timestamp.toObject(
          message as any,
          { ...canonicalOptions, canonical: true } as any
        );

        expect(result).toBe('2019-10-02T22:39:00.000Z' as any);
      });

      it('should convert canonical timestamp', () => {
        const message = '2019-10-02T22:39:00.000Z';

        const object = google.protobuf.Timestamp.toObject(message as any, canonicalOptions) as any;

        expect(object).toEqual({
          seconds: (Date.parse('2019-10-02T22:39:00.000Z') / 1000).toString(),
        });
      });
    });
  });
});
