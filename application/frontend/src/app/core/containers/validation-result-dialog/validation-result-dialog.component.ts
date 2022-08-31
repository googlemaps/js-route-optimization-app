/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { ValidationResultActions } from '../../actions';
import { BaseValidationResultDialogComponent } from '../../components';
import { Shipment, ValidationResult, Vehicle } from '../../models';
import ShipmentSelectors from '../../selectors/shipment.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { ValidationService } from '../../services';

@Component({
  selector: 'app-validation-result-dialog',
  templateUrl: './validation-result-dialog.component.html',
  styleUrls: ['./validation-result-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ValidationResultDialogComponent implements OnInit {
  @Input() validationResult: ValidationResult;

  shipmentTimeRangeWarnings$: Observable<Shipment[]>;
  vehicleTimeRangeWarnings$: Observable<Vehicle[]>;
  allowedVehicleWarnings$: Observable<Shipment[]>;

  constructor(
    private dialogRef: MatDialogRef<BaseValidationResultDialogComponent>,
    private validationService: ValidationService,
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit(): void {
    this.allowedVehicleWarnings$ = this.store.pipe(
      select(ShipmentSelectors.selectByIds(this.getAllowedVehicleIndicesShipmentIds())),
      take(1)
    );

    this.shipmentTimeRangeWarnings$ = this.store.pipe(
      select(ShipmentSelectors.selectByIds(this.getShipmentTimeRangeShipmentIds())),
      take(1)
    );
    this.vehicleTimeRangeWarnings$ = this.store.pipe(
      select(fromVehicle.selectByIds(this.getVehicleTimeRangeVehicleIds())),
      take(1)
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onOk(): void {
    this.store.dispatch(ValidationResultActions.solve());
    this.dialogRef.close();
  }

  onEditShipment(shipment: Shipment): void {
    this.store.dispatch(ValidationResultActions.editPreSolveShipment({ shipmentId: shipment.id }));
    this.dialogRef.close();
  }

  onEditVehicle(vehicle: Vehicle): void {
    this.store.dispatch(ValidationResultActions.editPreSolveVehicle({ vehicleId: vehicle.id }));
    this.dialogRef.close();
  }

  private getAllowedVehicleIndicesShipmentIds(): number[] {
    return this.validationService.getErrorEntityIds(
      this.validationResult?.shipments,
      'allowedVehicleIndices'
    );
  }

  private getShipmentTimeRangeShipmentIds(): number[] {
    return this.validationService.getErrorEntityIds(
      this.validationResult?.shipments,
      'timeWindowOutOfRange'
    );
  }

  private getVehicleTimeRangeVehicleIds(): number[] {
    return this.validationService.getErrorEntityIds(
      this.validationResult?.vehicles,
      'timeWindowOutOfRange'
    );
  }
}
