/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { EventEmitter } from '@angular/core';

export interface FilterForm {
  filterOption: FilterOption;
  filter?: ActiveFilter;
  invalid: boolean;
  apply: EventEmitter<void>;
  getLabel(): string;
  getValue(): FilterParams;
}

export enum FilterType {
  Boolean,
  Date,
  Number,
  String,
}

export enum BooleanFilterOperation {
  True = 'True',
  False = 'False',
}

export enum DateFilterOperation {
  Equal = '=',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
  Between = 'Between',
}

export enum NumberFilterOperation {
  Equal = '=',
  GreaterThan = '>',
  GreaterThanOrEqual = '>=',
  LessThan = '<',
  LessThanOrEqual = '<=',
  Between = 'Between',
  Empty = 'Empty',
}

export enum StringFilterOperation {
  Contains = 'Contains',
  StartsWith = 'Starts With',
  Is = 'Is',
  Empty = 'Empty',
}

export interface BooleanFilterParams {
  operation: BooleanFilterOperation;
}

export interface DateFilterParams {
  operation: DateFilterOperation;
  value?: number;
  value2?: number;
  timeSpecified?: boolean;
  time2Specified?: boolean;
}

export interface NumberFilterParams {
  operation: NumberFilterOperation;
  value?: number;
  value2?: number;
}

export interface SelectFilterParams<T = any> {
  value: T;
}

export interface StringFilterParams {
  operation: StringFilterOperation;
  value?: string;
}

export type FilterParams =
  | BooleanFilterParams
  | DateFilterParams
  | NumberFilterParams
  | SelectFilterParams
  | StringFilterParams;

export interface FilterOption<
  TContext = any,
  TPredicate extends (context: TContext, params?: FilterParams) => boolean = any,
  TFilterForm extends FilterForm = any
> {
  id: string;
  label: string;
  form?: () => new (...params: any[]) => TFilterForm;
  formInit?: (form: TFilterForm) => void;
  predicate: TPredicate;
  [key: string]: any;
}

export interface ActiveFilter {
  id: string;
  label: string;
  params?: FilterParams;
}
