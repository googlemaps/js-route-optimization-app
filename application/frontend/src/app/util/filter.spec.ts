/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Long from 'long';
import {
  applyBooleanFilter,
  applyDateFilter,
  applyDurationFilter,
  applyLongValueFilter,
  applyNumberValueFilter,
  applyStringFilter,
} from '.';
import {
  BooleanFilterOperation,
  DateFilterOperation,
  NumberFilterOperation,
  StringFilterOperation,
} from '../shared/models';

describe('util', () => {
  const emptyParams = { operation: NumberFilterOperation.Empty };
  const equalParams = { operation: NumberFilterOperation.Equal, value: 5 };
  const greaterThanParams = { operation: NumberFilterOperation.GreaterThan, value: 5 };
  const greaterThanOrEqualParams = {
    operation: NumberFilterOperation.GreaterThanOrEqual,
    value: 5,
  };
  const lessThanParams = { operation: NumberFilterOperation.LessThan, value: 5 };
  const lessThanOrEqualParams = { operation: NumberFilterOperation.LessThanOrEqual, value: 5 };
  const betweenParams = { operation: NumberFilterOperation.Between, value: 5, value2: 10 };

  describe('applyBooleanFilter', () => {
    it('should return true 0', () => {
      expect(applyBooleanFilter(false, { operation: BooleanFilterOperation.False })).toEqual(true);
    });
    it('should return false 1', () => {
      expect(applyBooleanFilter(true, { operation: BooleanFilterOperation.False })).toEqual(false);
    });
    it('should return true 2', () => {
      expect(applyBooleanFilter(true, { operation: BooleanFilterOperation.True })).toEqual(true);
    });
    it('should return false 3', () => {
      expect(applyBooleanFilter(false, { operation: BooleanFilterOperation.True })).toEqual(false);
    });
  });

  describe('applyLongValueFilter', () => {
    // empty operation
    it('empty value null input - true', () => {
      expect(applyLongValueFilter(null, emptyParams)).toEqual(true);
    });
    it('empty string - false', () => {
      expect(applyLongValueFilter('0', emptyParams)).toEqual(false);
    });
    it('empty string - true ', () => {
      expect(applyLongValueFilter('', emptyParams)).toEqual(false);
    });
    it('empty int - false', () => {
      expect(applyLongValueFilter(0, emptyParams)).toEqual(false);
    });
    it('empty long - false', () => {
      expect(applyLongValueFilter(Long.ZERO, emptyParams)).toEqual(false);
    });

    // equal operation
    it('equal value null input - false', () => {
      expect(applyLongValueFilter(null, equalParams)).toEqual(false);
    });
    it('equal string - false', () => {
      expect(applyLongValueFilter('0', equalParams)).toEqual(false);
    });
    it('equal string - true ', () => {
      expect(applyLongValueFilter('5', equalParams)).toEqual(true);
    });
    it('equal int - false', () => {
      expect(applyLongValueFilter(0, equalParams)).toEqual(false);
    });
    it('equal int - true', () => {
      expect(applyLongValueFilter(5, equalParams)).toEqual(true);
    });
    it('equal long - false', () => {
      expect(applyLongValueFilter(Long.ZERO, equalParams)).toEqual(false);
    });
    it('equal long - true', () => {
      expect(applyLongValueFilter(Long.fromInt(5), equalParams)).toEqual(true);
    });

    // greater than operation
    it('greaterThan value null input - false', () => {
      expect(applyLongValueFilter(null, greaterThanParams)).toEqual(false);
    });
    it('greaterThan string - false', () => {
      expect(applyLongValueFilter('5', greaterThanParams)).toEqual(false);
    });
    it('greaterThan string - true ', () => {
      expect(applyLongValueFilter('6', greaterThanParams)).toEqual(true);
    });
    it('greaterThan int - false', () => {
      expect(applyLongValueFilter(5, greaterThanParams)).toEqual(false);
    });
    it('greaterThan int - true', () => {
      expect(applyLongValueFilter(6, greaterThanParams)).toEqual(true);
    });
    it('greaterThan long - false', () => {
      expect(applyLongValueFilter(Long.fromInt(5), greaterThanParams)).toEqual(false);
    });
    it('greaterThan long - true', () => {
      expect(applyLongValueFilter(Long.fromInt(6), greaterThanParams)).toEqual(true);
    });

    // greater than or equal operation
    it('greaterThanOrEqualParams value null input - false', () => {
      expect(applyLongValueFilter(null, greaterThanOrEqualParams)).toEqual(false);
    });
    it('greaterThanOrEqualParams string - false', () => {
      expect(applyLongValueFilter('4', greaterThanOrEqualParams)).toEqual(false);
    });
    it('greaterThanOrEqualParams string - true ', () => {
      expect(applyLongValueFilter('5', greaterThanOrEqualParams)).toEqual(true);
    });
    it('greaterThanOrEqualParams int - false', () => {
      expect(applyLongValueFilter(4, greaterThanOrEqualParams)).toEqual(false);
    });
    it('greaterThanOrEqualParams int - true', () => {
      expect(applyLongValueFilter(5, greaterThanOrEqualParams)).toEqual(true);
    });
    it('greaterThanOrEqualParams long - false', () => {
      expect(applyLongValueFilter(Long.fromInt(4), greaterThanOrEqualParams)).toEqual(false);
    });
    it('greaterThanOrEqualParams long - true', () => {
      expect(applyLongValueFilter(Long.fromInt(5), greaterThanOrEqualParams)).toEqual(true);
    });

    // greater than operation
    it('lessThan value null input - true', () => {
      expect(applyLongValueFilter(null, lessThanParams)).toEqual(true);
    });
    it('lessThan string - false', () => {
      expect(applyLongValueFilter('5', lessThanParams)).toEqual(false);
    });
    it('lessThan string - true ', () => {
      expect(applyLongValueFilter('4', lessThanParams)).toEqual(true);
    });
    it('lessThan int - false', () => {
      expect(applyLongValueFilter(5, lessThanParams)).toEqual(false);
    });
    it('lessThan int - true', () => {
      expect(applyLongValueFilter(4, lessThanParams)).toEqual(true);
    });
    it('lessThan long - false', () => {
      expect(applyLongValueFilter(Long.fromInt(5), lessThanParams)).toEqual(false);
    });
    it('lessThan long - true', () => {
      expect(applyLongValueFilter(Long.fromInt(4), lessThanParams)).toEqual(true);
    });

    // greater than or equal operation
    it('lessThanOrEqual value null input - true', () => {
      expect(applyLongValueFilter(null, lessThanOrEqualParams)).toEqual(true);
    });
    it('lessThanOrEqual string - false', () => {
      expect(applyLongValueFilter('6', lessThanOrEqualParams)).toEqual(false);
    });
    it('lessThanOrEqual string - true ', () => {
      expect(applyLongValueFilter('5', lessThanOrEqualParams)).toEqual(true);
    });
    it('lessThanOrEqual int - false', () => {
      expect(applyLongValueFilter(6, lessThanOrEqualParams)).toEqual(false);
    });
    it('lessThanOrEqual int - true', () => {
      expect(applyLongValueFilter(5, lessThanOrEqualParams)).toEqual(true);
    });
    it('lessThanOrEqual long - false', () => {
      expect(applyLongValueFilter(Long.fromInt(6), lessThanOrEqualParams)).toEqual(false);
    });
    it('lessThanOrEqual long - true', () => {
      expect(applyLongValueFilter(Long.fromInt(5), lessThanOrEqualParams)).toEqual(true);
    });

    // between operation
    it('between value null input - true', () => {
      expect(applyLongValueFilter(null, betweenParams)).toEqual(false);
    });
    it('between string - lower bound true', () => {
      expect(applyLongValueFilter('5', betweenParams)).toEqual(true);
    });
    it('between string - upper bound true', () => {
      expect(applyLongValueFilter('10', betweenParams)).toEqual(true);
    });
    it('between string - below lower bound false', () => {
      expect(applyLongValueFilter('4', betweenParams)).toEqual(false);
    });
    it('between string - above upper bound false', () => {
      expect(applyLongValueFilter('12', betweenParams)).toEqual(false);
    });
    it('between int - lower bound true', () => {
      expect(applyLongValueFilter(5, betweenParams)).toEqual(true);
    });
    it('between int - upper bound true', () => {
      expect(applyLongValueFilter(10, betweenParams)).toEqual(true);
    });
    it('between int - below lower bound false', () => {
      expect(applyLongValueFilter(3, betweenParams)).toEqual(false);
    });
    it('between int - above upper bound false', () => {
      expect(applyLongValueFilter(13, betweenParams)).toEqual(false);
    });
    it('between long - lower bound true', () => {
      expect(applyLongValueFilter(Long.fromInt(5), betweenParams)).toEqual(true);
    });
    it('between long - upper bound true', () => {
      expect(applyLongValueFilter(Long.fromInt(10), betweenParams)).toEqual(true);
    });
    it('between long - below lower bound false', () => {
      expect(applyLongValueFilter(Long.fromInt(4), betweenParams)).toEqual(false);
    });
    it('between long - above upper bound false', () => {
      expect(applyLongValueFilter(Long.fromInt(11), betweenParams)).toEqual(false);
    });
  });

  describe('applyNumberValueFilter', () => {
    // empty operation
    it('NumberValue empty value null input - true', () => {
      expect(applyNumberValueFilter(null, emptyParams)).toEqual(true);
    });
    it('NumberValue empty int - false', () => {
      expect(applyNumberValueFilter(0, emptyParams)).toEqual(false);
    });

    // equal operation
    it('NumberValue equal value null input - false', () => {
      expect(applyNumberValueFilter(null, equalParams)).toEqual(false);
    });
    it('NumberValue equal int - false', () => {
      expect(applyNumberValueFilter(0, equalParams)).toEqual(false);
    });
    it('NumberValue equal int - true', () => {
      expect(applyNumberValueFilter(5, equalParams)).toEqual(true);
    });

    // greater than operation
    it('NumberValue greaterThan value null input - false', () => {
      expect(applyNumberValueFilter(null, greaterThanParams)).toEqual(false);
    });
    it('NumberValue greaterThan int - false', () => {
      expect(applyNumberValueFilter(5, greaterThanParams)).toEqual(false);
    });
    it('NumberValue greaterThan int - true', () => {
      expect(applyNumberValueFilter(6, greaterThanParams)).toEqual(true);
    });

    // greater than or equal operation
    it('NumberValue greaterThanOrEqualParams value null input - false', () => {
      expect(applyNumberValueFilter(null, greaterThanOrEqualParams)).toEqual(false);
    });
    it('NumberValue greaterThanOrEqualParams int - false', () => {
      expect(applyNumberValueFilter(4, greaterThanOrEqualParams)).toEqual(false);
    });
    it('NumberValue greaterThanOrEqualParams int - true', () => {
      expect(applyNumberValueFilter(5, greaterThanOrEqualParams)).toEqual(true);
    });

    // greater than operation
    it('NumberValue lessThan value null input - true', () => {
      expect(applyNumberValueFilter(null, lessThanParams)).toEqual(true);
    });
    it('NumberValue lessThan int - false', () => {
      expect(applyNumberValueFilter(5, lessThanParams)).toEqual(false);
    });
    it('NumberValue lessThan int - true', () => {
      expect(applyNumberValueFilter(4, lessThanParams)).toEqual(true);
    });

    // greater than or equal operation
    it('NumberValue lessThanOrEqual value null input - true', () => {
      expect(applyNumberValueFilter(null, lessThanOrEqualParams)).toEqual(true);
    });
    it('NumberValue lessThanOrEqual int - false', () => {
      expect(applyNumberValueFilter(6, lessThanOrEqualParams)).toEqual(false);
    });
    it('NumberValue lessThanOrEqual int - true', () => {
      expect(applyNumberValueFilter(5, lessThanOrEqualParams)).toEqual(true);
    });

    // between operation
    it('NumberValue between value null input - true', () => {
      expect(applyNumberValueFilter(null, betweenParams)).toEqual(false);
    });
    it('NumberValue between int - lower bound true', () => {
      expect(applyNumberValueFilter(5, betweenParams)).toEqual(true);
    });
    it('NumberValue between int - upper bound true', () => {
      expect(applyNumberValueFilter(10, betweenParams)).toEqual(true);
    });
    it('NumberValue between int - below lower bound false', () => {
      expect(applyNumberValueFilter(3, betweenParams)).toEqual(false);
    });
    it('NumberValue between int - above upper bound false', () => {
      expect(applyNumberValueFilter(13, betweenParams)).toEqual(false);
    });
  });

  describe('applyDurationFilter', () => {
    // empty operation
    it('DurationFilter empty value null input - true', () => {
      expect(applyDurationFilter(null, emptyParams)).toEqual(true);
    });
    it('DurationFilter empty non null input - false', () => {
      expect(applyDurationFilter({ seconds: 0 }, emptyParams)).toEqual(false);
    });

    // equal operation
    it('DurationFilter equal value null input - false', () => {
      expect(applyDurationFilter(null, equalParams)).toEqual(false);
    });
    it('DurationFilter equal int - false', () => {
      expect(applyDurationFilter({ seconds: 0 }, equalParams)).toEqual(false);
    });
    it('DurationFilter equal int - true', () => {
      expect(applyDurationFilter({ seconds: 5 }, equalParams)).toEqual(true);
    });

    // greater than operation
    it('DurationFilter greaterThan value null input - false', () => {
      expect(applyDurationFilter(null, greaterThanParams)).toEqual(false);
    });
    it('DurationFilter greaterThan int - false', () => {
      expect(applyDurationFilter({ seconds: 5 }, greaterThanParams)).toEqual(false);
    });
    it('DurationFilter greaterThan int - true', () => {
      expect(applyDurationFilter({ seconds: 6 }, greaterThanParams)).toEqual(true);
    });

    // greater than or equal operation
    it('DurationFilter greaterThanOrEqualParams value null input - false', () => {
      expect(applyDurationFilter(null, greaterThanOrEqualParams)).toEqual(false);
    });
    it('DurationFilter greaterThanOrEqualParams int - false', () => {
      expect(applyDurationFilter({ seconds: 4 }, greaterThanOrEqualParams)).toEqual(false);
    });
    it('DurationFilter greaterThanOrEqualParams int - true', () => {
      expect(applyDurationFilter({ seconds: 5 }, greaterThanOrEqualParams)).toEqual(true);
    });

    // greater than operation
    it('DurationFilter lessThan value null input - true', () => {
      expect(applyDurationFilter(null, lessThanParams)).toEqual(true);
    });
    it('DurationFilter lessThan int - false', () => {
      expect(applyDurationFilter({ seconds: 5 }, lessThanParams)).toEqual(false);
    });
    it('DurationFilter lessThan int - true', () => {
      expect(applyDurationFilter({ seconds: 4 }, lessThanParams)).toEqual(true);
    });

    // greater than or equal operation
    it('DurationFilter lessThanOrEqual value null input - true', () => {
      expect(applyDurationFilter(null, lessThanOrEqualParams)).toEqual(true);
    });
    it('DurationFilter lessThanOrEqual int - false', () => {
      expect(applyDurationFilter({ seconds: 6 }, lessThanOrEqualParams)).toEqual(false);
    });
    it('DurationFilter lessThanOrEqual int - true', () => {
      expect(applyDurationFilter({ seconds: 5 }, lessThanOrEqualParams)).toEqual(true);
    });

    // between operation
    it('DurationFilter between value null input - true', () => {
      expect(applyDurationFilter(null, betweenParams)).toEqual(false);
    });
    it('DurationFilter between int - lower bound true', () => {
      expect(applyDurationFilter({ seconds: 5 }, betweenParams)).toEqual(true);
    });
    it('DurationFilter between int - upper bound true', () => {
      expect(applyDurationFilter({ seconds: 10 }, betweenParams)).toEqual(true);
    });
    it('DurationFilter between int - below lower bound false', () => {
      expect(applyDurationFilter({ seconds: 3 }, betweenParams)).toEqual(false);
    });
    it('DurationFilter between int - above upper bound false', () => {
      expect(applyDurationFilter({ seconds: 13 }, betweenParams)).toEqual(false);
    });
  });

  describe('applyStringFilter', () => {
    const isEmptyParams = { operation: StringFilterOperation.Empty };
    const isParams = { operation: StringFilterOperation.Is, value: 'Test' };
    const startsWithParams = { operation: StringFilterOperation.StartsWith, value: 'Te' };
    const containsParams = { operation: StringFilterOperation.Contains, value: 'es' };

    // empty operation
    it('StringFilter empty null input - true', () => {
      expect(applyStringFilter(null, isEmptyParams)).toEqual(true);
    });
    it('StringFilter empty string - true', () => {
      expect(applyStringFilter('', isEmptyParams)).toEqual(true);
    });
    it('StringFilter empty string - false', () => {
      expect(applyStringFilter('Test', isEmptyParams)).toEqual(false);
    });

    // is operation
    it('StringFilter is null input - true', () => {
      expect(applyStringFilter(null, isParams)).toEqual(false);
    });
    it('StringFilter is empty string - false', () => {
      expect(applyStringFilter('', isParams)).toEqual(false);
    });
    it('StringFilter is string - false', () => {
      expect(applyStringFilter('Test1', isParams)).toEqual(false);
    });
    it('StringFilter is string - true', () => {
      expect(applyStringFilter('Test', isParams)).toEqual(true);
    });

    // startsWith operation
    it('StringFilter startsWith null input - true', () => {
      expect(applyStringFilter(null, startsWithParams)).toEqual(false);
    });
    it('StringFilter startsWith empty string - false', () => {
      expect(applyStringFilter('', startsWithParams)).toEqual(false);
    });
    it('StringFilter startsWith string - false', () => {
      expect(applyStringFilter('est', startsWithParams)).toEqual(false);
    });
    it('StringFilter startsWith string - true', () => {
      expect(applyStringFilter('Te', startsWithParams)).toEqual(true);
    });

    // contains operation
    it('StringFilter contains null input - true', () => {
      expect(applyStringFilter(null, containsParams)).toEqual(false);
    });
    it('StringFilter contains empty string - false', () => {
      expect(applyStringFilter('', containsParams)).toEqual(false);
    });
    it('StringFilter contains string - false', () => {
      expect(applyStringFilter('invalid', containsParams)).toEqual(false);
    });
    it('StringFilter contains string - true', () => {
      expect(applyStringFilter('Test', containsParams)).toEqual(true);
    });
  });

  describe('applyDateFilter', () => {
    const dateGreaterThanParams = {
      operation: DateFilterOperation.GreaterThan,
      value: 5,
      value2: 20,
    };
    const dateGreaterThanOrEqualParams = {
      operation: DateFilterOperation.GreaterThanOrEqual,
      value: 5,
      value2: 20,
    };
    const dateLessThanParams = { operation: DateFilterOperation.LessThan, value: 5, value2: 20 };
    const dateLessThanOrEqualParams = {
      operation: DateFilterOperation.LessThanOrEqual,
      value: 5,
      value2: 20,
    };
    const dateBetweenParams = { operation: DateFilterOperation.Between, value: 5, value2: 20 };
    // dateGreaterThan operation
    it('DateFilter greaterThan null input - false', () => {
      expect(applyDateFilter(null, 1, dateGreaterThanParams)).toEqual(false);
    });
    it('DateFilter greaterThan lesser input - false', () => {
      expect(applyDateFilter(0, 1, dateGreaterThanParams)).toEqual(false);
    });
    it('DateFilter greaterThan equal input - false', () => {
      expect(applyDateFilter(20, 1, dateGreaterThanParams)).toEqual(false);
    });
    it('DateFilter greaterThan valid input - true', () => {
      expect(applyDateFilter(26, 1, dateGreaterThanParams)).toEqual(true);
    });

    // dateGreaterThanOrEqual operation
    it('DateFilter greaterThanOrEqual null input - false', () => {
      expect(applyDateFilter(null, 1, dateGreaterThanOrEqualParams)).toEqual(false);
    });
    it('DateFilter greaterThanOrEqual lesser input - false', () => {
      expect(applyDateFilter(13, 1, dateGreaterThanOrEqualParams)).toEqual(false);
    });
    it('DateFilter greaterThanOrEqual equal input - true', () => {
      expect(applyDateFilter(20, 1, dateGreaterThanOrEqualParams)).toEqual(true);
    });
    it('DateFilter greaterThanOrEqual valid input - true', () => {
      expect(applyDateFilter(26, 1, dateGreaterThanOrEqualParams)).toEqual(true);
    });

    // dateLessThan operation
    it('DateFilter lessThan null input - true', () => {
      expect(applyDateFilter(null, null, dateLessThanParams)).toEqual(true);
    });
    it('DateFilter lessThan greater input - false', () => {
      expect(applyDateFilter(null, 10, dateLessThanParams)).toEqual(false);
    });
    it('DateFilter lessThan equal input - false', () => {
      expect(applyDateFilter(null, 5, dateLessThanParams)).toEqual(false);
    });
    it('DateFilter lessThan valid input - true', () => {
      expect(applyDateFilter(2, 2, dateLessThanParams)).toEqual(true);
    });

    // dateGreaterThanOrEqual operation
    it('DateFilter null input - true', () => {
      expect(applyDateFilter(null, null, dateLessThanOrEqualParams)).toEqual(true);
    });
    it('DateFilter dateLessThanOrEqual greater input - false', () => {
      expect(applyDateFilter(0, 10, dateLessThanOrEqualParams)).toEqual(false);
    });
    it('DateFilter dateLessThanOrEqual equal input - true', () => {
      expect(applyDateFilter(1, 5, dateLessThanOrEqualParams)).toEqual(true);
    });
    it('DateFilter dateLessThanOrEqual valid input - true', () => {
      expect(applyDateFilter(2, 2, dateLessThanOrEqualParams)).toEqual(true);
    });

    // dateBetween operation
    it('DateFilter dateBetween null input - false', () => {
      expect(applyDateFilter(null, null, dateBetweenParams)).toEqual(false);
    });
    it('DateFilter dateBetween lesser end - false', () => {
      expect(applyDateFilter(0, 4, dateBetweenParams)).toEqual(false);
    });
    it('DateFilter dateBetween greater start - false', () => {
      expect(applyDateFilter(6, 4, dateBetweenParams)).toEqual(false);
    });
    it('DateFilter dateBetween equal start and end - true', () => {
      expect(applyDateFilter(5, 20, dateBetweenParams)).toEqual(true);
    });
    it('DateFilter dateBetween valid start and end - true', () => {
      expect(applyDateFilter(4, 25, dateBetweenParams)).toEqual(true);
    });
  });
});
