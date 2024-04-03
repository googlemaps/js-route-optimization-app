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
  Component,
  OnInit,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { cloneDeep, durationSeconds } from 'src/app/util';
import { Observable, Subscription } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { selectTimezoneOffset } from '../../selectors/config.selectors';
import { selectVehicleOperatorTypes } from '../../selectors/scenario.selectors';
import * as fromRoot from '../../../reducers';
import { TimeWindowComponent } from 'src/app/shared/components/time-window/time-window.component';
import { VehicleOperator, IVehicleOperator, FormFields } from '../../models';
import { overlapValidator } from 'src/app/shared/components/time-window/validators';

@Component({
  selector: 'app-base-edit-vehicle-operator-dialog',
  templateUrl: './base-edit-vehicle-operator-dialog.component.html',
  styleUrls: ['./base-edit-vehicle-operator-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseEditVehicleOperatorDialogComponent implements OnInit, OnChanges, OnDestroy {
  @Input() bulkEdit: boolean;
  @Input() bulkNumber: number;
  @Input() timezoneOffset?: number;
  @Input() vehicleOperator: VehicleOperator;
  @Input() disabled: boolean;
  @Input() nextOperatorId: number;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ vehicleOperator: VehicleOperator; unsetFields: string[] }>();

  FormFields = FormFields;

  scenarioOperatorTypes$: Observable<Set<string>>;
  timezoneOffset$: Observable<number>;
  filteredOperatorTypes$: Observable<string[]>;
  uniqueOperatorTypes: string[] = [];
  currentOperatorTypeIndex: number;
  unsetFields: string[] = [];

  get invalid(): boolean {
    return this.form.invalid;
  }

  get label(): AbstractControl {
    return this.form.get('label');
  }

  get type(): AbstractControl {
    return this.form.get('type');
  }

  get startTimeWindows(): UntypedFormArray {
    return this.form.get('startTimeWindows') as UntypedFormArray;
  }

  get endTimeWindows(): UntypedFormArray {
    return this.form.get('endTimeWindows') as UntypedFormArray;
  }

  readonly form: UntypedFormGroup;
  labels: string[] = [];
  updatedVehicleOperator: VehicleOperator;

  private readonly subscriptions: Subscription[] = [];

  constructor(
    public overwriteDialog: MatDialog,
    private fb: UntypedFormBuilder,
    private store: Store<fromRoot.State>
  ) {
    this.form = this.createVehicleOperatorsFormGroup(null);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  ngOnInit(): void {
    this.resetVehicleOperator();
    this.resetForm();

    this.timezoneOffset$ = this.store.pipe(select(selectTimezoneOffset), take(1));
    this.scenarioOperatorTypes$ = this.store.pipe(select(selectVehicleOperatorTypes));

    this.store.pipe(select(selectVehicleOperatorTypes)).subscribe((types) => {
      this.uniqueOperatorTypes = [];
      new Set([...(types || [])]).forEach((operator) => {
        if (operator && !this.uniqueOperatorTypes.includes(operator)) {
          this.uniqueOperatorTypes.push(operator);
        }
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.vehicleOperator) {
      this.resetVehicleOperator();
      this.resetForm();
      this.form.markAllAsTouched();
    }

    if (changes.disabled) {
      if (changes.disabled.currentValue && !changes.disabled.previousValue) {
        this.form.disable();
      } else if (!changes.disabled.currentValue && changes.disabled.previousValue) {
        this.form.enable();
      }
    }

    if (changes.nextOperatorId) {
      if (!this.updatedVehicleOperator.id) {
        this.updatedVehicleOperator.id = changes.nextVehicleId.currentValue;
      }
    }

    if (changes.bulkEdit) {
      if (this.bulkEdit && this.type.hasValidator(Validators.required)) {
        this.type.removeValidators(Validators.required);
      }
    }
  }

  resetForm(): void {
    this.form.reset({
      type: this.vehicleOperator?.type,
      label: this.vehicleOperator?.label,
    });

    this.startTimeWindows.clear();
    this.endTimeWindows.clear();

    this.startTimeWindows.push(
      TimeWindowComponent.createFormGroup(
        this.fb,
        this.timezoneOffset,
        this.vehicleOperator?.startTimeWindows?.[0]
      )
    );
    this.endTimeWindows.push(
      TimeWindowComponent.createFormGroup(
        this.fb,
        this.timezoneOffset,
        this.vehicleOperator?.endTimeWindows?.[0]
      )
    );
  }

  startAt(): { startAt: Date } {
    const startTime = durationSeconds(null, null);
    return {
      startAt: startTime != null ? new Date(startTime.toNumber() * 1000) : null,
    };
  }

  endAt(): { endAt: Date } {
    const endTime = durationSeconds(null, null);
    return {
      endAt: endTime != null ? new Date(endTime.toNumber() * 1000) : null,
    };
  }

  resetVehicleOperator(): void {
    if (!this.vehicleOperator) {
      this.vehicleOperator = {
        id: this.nextOperatorId,
      };
    }
    this.updatedVehicleOperator = cloneDeep(this.vehicleOperator);
  }

  private createVehicleOperatorsFormGroup(value: IVehicleOperator = null): UntypedFormGroup {
    return this.fb.group(
      {
        type: [value?.type || [], this.bulkEdit ? [] : [Validators.required]],
        label: [value?.label || []],
        startTimeWindows: this.fb.array([], (formArray: UntypedFormArray) =>
          overlapValidator(formArray)
        ),
        endTimeWindows: this.fb.array([], (formArray: UntypedFormArray) =>
          overlapValidator(formArray)
        ),
      },
      { updateOn: 'blur' }
    );
  }

  formToUpdatedVehicleOperator(): void {
    this.updatedVehicleOperator.type = this.type.value;
    this.updatedVehicleOperator.label = this.label.value;
    this.updatedVehicleOperator.startTimeWindows = TimeWindowComponent.createTimeWindows(
      this.startTimeWindows,
      this.timezoneOffset
    );
    this.updatedVehicleOperator.endTimeWindows = TimeWindowComponent.createTimeWindows(
      this.endTimeWindows,
      this.timezoneOffset
    );
  }

  timeWindowsChanged(timeWindows: UntypedFormArray): boolean {
    return timeWindows.value.some(
      (window) => window.startTime || window.startDate || window.endTime || window.endDate
    );
  }

  onSave(): void {
    this.form.markAllAsTouched();
    this.formToUpdatedVehicleOperator();
    this.save.emit({ vehicleOperator: this.updatedVehicleOperator, unsetFields: this.unsetFields });
  }

  isUnset(field: string): boolean {
    return this.bulkEdit && this.unsetFields.includes(field);
  }

  onUnsetChange(result: { field: string }): void {
    const index = this.unsetFields.indexOf(result.field);
    if (index !== -1) {
      this.unsetFields.splice(index, 1);
    } else {
      this.unsetFields.push(result.field);
    }
  }

  setOperatorAutocompleteFocus(index: number): void {
    if (this.currentOperatorTypeIndex === index) {
      return;
    }
    this.currentOperatorTypeIndex = index;
    this.filteredOperatorTypes$ = this.form.get('type').valueChanges.pipe(
      startWith(''),
      map((value) => this.filterOperatorTypes(value))
    );
  }

  private filterOperatorTypes(value: string): string[] {
    return this.uniqueOperatorTypes.filter(this.getOperatorTypesPredicateFn(value));
  }

  private getOperatorTypesPredicateFn(value: string): (operatorType: string) => boolean {
    const operatorTypesInUse =
      this.form.get('type').value?.length > 0 ? this.form.get('type').value : '';
    const isAvailable = ((operatorType: string) =>
      !((operatorTypesInUse as string[]) || []).includes(operatorType)).bind(this);
    if (value == null) {
      return isAvailable;
    }
    const lowerValue = value.toLowerCase();
    return ((operatorType: string) =>
      isAvailable(operatorType) && operatorType.toLowerCase().includes(lowerValue)).bind(this);
  }
}
