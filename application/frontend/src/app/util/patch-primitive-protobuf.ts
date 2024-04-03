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

import * as Long from 'long';
import { google } from '@google-cloud/optimization/build/protos/protos';
import {
  ExtendedConversionOptions,
  isCanonicalDuration,
  isCanonicalTimestamp,
} from './canonical-protobuf';

export function patchDuration(): void {
  // Patch google.protobuf.Duration.fromObject to handle canonical values
  // Based on:  https://github.com/protobufjs/protobuf.js/issues/1304#issuecomment-536047240
  const fromObject = google.protobuf.Duration.fromObject;
  google.protobuf.Duration.fromObject = (object) => {
    if (isCanonicalDuration(object)) {
      if (object.slice(-1) !== 's') {
        throw new Error('Invalid duration: the suffix "s" is required');
      }
      // nanos handling unimplemented
      const value = (object as any as string).slice(0, -1);
      const decimalIndex = value.lastIndexOf('.');
      const seconds = Long.fromValue(decimalIndex < 0 ? value : value.substring(0, decimalIndex));
      return google.protobuf.Duration.create({
        seconds,
      });
    }
    return fromObject(object);
  };

  const toObject = google.protobuf.Duration.toObject;
  google.protobuf.Duration.toObject = (message, options: ExtendedConversionOptions) => {
    if (options && options.json && options.canonical) {
      // nanos handling unimplemented
      return (message.seconds.toString() + 's') as any;
    }
    if (isCanonicalDuration(message)) {
      return toObject(google.protobuf.Duration.fromObject(message), options);
    }
    return toObject(message, options);
  };
}

export function patchTimestamp(): void {
  // Patch google.protobuf.Timestamp to handle canonical values
  // Based on:
  // https://github.com/protobufjs/protobuf.js/issues/1304#issuecomment-536047240
  // https://github.com/protobufjs/protobuf.js/blob/f274f40b7196095c5def9090769634500c7a80a0/src/wrappers.js#L116
  const fromObject = google.protobuf.Timestamp.fromObject;
  google.protobuf.Timestamp.fromObject = (object: any) => {
    if (!isCanonicalTimestamp(object)) {
      return fromObject(object);
    }

    const ms = Date.parse(object as string);
    if (isNaN(ms)) {
      return fromObject(object);
    }

    const obj: google.protobuf.ITimestamp = { seconds: Long.fromNumber(Math.floor(ms / 1000)) };
    const nanos = (ms % 1000) * 1000000;
    if (nanos > 0) {
      obj.nanos = nanos;
    }
    return google.protobuf.Timestamp.create(obj);
  };

  const toObject = google.protobuf.Timestamp.toObject;
  google.protobuf.Timestamp.toObject = (message, options: ExtendedConversionOptions) => {
    if (options && options.json && options.canonical) {
      const seconds = Long.isLong(message.seconds)
        ? (message.seconds as Long).toNumber()
        : (message.seconds as number);
      return new Date(seconds * 1000 + message.nanos / 1000000).toISOString() as any;
    }
    if (isCanonicalTimestamp(message)) {
      return toObject(google.protobuf.Timestamp.fromObject(message), options);
    }
    return toObject(message, options);
  };
}
