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
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActiveFilter, FilterForm, FilterOption, SelectFilterParams } from '../../models';

type Option<TValue> = { label: string; value: TValue };

@Component({
  selector: 'app-filter-select-form',
  templateUrl: './filter-select-form.component.html',
  styleUrls: ['./filter-select-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSelectFormComponent<TValue = any> implements FilterForm, OnInit {
  @Input() options: Option<TValue>[];
  @Input() filterOption: FilterOption;
  @Input() filter?: ActiveFilter;
  @Output() apply = new EventEmitter<void>();

  get invalid(): boolean {
    return this.form.invalid;
  }

  readonly form: UntypedFormGroup;
  readonly optionCtrl: UntypedFormControl;

  constructor(fb: UntypedFormBuilder) {
    this.form = fb.group({
      option: (this.optionCtrl = fb.control(null, this.valueValidator)),
    });
  }

  ngOnInit(): void {
    if (this.options && this.filter?.params) {
      const value = (this.filter.params as SelectFilterParams<TValue>).value;
      const option = this.options.find((o) => o.value === value);
      if (option) {
        this.form.reset({ option });
      }
    }
  }

  getLabel(): string {
    const label = (this.optionCtrl.value as Option<TValue>)?.label;
    return `${this.filterOption.label} is ${label}`;
  }

  getValue(): SelectFilterParams<TValue> {
    return { value: (this.optionCtrl.value as Option<TValue>)?.value };
  }

  setValue(value: TValue): void {
    const option = this.options?.find((o) => o.value === value) ?? null;
    this.optionCtrl.setValue(option);
  }

  private valueValidator(control: UntypedFormControl): { [error: string]: boolean } {
    if (control.value == null) {
      return { required: true };
    }
    return null;
  }
}
