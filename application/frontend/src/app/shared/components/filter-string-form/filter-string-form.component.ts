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
