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

import { Injectable } from '@angular/core';
import { IConversionOptions } from 'protobufjs';
import { OptimizeToursRequest, OptimizeToursResponse } from 'src/app/core/models';

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

@Injectable({
  providedIn: 'root',
})
export class DispatcherService {
  private conversionOptions: IConversionOptions = { json: true, longs: String };

  /**
   * Normalizes a scenario ({@link OptimizeToursRequest}) to non-canonical proto JSON
   * with proto field names converted to camel case
   * @remarks
   * The application internals expect state to be in non-canonical, camel case representation.
   */
  objectToScenario(obj: any, conversionOptions?: IConversionOptions): { [k: string]: any } {
    const camelCaseObj = this.convertProtoFieldNamesToCamelCase(obj);
    const message = OptimizeToursRequest.fromObject(camelCaseObj);
    return OptimizeToursRequest.toObject(message, conversionOptions || this.conversionOptions);
  }

  /**
   * Normalizes a solution ({@link OptimizeToursResponse}) to non-canonical proto JSON
   * with proto field names converted to camel case
   * @remarks
   * The application internals expect state to be in non-canonical, camel case representation.
   */
  objectToSolution(obj: any, conversionOptions?: IConversionOptions): { [k: string]: any } {
    const camelCaseObj = this.convertProtoFieldNamesToCamelCase(obj);
    const message = OptimizeToursResponse.fromObject(camelCaseObj);
    return OptimizeToursResponse.toObject(message, conversionOptions || this.conversionOptions);
  }

  private convertProtoFieldNamesToCamelCase(obj: any, parentField: string = null): any {
    if (typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((value) => this.convertProtoFieldNamesToCamelCase(value));
    }
    const normalized = {};
    Object.entries(obj).forEach(([key, value]) => {
      const normalizedFieldName = PRESERVE_FIELD_CHILDREN.has(parentField)
        ? key
        : key.replace(/([_][a-z])/g, (group) => group[1].toUpperCase());

      normalized[normalizedFieldName] = this.convertProtoFieldNamesToCamelCase(
        value,
        normalizedFieldName
      );
    });
    return normalized;
  }
}
