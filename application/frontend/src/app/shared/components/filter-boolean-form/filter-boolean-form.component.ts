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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import {
  ActiveFilter,
  BooleanFilterOperation,
  BooleanFilterParams,
  FilterForm,
  FilterOption,
} from '../../models';

@Component({
  selector: 'app-filter-boolean-form',
  templateUrl: './filter-boolean-form.component.html',
  styleUrls: ['./filter-boolean-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBooleanFormComponent implements FilterForm, OnInit {
  @Input() filterOption: FilterOption;
  @Input() filter?: ActiveFilter;
  @Output() apply = new EventEmitter<void>();

  get invalid(): boolean {
    return this.form.invalid;
  }

  readonly form: UntypedFormGroup;
  readonly operationCtrl: UntypedFormControl;
  readonly operations = Object.entries(BooleanFilterOperation)
    .map(([_, value]) => value)
    .sort();

  constructor(@Inject(LOCALE_ID) private locale: string, fb: UntypedFormBuilder) {
    this.form = fb.group({
      operation: (this.operationCtrl = fb.control(BooleanFilterOperation.True)),
    });
  }

  ngOnInit(): void {
    if (this.filter?.params) {
      this.form.reset(this.filter.params);
    }
  }

  getLabel(): string {
    const operation: BooleanFilterOperation = this.operationCtrl.value;
    return `${this.filterOption.label} is ${operation.toLocaleLowerCase(this.locale)}`;
  }

  getValue(): BooleanFilterParams {
    return this.form.value;
  }
}
