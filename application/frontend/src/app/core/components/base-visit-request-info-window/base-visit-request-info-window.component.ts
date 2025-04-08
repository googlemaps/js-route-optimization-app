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
import { UntypedFormBuilder, UntypedFormControl } from '@angular/forms';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySelect as MatSelect } from '@angular/material/legacy-select';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import {
  durationSeconds,
  formattedDurationSeconds,
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
  readonly vehicleCtrl: UntypedFormControl;
  readonly optionItemSize = 48;

  readonly formattedDurationSeconds = formattedDurationSeconds;
  readonly durationSeconds = durationSeconds;

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
    private fb: UntypedFormBuilder,
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
    return formatDate(value, 'yyyy/MM/dd h:mm aa', this.locale, 'UTC').toLocaleLowerCase(
      this.locale
    );
  }

  getVehicleDropdownOptions(): Vehicle[] {
    return [this.vehicle, ...this.vehicles];
  }
}
