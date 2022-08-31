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
  ComponentRef,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ActiveFilter, FilterForm, FilterOption } from '../../models';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterComponent implements OnDestroy, OnInit {
  @ViewChild('content', { read: ViewContainerRef, static: true }) contentRef: ViewContainerRef;
  @Input() filter?: ActiveFilter;
  @Input() filterOption: FilterOption;
  get invalid(): boolean {
    return this.form?.invalid !== false;
  }
  get form(): FilterForm {
    return this.formRef?.instance;
  }
  private formRef: ComponentRef<FilterForm>;
  private subscription: Subscription;
  @HostBinding('class.mat-elevation-z4') readonly elevation = true;

  constructor(private dialogRef: MatDialogRef<FilterComponent, ActiveFilter>) {}

  ngOnInit(): void {
    this.createForm();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.formRef?.destroy();
    this.formRef = null;
  }

  onApply(): void {
    this.dialogRef.close({
      id: this.filterOption.id,
      label: this.form.getLabel(),
      params: this.form.getValue(),
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private createForm(): void {
    if (this.filterOption) {
      this.formRef = this.contentRef.createComponent(this.filterOption.form());
      this.formRef.instance.filter = this.filter;
      this.formRef.instance.filterOption = this.filterOption;
      this.subscription = this.formRef.instance.apply
        .pipe(filter(() => !this.invalid))
        .subscribe(() => this.onApply());
      this.filterOption.formInit?.apply(null, [this.formRef.instance]);
    }
  }
}
