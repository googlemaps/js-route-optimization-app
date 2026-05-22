/*
Copyright 2026 Google LLC

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

import { OptimizeToursRequest, OptimizeToursResponse } from '../models/ro';
import { IConversionOptions } from 'protobufjs';

import { extractCode, isCodeBlock } from './json';

/**
 * Fields where child properties should be not be converted to camel case
 * (generally, `map<string, *>` types where the key is user-defined)
 */
const PRESERVE_FIELD_CHILDREN = new Set<string>([
  'extraVisitDurationForVisitType',
  'loadDemands',
  'loadLimits',
  'vehicleLoads',
]);

const conversionOptions: IConversionOptions = { json: true, longs: String };

export function toOptimizeToursRequest(txt: string): OptimizeToursRequest | undefined {
  if (!isCodeBlock(txt)) {
    return undefined;
  }

  // Conversion can potentially fail, in which case it is safe to assume it is not a valid object
  try {
    const code = extractCode(txt);

    // Convert JSON into a typed object and back to test if JSON is a valid request
    const converted = OptimizeToursRequest.fromObject(
      convertProtoFieldNamesToCamelCase(JSON.parse(code))
    );
    const obj = OptimizeToursRequest.toObject(converted, conversionOptions);

    return Object.keys(obj).length ? converted : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

export function toOptimizeToursResponse(txt: string): OptimizeToursResponse | undefined {
  if (!isCodeBlock(txt)) {
    return undefined;
  }

  // Conversion can potentially fail, in which case it is safe to assume it is not a valid object
  try {
    const code = extractCode(txt);
    // Convert JSON into a typed object and back to test if JSON is a valid response
    const converted = OptimizeToursResponse.fromObject(
      convertProtoFieldNamesToCamelCase(JSON.parse(code))
    );
    const obj = OptimizeToursResponse.toObject(converted, conversionOptions);

    return Object.keys(obj).length ? converted : undefined;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertProtoFieldNamesToCamelCase(obj: any, parentField = ''): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(value => convertProtoFieldNamesToCamelCase(value));
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalized: any = {};
  Object.entries(obj).forEach(([key, value]) => {
    const normalizedFieldName = PRESERVE_FIELD_CHILDREN.has(parentField)
      ? key
      : key.replace(/([_][a-z])/g, group => group[1].toUpperCase());

    normalized[normalizedFieldName] = convertProtoFieldNamesToCamelCase(value, normalizedFieldName);
  });
  return normalized;
}
