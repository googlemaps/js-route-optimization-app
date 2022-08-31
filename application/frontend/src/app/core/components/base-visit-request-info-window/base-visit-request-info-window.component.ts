/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { formatDate } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  durationSeconds,
  getChosenTimeWindow,
  getEntityName,
  getSoftEndTimeMissedCost,
  getSoftStartTimeMissedCost,
} from 'src/app/util';
import { ITimeWindow, Shipment, Vehicle, Visit, VisitCategory, VisitRequest } from '../../models';

@Component({
  selector: 'app-base-visit-request-info-window',
  templateUrl: './base-visit-request-info-window.component.html',
  styleUrls: ['./base-visit-request-info-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseVisitRequestInfoWindowComponent {
  @ViewChild('vehicleSelection') vehicleSelection!: MatSelect;

  @Input() savePending: boolean;
  @Input() shipment: Shipment;
  @Input() visitRequest: VisitRequest;
  @Input() visit?: Visit;
  @Input() vehicle?: Vehicle;
  @Input() timezoneOffset = 0;
  @Input() postSolve = false;
  @Input() navigation = false;
  @Input() vehicles: Vehicle[];
  @Output() shipmentClick = new EventEmitter<Shipment>();
  @Output() vehicleClick = new EventEmitter<Vehicle>();
  @Output() visitClick = new EventEmitter<Visit>();
  @Output() vehicleAssignmentChange = new EventEmitter<Vehicle>();

  readonly VisitCategory = VisitCategory;
  readonly vehicleCtrl: FormControl;
  readonly optionItemSize = 48;

  get visitCategory(): number {
    return this.shipment?.deliveries.includes(this.visitRequest?.id)
      ? VisitCategory.Delivery
      : VisitCategory.Pickup;
  }

  get chosenTimeWindow(): ITimeWindow {
    return getChosenTimeWindow(this.visitRequest?.timeWindows, this.visit?.startTime);
  }

  get softStartTimeMissedCost(): number {
    return getSoftStartTimeMissedCost(this.chosenTimeWindow, this.visit?.startTime);
  }

  get softEndTimeMissedCost(): number {
    return getSoftEndTimeMissedCost(this.chosenTimeWindow, this.visit?.startTime);
  }

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private fb: FormBuilder,
    public dialog: MatDialog
  ) {
    this.vehicleCtrl = this.fb.control(undefined);
  }

  changeVehicleSelection(selectedVehicle: any): void {
    if (this.vehicle === selectedVehicle) {
      return;
    }

    const shipmentName = getEntityName(this.shipment, 'Shipment');
    const fromVehicleName = getEntityName(this.vehicle, 'Vehicle');
    const toVehicleName = getEntityName(selectedVehicle, 'Vehicle');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog',
      data: {
        title: 'Confirm move shipment',
        message: `Move ${shipmentName} from ${fromVehicleName} to ${toVehicleName}`,
      },
    });

    dialogRef.afterClosed().subscribe((confirm) => {
      if (confirm) {
        this.vehicleAssignmentChange.emit(selectedVehicle);
        return;
      }

      // Reset mat-select to original value on cancel
      this.resetVehicleSelection();
    });
  }

  resetVehicleSelection(): void {
    this.vehicleSelection.value = this.vehicle;
  }

  buildFormattedArrival(): string {
    if (this.visit) {
      const startTime =
        (durationSeconds(this.visit.startTime).toNumber() + this.timezoneOffset) * 1000;
      return this.formatDate(startTime);
    }
  }

  buildFormattedDeparture(): string {
    if (!this.visit) {
      return;
    }
    const startTime = new Date(
      (durationSeconds(this.visit.startTime).toNumber() + this.timezoneOffset) * 1000
    );
    const duration = durationSeconds(this.visitRequest?.duration).toNumber();
    if (startTime.getUTCSeconds() + duration < 60) {
      return;
    }
    return this.formatDate(startTime.getTime() + duration * 1000);
  }

  onShipmentClick(): void {
    if (this.navigation) {
      this.shipmentClick.emit(this.shipment);
    }
  }

  onVehicleClick(): void {
    if (this.navigation) {
      this.vehicleClick.emit(this.vehicle);
    }
  }

  onVisitClick(): void {
    if (this.navigation) {
      this.visitClick.emit(this.visit);
    }
  }

  getVehicleName(vehicle: Vehicle): string {
    return getEntityName(vehicle, 'Vehicle');
  }

  private formatDate(value: number): string {
    return formatDate(value, 'yyyy/MM/dd h:mmaa', this.locale, 'UTC').toLocaleLowerCase(
      this.locale
    );
  }

  getVehicleDropdownOptions(): Vehicle[] {
    return [this.vehicle, ...this.vehicles];
  }
}
