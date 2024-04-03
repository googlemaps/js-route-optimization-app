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
  NumberFilterOperation,
  NumberFilterParams,
} from '../../models';

@Component({
  selector: 'app-filter-number-form',
  templateUrl: './filter-number-form.component.html',
  styleUrls: ['./filter-number-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterNumberFormComponent implements FilterForm, OnInit {
  @Input() filterOption: FilterOption;
  @Input() filter?: ActiveFilter;
  @Output() apply = new EventEmitter<void>();

  get invalid(): boolean {
    return this.form.invalid;
  }
  get NumberFilterOperation(): typeof NumberFilterOperation {
    return NumberFilterOperation;
  }
  get valueLabel(): string {
    return this.operationCtrl.value !== NumberFilterOperation.Between ? 'Value' : 'Min Value';
  }

  readonly form: UntypedFormGroup;
  readonly operationCtrl: UntypedFormControl;
  readonly valueCtrl: UntypedFormControl;
  readonly value2Ctrl: UntypedFormControl;
  readonly operations = Object.entries(NumberFilterOperation)
    .map(([_, value]) => value)
    .sort();

  constructor(@Inject(LOCALE_ID) private locale: string, fb: UntypedFormBuilder) {
    this.form = fb.group({
      operation: (this.operationCtrl = fb.control(NumberFilterOperation.Equal)),
      value: (this.valueCtrl = fb.control(null, this.valueValidator)),
      value2: (this.value2Ctrl = fb.control({ value: null, disabled: true }, this.valueValidator)),
    });
    this.operationCtrl.valueChanges.subscribe((operation: NumberFilterOperation) => {
      setControlDisabled(this.valueCtrl, operation === NumberFilterOperation.Empty);
      setControlDisabled(this.value2Ctrl, operation !== NumberFilterOperation.Between);
    });
  }

  ngOnInit(): void {
    if (this.filter?.params) {
      this.form.reset(this.filter.params);
    }
  }

  getLabel(): string {
    const operation: NumberFilterOperation = this.operationCtrl.value;
    if (operation === NumberFilterOperation.Empty) {
      return `${this.filterOption.label} is empty`;
    }
    if (operation === NumberFilterOperation.Between) {
      return `${this.filterOption.label} between ${this.valueCtrl.value} and ${this.value2Ctrl.value}`;
    }
    return `${this.filterOption.label} ${operation.toLocaleLowerCase(this.locale)} ${
      this.valueCtrl.value
    }`;
  }

  getValue(): NumberFilterParams {
    return this.form.value;
  }

  private valueValidator(control: UntypedFormControl): { [error: string]: boolean } {
    const value = control.value as number;
    if (!value?.toString().trim().length) {
      return { required: true };
    }
    return null;
  }
}
