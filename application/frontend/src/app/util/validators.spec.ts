/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
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
  let formGroup: FormGroup;
  let date: FormControl;
  let time: FormControl;
  let a: FormControl;
  let b: FormControl;
  let fb: FormBuilder;
  let capacitiesControl: FormControl;
  let extraDurationControl: FormControl;
  let level: FormControl;

  beforeEach(() => {
    fb = new FormBuilder();
    a = new FormControl('');
    b = new FormControl('');
  });
  it('should not have error if duration is within global start and end time - durationWithinGlobalStartEndTime', () => {
    date = new FormControl('');
    time = new FormControl('');
    date.setValue(new Date('July 14, 2019 00:00:00'));
    time.setValue('05:00');
    formGroup = new FormGroup(
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
    date = new FormControl('');
    time = new FormControl('');
    date.setValue(new Date('July 14, 2019 00:00:00'));
    time.setValue('05:00');
    formGroup = new FormGroup(
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
    date = new FormControl('');
    time = new FormControl('');
    time.setValue('05:00');
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
      { a, b },
      {
        validators: [aRequiredIfB('a', 'b', 'aRequiredIfB')],
      }
    );
    expect(formGroup.hasError('aRequiredIfB')).toBe(true);
  });

  it('should not have error if no duplicate capacities - noDuplicateCapacitiesValidator', () => {
    capacitiesControl = new FormControl(
      [
        { type: 'weight_kilograms', value: 100 },
        { type: 'volume_liters', value: 20 },
      ],
      [noDuplicateCapacitiesValidator]
    );
    expect(capacitiesControl.hasError('duplicateCapacities')).toBe(false);
  });

  it('should have error if duplicate capacities - noDuplicateCapacitiesValidator', () => {
    capacitiesControl = new FormControl(
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
    extraDurationControl = new FormControl(
      [
        { visitType: 'Test', extraDuration: { min: 12, sec: 3 } },
        { visitType: 'New', extraDuration: { min: 11, sec: 4 } },
      ],
      [noDuplicateExtraDurationValidator]
    );
    expect(extraDurationControl.hasError('duplicateExtraDuration')).toBe(false);
  });

  it('should have error if duplicate extra duration - noDuplicateExtraDurationValidator', () => {
    extraDurationControl = new FormControl(
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
    a = new FormControl(
      [
        { cost: 12, vehicles: 'Vehicle #2' },
        { cost: 13, vehicles: 'Vehicle #1' },
      ],
      [noDuplicateValuesValidator('cost')]
    );
    expect(a.hasError('duplicateValues')).toBe(false);
  });

  it('should have error if duplicate Values - noDuplicateValuesValidator', () => {
    a = new FormControl(
      [
        { cost: 12, vehicles: 'Vehicle #1' },
        { cost: 12, vehicles: 'Vehicle #1' },
      ],
      [noDuplicateValuesValidator('cost')]
    );
    expect(a.hasError('duplicateValues')).toBe(true);
  });

  it('should not have error if form array does not have duplicate Values - noDuplicateFormArrayValuesValidator', () => {
    a = new FormControl({ types: ['type1', 'type2'], incompatibilityMode: 1 }, []);
    b = new FormControl({ types: ['type1', 'type2'], incompatibilityMode: 2 }, []);
    formGroup = new FormGroup({
      a: fb.array([a, b], (formArray: FormArray) => noDuplicateFormArrayValuesValidator(formArray)),
    });
    expect(formGroup.invalid).toBe(false);
  });

  it('should have error if form array has duplicate Values - noDuplicateFormArrayValuesValidator', () => {
    a = new FormControl({ types: ['type1', 'type2'], incompatibilityMode: 1 }, []);
    b = new FormControl({ types: ['type1', 'type2'], incompatibilityMode: 1 }, []);
    formGroup = new FormGroup({
      a: fb.array([a, b], (formArray: FormArray) => noDuplicateFormArrayValuesValidator(formArray)),
    });
    expect(formGroup.invalid).toBe(true);
  });

  it('should not have error if non negative Integer value - nonNegativeIntegerValidator', () => {
    a = new FormControl(3, [nonNegativeIntegerValidator]);
    expect(a.hasError('nonNegativeInteger')).toBe(false);
  });

  it('should have error if negative Integer value - nonNegativeIntegerValidator', () => {
    a = new FormControl(-3, [nonNegativeIntegerValidator]);
    expect(a.hasError('nonNegativeInteger')).toBe(true);
  });

  it('should not have error if relaxation level other than unspecified - noUnspecifiedRelaxationLevelValidator', () => {
    level = new FormControl(RelaxationLevel.RELAX_VISIT_TIMES_AFTER_THRESHOLD, [
      noUnspecifiedRelaxationLevelValidator,
    ]);
    expect(level.hasError('noUnspecifiedRelaxationLevel')).toBe(false);
  });

  it('should have error if relaxation level is unspecified - noUnspecifiedRelaxationLevelValidator', () => {
    level = new FormControl(RelaxationLevel.LEVEL_UNSPECIFIED, [
      noUnspecifiedRelaxationLevelValidator,
    ]);
    expect(level.hasError('noUnspecifiedRelaxationLevel')).toBe(true);
  });

  it('should not have error if time string valid - timeStringValidator', () => {
    time = new FormControl('05:00', [timeStringValidator]);
    expect(time.hasError('timeString')).toBe(false);
  });

  it('should have error if time string is not valid - timeStringValidator', () => {
    time = new FormControl('test', [timeStringValidator]);
    expect(time.hasError('timeString')).toBe(true);
  });

  it('should not have error if any of the controls have value -requireAny ', () => {
    a.setValue(8);
    b.setValue(9);
    formGroup = new FormGroup(
      { a, b },
      {
        validators: [requireAny(['a', 'b'])],
      }
    );
    expect(formGroup.invalid).toBe(false);
  });

  it('should have error if none of the controls have value -requireAny ', () => {
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
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
    formGroup = new FormGroup(
      { a, b },
      {
        validators: [requireAxorB('a', 'b')],
      }
    );
    expect(formGroup.invalid).toBe(true);
  });
});
