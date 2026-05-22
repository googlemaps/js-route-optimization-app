import { google } from '@googlemaps/routeoptimization/build/protos/protos';

export interface ExtendedConversionOptions extends protobuf.IConversionOptions {
  canonical?: boolean;
}

export function isCanonicalDuration(object: google.protobuf.IDuration): boolean {
  return typeof object === 'string';
}

export function isCanonicalTimestamp(object: google.protobuf.ITimestamp): boolean {
  return typeof object === 'string';
}
