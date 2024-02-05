/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import {
  aLessThanB,
  aRequiredIfB,
  aRequiredIfDurationB,
  durationALessThanB,
  durationWithinGlobalStartEndTime,
  noDuplicateCapacitiesValidator,
  noDuplicateExtraDurationValidator,
  noDuplicateFormArrayValuesValidator,
  noDuplicateValuesValidator,
  nonNegativeIntegerValidator,
  noUnspecifiedRelaxationLevelValidator,
  requireAandB,
  requireAny,
  requireAxorB,
  timeStringValidator,
} from './validators';
import { RelaxationLevel } from '../core/models';

describe('form', () => {
  let formGroup: UntypedFormGroup;
  let date: UntypedFormControl;
  let time: UntypedFormControl;
  let a: UntypedFormControl;
  let b: UntypedFormControl;
  let fb: UntypedFormBuilder;
  let capacitiesControl: UntypedFormControl;
  let extraDurationControl: UntypedFormControl;
  let level: UntypedFormControl;

  beforeEach(() => {
    fb = new UntypedFormBuilder();
    a = new UntypedFormControl('');
    b = new UntypedFormControl('');
  });
  it('should not have error if duration is within global start and end time - durationWithinGlobalStartEndTime', () => {
    date = new UntypedFormControl('');
    time = new UntypedFormControl('');
    date.setValue(new Date('July 14, 2019 00:00:00'));
    time.setValue('05:00');
    formGroup = new UntypedFormGroup(
      {
        date,
        time,
      },
      {
        validators: [durationWithinGlobalStartEndTime(1563094800, 1563094800, -14400)],
      }
    );
    expect(formGroup.hasError('durationWithinGlobalStartEndTime')).toBe(false);
  });

  it('should have error if duration is not within global start and end time - durationWithinGlobalStartEndTime', () => {
    date = new UntypedFormControl('');
    time = new UntypedFormControl('');
    date.setValue(new Date('July 14, 2019 00:00:00'));
    time.setValue('05:00');
    formGroup = new UntypedFormGroup(
      {
        date,
        time,
      },
      {
        validators: [durationWithinGlobalStartEndTime(1530540852, 1530540852, -14400)],
      }
    );
    expect(formGroup.hasError('durationWithinGlobalStartEndTime')).toBe(true);
  });

  it('should have error if no date / time / startTime / endTime - durationWithinGlobalStartEndTime', () => {
    date = new UntypedFormControl('');
    time = new UntypedFormControl('');
    time.setValue('05:00');
    formGroup = new UntypedFormGroup(
      {
        date,
        time,
      },
      {
        validators: [durationWithinGlobalStartEndTime(1530540852, 1530540852, -14400)],
      }
    );
    expect(formGroup.hasError('durationWithinGlobalStartEndTime')).toBe(false);
  });

  it('should not have error if duration A less than B - durationALessThanB', () => {
    formGroup = new UntypedFormGroup(
      {
        a: fb.group({
          min: [10],
          sec: [null],
        }),
        b: fb.group({
          min: [12],
          sec: [null],
        }),
      },
      {
        validators: [durationALessThanB('a', 'b', 'durationALessThanBId', false, false)],
      }
    );
    expect(formGroup.hasError('durationALessThanBId')).toBe(false);
  });

  it('should have error if duration B less than A - durationALessThanB', () => {
    formGroup = new UntypedFormGroup(
      {
        a: fb.group({
          min: [12],
          sec: [null],
        }),
        b: fb.group({
          min: [10],
          sec: [null],
        }),
      },
      {
        validators: [durationALessThanB('a', 'b', 'durationALessThanBId', false, false)],
      }
    );
    expect(formGroup.hasError('durationALessThanBId')).toBe(true);
  });

  it('should not have error if A is Required If Duration B - aRequiredIfDurationB', () => {
    a.setValue('aValue');
    formGroup = new UntypedFormGroup(
      {
        a,
        b: fb.group({
          min: [12],
          sec: [null],
        }),
      },
      {
        validators: [aRequiredIfDurationB('a', 'b', 'aRequired')],
      }
    );
    expect(formGroup.hasError('aRequired')).toBe(false);
  });

  it('should have error if A is Required If Duration B - aRequiredIfDurationB', () => {
    a.setValue(null);
    formGroup = new UntypedFormGroup(
      {
        a,
        b: fb.group({
          min: [12],
          sec: [null],
        }),
      },
      {
        validators: [aRequiredIfDurationB('a', 'b', 'aRequired')],
      }
    );
    expect(formGroup.hasError('aRequired')).toBe(true);
  });

  it('should not have error if A is less than B - aLessThanB', () => {
    a.setValue(8);
    b.setValue(9);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [aLessThanB('a', 'b', 'aLessThanB', true)],
      }
    );
    expect(formGroup.hasError('aLessThanB')).toBe(false);
  });

  it('should have error if A is not less than B - aLessThanB', () => {
    a.setValue(9);
    b.setValue(8);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [aLessThanB('a', 'b', 'aLessThanB', true)],
      }
    );
    expect(formGroup.hasError('aLessThanB')).toBe(true);
  });

  it('should not have error if A has value if B - aRequiredIfB', () => {
    a.setValue(8);
    b.setValue(9);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [aRequiredIfB('a', 'b', 'aRequiredIfB')],
      }
    );
    expect(formGroup.hasError('aRequiredIfB')).toBe(false);
  });

  it('should have error if A is null if B - aRequiredIfB', () => {
    a.setValue(null);
    b.setValue(9);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [aRequiredIfB('a', 'b', 'aRequiredIfB')],
      }
    );
    expect(formGroup.hasError('aRequiredIfB')).toBe(true);
  });

  it('should not have error if no duplicate capacities - noDuplicateCapacitiesValidator', () => {
    capacitiesControl = new UntypedFormControl(
      [
        { type: 'weight_kilograms', value: 100 },
        { type: 'volume_liters', value: 20 },
      ],
      [noDuplicateCapacitiesValidator]
    );
    expect(capacitiesControl.hasError('duplicateCapacities')).toBe(false);
  });

  it('should have error if duplicate capacities - noDuplicateCapacitiesValidator', () => {
    capacitiesControl = new UntypedFormControl(
      [
        { type: 'weight_kilograms', value: 100 },
        { type: 'volume_liters', value: 20 },
        { type: 'weight_kilograms', value: 200 },
      ],
      [noDuplicateCapacitiesValidator]
    );
    expect(capacitiesControl.hasError('duplicateCapacities')).toBe(true);
  });

  it('should not have error if no duplicate extra duration - noDuplicateExtraDurationValidator', () => {
    extraDurationControl = new UntypedFormControl(
      [
        { visitType: 'Test', extraDuration: { min: 12, sec: 3 } },
        { visitType: 'New', extraDuration: { min: 11, sec: 4 } },
      ],
      [noDuplicateExtraDurationValidator]
    );
    expect(extraDurationControl.hasError('duplicateExtraDuration')).toBe(false);
  });

  it('should have error if duplicate extra duration - noDuplicateExtraDurationValidator', () => {
    extraDurationControl = new UntypedFormControl(
      [
        { visitType: 'Test', extraDuration: { min: 12, sec: 3 } },
        { visitType: 'New', extraDuration: { min: 11, sec: 4 } },
        { visitType: 'New', extraDuration: { min: 15, sec: 4 } },
      ],
      [noDuplicateExtraDurationValidator]
    );
    expect(extraDurationControl.hasError('duplicateExtraDuration')).toBe(true);
  });

  it('should not have error if no duplicate Values - noDuplicateValuesValidator', () => {
    a = new UntypedFormControl(
      [
        { cost: 12, vehicles: 'Vehicle #2' },
        { cost: 13, vehicles: 'Vehicle #1' },
      ],
      [noDuplicateValuesValidator('cost')]
    );
    expect(a.hasError('duplicateValues')).toBe(false);
  });

  it('should have error if duplicate Values - noDuplicateValuesValidator', () => {
    a = new UntypedFormControl(
      [
        { cost: 12, vehicles: 'Vehicle #1' },
        { cost: 12, vehicles: 'Vehicle #1' },
      ],
      [noDuplicateValuesValidator('cost')]
    );
    expect(a.hasError('duplicateValues')).toBe(true);
  });

  it('should not have error if form array does not have duplicate Values - noDuplicateFormArrayValuesValidator', () => {
    a = new UntypedFormControl({ types: ['type1', 'type2'], incompatibilityMode: 1 }, []);
    b = new UntypedFormControl({ types: ['type1', 'type2'], incompatibilityMode: 2 }, []);
    formGroup = new UntypedFormGroup({
      a: fb.array([a, b], (formArray: UntypedFormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
    });
    expect(formGroup.invalid).toBe(false);
  });

  it('should have error if form array has duplicate Values - noDuplicateFormArrayValuesValidator', () => {
    a = new UntypedFormControl({ types: ['type1', 'type2'], incompatibilityMode: 1 }, []);
    b = new UntypedFormControl({ types: ['type1', 'type2'], incompatibilityMode: 1 }, []);
    formGroup = new UntypedFormGroup({
      a: fb.array([a, b], (formArray: UntypedFormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
    });
    expect(formGroup.invalid).toBe(true);
  });

  it('should not have error if non negative Integer value - nonNegativeIntegerValidator', () => {
    a = new UntypedFormControl(3, [nonNegativeIntegerValidator]);
    expect(a.hasError('nonNegativeInteger')).toBe(false);
  });

  it('should have error if negative Integer value - nonNegativeIntegerValidator', () => {
    a = new UntypedFormControl(-3, [nonNegativeIntegerValidator]);
    expect(a.hasError('nonNegativeInteger')).toBe(true);
  });

  it('should not have error if relaxation level other than unspecified - noUnspecifiedRelaxationLevelValidator', () => {
    level = new UntypedFormControl(RelaxationLevel.RELAX_VISIT_TIMES_AFTER_THRESHOLD, [
      noUnspecifiedRelaxationLevelValidator,
    ]);
    expect(level.hasError('noUnspecifiedRelaxationLevel')).toBe(false);
  });

  it('should have error if relaxation level is unspecified - noUnspecifiedRelaxationLevelValidator', () => {
    level = new UntypedFormControl(RelaxationLevel.LEVEL_UNSPECIFIED, [
      noUnspecifiedRelaxationLevelValidator,
    ]);
    expect(level.hasError('noUnspecifiedRelaxationLevel')).toBe(true);
  });

  it('should not have error if time string valid - timeStringValidator', () => {
    time = new UntypedFormControl('05:00', [timeStringValidator]);
    expect(time.hasError('timeString')).toBe(false);
  });

  it('should have error if time string is not valid - timeStringValidator', () => {
    time = new UntypedFormControl('test', [timeStringValidator]);
    expect(time.hasError('timeString')).toBe(true);
  });

  it('should not have error if any of the controls have value -requireAny ', () => {
    a.setValue(8);
    b.setValue(9);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [requireAny(['a', 'b'])],
      }
    );
    expect(formGroup.invalid).toBe(false);
  });

  it('should have error if none of the controls have value -requireAny ', () => {
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [requireAny(['a', 'b'])],
      }
    );
    expect(formGroup.invalid).toBe(true);
  });

  it('should not have error if both A and B - requireAandB', () => {
    a.setValue(8);
    b.setValue(9);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [requireAandB('a', 'b')],
      }
    );
    expect(formGroup.invalid).toBe(false);
  });

  it('should have error if either A or B - requireAandB', () => {
    a.setValue(null);
    b.setValue(9);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [requireAandB('a', 'b')],
      }
    );
    expect(formGroup.invalid).toBe(true);
  });

  it('should not have error if either A or B has value - requireAxorB ', () => {
    a.setValue(8);
    b.setValue(null);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [requireAxorB('a', 'b')],
      }
    );
    expect(formGroup.invalid).toBe(false);
  });

  it('should have error if both A and B have value - requireAxorB', () => {
    a.setValue(8);
    b.setValue(9);
    formGroup = new UntypedFormGroup(
      { a, b },
      {
        validators: [requireAxorB('a', 'b')],
      }
    );
    expect(formGroup.invalid).toBe(true);
  });
});
