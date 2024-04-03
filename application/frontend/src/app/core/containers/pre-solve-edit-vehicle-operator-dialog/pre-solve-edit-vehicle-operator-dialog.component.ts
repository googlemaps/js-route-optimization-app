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

import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import { selectTimezoneOffset } from '../../selectors/config.selectors';
import * as fromScenario from '../../selectors/scenario.selectors';
import * as fromRoot from '../../../reducers';
import { MessageService } from '../../services';
import * as fromVehicleOperators from '../../selectors/vehicle-operator.selectors';
import { ConfirmBulkEditDialogComponent } from '../../components/confirm-bulk-edit-dialog/confirm-bulk-edit-dialog.component';
import { boundHasOwnProperty } from 'src/app/util';
import { FormFields, VehicleOperator } from '../../models';
import { upsertVehicleOperators } from '../../actions/vehicle-operator.actions';

@Component({
  selector: 'app-pre-solve-edit-vehicle-operator-dialog',
  templateUrl: './pre-solve-edit-vehicle-operator-dialog.component.html',
  styleUrls: ['./pre-solve-edit-vehicle-operator-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSolveEditVehicleOperatorDialogComponent implements OnInit {
  @Input() vehicleOperatorIds: number[];

  bulkEditVehicleOperators: VehicleOperator[];
  vehicleOperator$: Observable<VehicleOperator>;
  nextOperatorId$: Observable<number>;
  timezoneOffset$: Observable<number>;
  disabled$: Observable<boolean>;

  constructor(
    private overwriteDialog: MatDialog,
    private messageService: MessageService,
    private dialogRef: MatDialogRef<PreSolveEditVehicleOperatorDialogComponent>,
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit(): void {
    this.disabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));
    this.timezoneOffset$ = this.store.pipe(select(selectTimezoneOffset), take(1));
    this.nextOperatorId$ = this.store.pipe(
      select(fromVehicleOperators.selectNextVehicleOperatorId),
      take(1)
    );
    if (this.vehicleOperatorIds.length === 1) {
      this.vehicleOperator$ = this.store.pipe(
        select(fromVehicleOperators.selectById(this.vehicleOperatorIds[0])),
        take(1)
      );
    } else {
      this.vehicleOperator$ = of({ id: -1 });
      this.store
        .pipe(select(fromVehicleOperators.selectByIds(this.vehicleOperatorIds)), take(1))
        .subscribe((operators) => (this.bulkEditVehicleOperators = operators));
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(result: { vehicleOperator: VehicleOperator; unsetFields: string[] }): void {
    const vehicleOperator = result.vehicleOperator;
    const operators = this.operatorToSavedOperators(vehicleOperator, result.unsetFields);
    if (operators.length === 1) {
      this.store.dispatch(
        upsertVehicleOperators({
          changeTime: Date.now(),
          vehicleOperators: operators,
        })
      );
      this.dialogRef.close();
    } else {
      const editedFields = this.getEditedFields(vehicleOperator, result.unsetFields);
      if (editedFields.length === 0) {
        this.dialogRef.close();
        this.messageService.info(this.messageService.messages.noChanges);
      } else {
        this.overwriteDialog
          .open(ConfirmBulkEditDialogComponent, {
            data: {
              fields: editedFields,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.store.dispatch(
                upsertVehicleOperators({
                  changeTime: Date.now(),
                  vehicleOperators: operators,
                })
              );
              this.dialogRef.close();
            }
          });
      }
    }
  }

  operatorToSavedOperators(
    operator: VehicleOperator,
    unsetFields: string[] = []
  ): VehicleOperator[] {
    if (this.vehicleOperatorIds.length === 1) {
      return [operator];
    } else {
      return this.bulkEditVehicleOperators.map((originalOperator) => ({
        ...originalOperator,
        ...this.filterUnusedParams(operator),
        ...this.createUnsetFields(unsetFields),
      }));
    }
  }

  private getEditedFields(vehicleOperator: VehicleOperator, unsetFields: string[] = []): string[] {
    const fields = [];
    if (vehicleOperator.label || unsetFields.includes(FormFields.Label)) {
      fields.push('Label');
    }
    if (vehicleOperator.type || unsetFields.includes(FormFields.Type)) {
      fields.push('Type');
    }
    if (
      (vehicleOperator.startTimeWindows?.length &&
        (vehicleOperator.startTimeWindows[0].startTime ||
          vehicleOperator.startTimeWindows[0].endTime)) ||
      unsetFields.includes(FormFields.StartTimeWindows)
    ) {
      fields.push('Start Time Windows');
    }
    if (
      (vehicleOperator.endTimeWindows?.length &&
        (vehicleOperator.endTimeWindows[0].startTime ||
          vehicleOperator.endTimeWindows[0].endTime)) ||
      unsetFields.includes(FormFields.EndTimeWindows)
    ) {
      fields.push('End Time Windows');
    }

    return fields;
  }
  filterUnusedParams(vehicleOperator: VehicleOperator): Partial<VehicleOperator> {
    const filteredVehicle = {};
    Object.keys(vehicleOperator).forEach((key) => {
      const param = vehicleOperator[key];
      if (
        key !== 'id' &&
        param != null &&
        (!boundHasOwnProperty(param, 'length') ||
          (boundHasOwnProperty(param, 'length') && param.length > 0)) &&
        (!(typeof param == 'object') ||
          (typeof param == 'object' && Object.keys(param).filter((each) => param[each]).length > 0))
      ) {
        filteredVehicle[key] = param;
      }
    });
    return filteredVehicle;
  }

  createUnsetFields(unsetFields: string[] = []): Partial<VehicleOperator> {
    const operator: Partial<VehicleOperator> = {};

    unsetFields.forEach((field) => {
      switch (field) {
        case FormFields.Type:
          operator.type = '';
          break;
        case FormFields.Label:
          operator.label = '';
          break;
        case FormFields.StartTimeWindows:
          operator.startTimeWindows = [];
          break;
        case FormFields.EndTimeWindows:
          operator.endTimeWindows = [];
          break;
      }
    });

    return operator;
  }
}
