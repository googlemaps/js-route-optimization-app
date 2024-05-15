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
