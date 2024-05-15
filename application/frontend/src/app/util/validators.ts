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

import {
  UntypedFormArray,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
} from '@angular/forms';
import Long from 'long';
import { localDateTimeToUtcSeconds } from './time-translation';
import { RelaxationLevel } from '../core/models/dispatcher.model';
import { isValidTimeString } from './datetime';
import { isMatch } from 'lodash';

export function durationWithinGlobalStartEndTime(
  startTime: string | number | Long,
  endTime: string | number | Long,
  timezoneOffset: number
): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const date = fg.get('date').value;
    const time = fg.get('time').value;
    if (!date || !time || !startTime || !endTime) {
      return null;
    }

    const seconds = localDateTimeToUtcSeconds(date, time, timezoneOffset);
    if (
      Long.fromValue(startTime).greaterThan(seconds) ||
      Long.fromValue(endTime).lessThan(seconds)
    ) {
      return {
        durationWithinGlobalStartEndTime: true,
      };
    }
    return null;
  };
}

export function durationALessThanB(
  a: string,
  b: string,
  id = 'durationALessThanB',
  aOptional = false,
  bOptional = false
): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const aValueMinutes = fg.get(a).value.min;
    const aValueSeconds = fg.get(a).value.sec;
    const bValueMinutes = fg.get(b).value.min;
    const bValueSeconds = fg.get(b).value.sec;
    const aValue =
      !aValueMinutes && !aValueSeconds
        ? null
        : (aValueMinutes ? aValueMinutes * 60 : 0) + (aValueSeconds ? aValueSeconds : 0);
    const bValue =
      !bValueMinutes && !bValueSeconds
        ? null
        : (bValueMinutes ? bValueMinutes * 60 : 0) + (bValueSeconds ? bValueSeconds : 0);
    return (aOptional && aValue == null) || (bOptional && bValue == null) || aValue < bValue
      ? null
      : {
          [id]: { a, b },
        };
  };
}

export function aRequiredIfDurationB(
  a: string,
  b: string,
  id = 'aRequiredIfDurationB'
): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const aValue = fg.get(a).value;
    const bValueMinutes = fg.get(b).value.min;
    const bValueSeconds = fg.get(b).value.sec;
    const bValue =
      !bValueMinutes && !bValueSeconds
        ? null
        : (bValueMinutes ? bValueMinutes * 60 : 0) + (bValueSeconds ? bValueSeconds : 0);
    if (bValue == null) {
      return null;
    }
    return aValue != null ? null : { [id]: { a, b } };
  };
}

export function aLessThanB(
  a: string,
  b: string,
  id = 'aLessThanB',
  aOptional = false,
  bOptional = false
): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const aValue = fg.get(a).value;
    const bValue = fg.get(b).value;
    return (aOptional && aValue == null) || (bOptional && bValue == null) || aValue < bValue
      ? null
      : {
          [id]: { a, b },
        };
  };
}

export function aRequiredIfB(a: string, b: string, id = 'aRequiredIfB'): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const aValue = fg.get(a).value;
    const bValue = fg.get(b).value;
    if (bValue == null) {
      return null;
    }
    return aValue != null
      ? null
      : {
          [id]: { a, b },
        };
  };
}

export const noDuplicateCapacitiesValidator: ValidatorFn = (control: UntypedFormControl) => {
  if (
    new Set(control.value.map((capacity) => `${capacity.type}_${capacity.unit || ''}`)).size !==
    control.value.length
  ) {
    return {
      duplicateCapacities: true,
    };
  }
  return null;
};

export const noDuplicateExtraDurationValidator: ValidatorFn = (control: UntypedFormControl) => {
  if (
    new Set(control.value.map((extraDuration) => `${extraDuration.visitType}`)).size !==
    control.value.length
  ) {
    return {
      duplicateExtraDuration: true,
    };
  }
  return null;
};

export function noDuplicateValuesValidator(propertyName: string): ValidatorFn {
  return (control: UntypedFormArray) => {
    if (new Set(control.value.map((v) => v[propertyName] || '')).size !== control.value.length) {
      const duplicateValues = {};
      duplicateValues[propertyName] = true;

      return {
        duplicateValues: duplicateValues,
      };
    }
    return null;
  };
}

/**
 * Check that a FormArray does not contain duplicate values (as determined by lodash.isMatch())
 * @returns `{duplicate: true}` if duplicate values are present, otherwise `null`
 */
export const noDuplicateFormArrayValuesValidator: ValidatorFn = (formArray: UntypedFormArray) => {
  if (!Array.isArray(formArray.value)) {
    return null;
  }

  for (const [index, value] of formArray.value.entries()) {
    const duplicate = formArray.value.some((otherValue, otherIndex) => {
      if (index === otherIndex) {
        return false;
      }

      if (
        (value === null || value === undefined) &&
        (otherValue === null || otherValue === undefined)
      ) {
        return true;
      }

      return isMatch(value, otherValue) && isMatch(otherValue, value);
    });

    if (duplicate) {
      return { duplicate: true };
    }
  }

  return null;
};

export const nonNegativeIntegerValidator: ValidatorFn = (control: UntypedFormControl) => {
  if (control.value != null && !/^\s*\d*\s*$/.test(control.value.toString())) {
    return { nonNegativeInteger: true };
  }
  return null;
};

export const noUnspecifiedRelaxationLevelValidator: ValidatorFn = (control: UntypedFormControl) => {
  if (control.value === RelaxationLevel.LEVEL_UNSPECIFIED) {
    return { noUnspecifiedRelaxationLevel: true };
  }
  return null;
};

export const timeStringValidator: ValidatorFn = (control: UntypedFormControl) => {
  if (control.value && !isValidTimeString(control.value)) {
    return { timeString: true };
  }
  return null;
};

export function requireAny(a: string[], id = 'requireAny'): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const returnVal = !a.some((element) => fg.get(element).value) && {
      [id]: { ...a },
    };
    return returnVal;
  };
}

export function requireAandB(a: string, b: string, id = 'requireAandB'): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const aValue = fg.get(a).value;
    const bValue = fg.get(b).value;
    if (!aValue && !bValue) {
      return null;
    }
    return (
      (!aValue || !bValue) && {
        [id]: { a, b },
      }
    );
  };
}

/**
 * Require that one of FormControls A and B, but not both, have a value
 * @returns `{requireAxorB: true}` if both fields are empty or both have values
 */
export function requireAxorB(a: string, b: string, id = 'requireAxorB'): ValidatorFn {
  return (fg: UntypedFormGroup) => {
    const aValue = fg.get(a).value;
    const bValue = fg.get(b).value;
    return (!aValue && !bValue) || (aValue && bValue) ? { [id]: true } : null;
  };
}
