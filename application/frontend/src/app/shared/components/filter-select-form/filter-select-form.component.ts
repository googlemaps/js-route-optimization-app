/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
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

  readonly form: FormGroup;
  readonly optionCtrl: FormControl;

  constructor(fb: FormBuilder) {
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

  private valueValidator(control: FormControl): { [error: string]: boolean } {
    if (control.value == null) {
      return { required: true };
    }
    return null;
  }
}
