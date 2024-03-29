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
