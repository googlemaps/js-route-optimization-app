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
import { setControlDisabled } from 'src/app/util';
import {
  ActiveFilter,
  FilterForm,
  FilterOption,
  StringFilterOperation,
  StringFilterParams,
} from '../../models';

@Component({
  selector: 'app-filter-string-form',
  templateUrl: './filter-string-form.component.html',
  styleUrls: ['./filter-string-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterStringFormComponent implements FilterForm, OnInit {
  @Input() filterOption: FilterOption;
  @Input() filter?: ActiveFilter;
  @Output() apply = new EventEmitter<void>();

  get invalid(): boolean {
    return this.form.invalid;
  }
  get StringFilterOperation(): typeof StringFilterOperation {
    return StringFilterOperation;
  }

  readonly form: UntypedFormGroup;
  readonly operationCtrl: UntypedFormControl;
  readonly valueCtrl: UntypedFormControl;
  readonly operations = Object.entries(StringFilterOperation)
    .map(([_, value]) => value)
    .sort();

  constructor(@Inject(LOCALE_ID) private locale: string, fb: UntypedFormBuilder) {
    this.form = fb.group({
      operation: (this.operationCtrl = fb.control(StringFilterOperation.Contains)),
      value: (this.valueCtrl = fb.control('', this.valueValidator)),
    });
    this.operationCtrl.valueChanges.subscribe((operation: StringFilterOperation) => {
      setControlDisabled(this.valueCtrl, operation === StringFilterOperation.Empty);
    });
  }

  ngOnInit(): void {
    if (this.filter?.params) {
      this.form.reset(this.filter.params);
    }
  }

  getLabel(): string {
    const operation: StringFilterOperation = this.operationCtrl.value;
    if (operation === StringFilterOperation.Empty) {
      return `${this.filterOption.label} is empty`;
    }
    return `${this.filterOption.label} ${operation.toLocaleLowerCase(this.locale)} "${
      this.valueCtrl.value
    }"`;
  }

  getValue(): StringFilterParams {
    return this.form.value;
  }

  private valueValidator(control: UntypedFormControl): { [error: string]: boolean } {
    const value = control.value as string;
    if (!value?.toString().trim().length) {
      return { required: true };
    }
    return null;
  }
}
