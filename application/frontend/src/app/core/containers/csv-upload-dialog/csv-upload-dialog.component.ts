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

import { DomPortal } from '@angular/cdk/portal';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormControl,
  UntypedFormBuilder,
  FormGroupDirective,
  NgForm,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { MatStepper } from '@angular/material/stepper';
import { Store } from '@ngrx/store';
import { concat, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, toArray } from 'rxjs/operators';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { Timezone } from 'src/app/shared/models';
import {
  aRequiredIfB,
  fromDispatcherWaypointLatLng,
  getEntityName,
  requireAny,
} from 'src/app/util';
import {
  EXPERIMENTAL_API_FIELDS_VEHICLES,
  GeocodeErrorResponse,
  ShipmentFields,
  VehicleFields,
} from '../../models';
import { selectAllowExperimentalFeatures, selectTimezone } from '../../selectors/config.selectors';
import { CsvVehicleLayer, FormMapService, MessageService } from '../../services';
import { CsvVisitRequestLayer } from '../../services/csv-visit-request-layer.service';
import { CsvService } from '../../services/csv.service';

class ShipmentPickupLocationErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.missingPickupLocation ||
      ngForm?.errors?.pickupOrDeliveryRequired ||
      control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentDeliveryLocationErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.missingDeliveryLocation ||
      ngForm?.errors?.pickupOrDeliveryRequired ||
      control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentPickupSoftStartTimeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.pickupSoftStartTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentPickupSoftEndTimeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.pickupSoftEndTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentDeliverySoftStartTimeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.deliverySoftStartTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentDeliverySoftEndTimeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.deliverySoftEndTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand1TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand1Type || control?.invalid || ngForm?.errors?.loadDemand1Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand2TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand2Type || control?.invalid || ngForm?.errors?.loadDemand2Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand3TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand3Type || control?.invalid || ngForm?.errors?.loadDemand3Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand4TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand4Type || control?.invalid || ngForm?.errors?.loadDemand4Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand1ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand1Value || control?.invalid || ngForm?.errors?.loadDemand1Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand2ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand2Value || control?.invalid || ngForm?.errors?.loadDemand2Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand3ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand3Value || control?.invalid || ngForm?.errors?.loadDemand3Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class ShipmentLoadDemand4ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadDemand4Value || control?.invalid || ngForm?.errors?.loadDemand4Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit1TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit1Type || control?.invalid || ngForm?.errors?.loadLimit1Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit2TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit2Type || control?.invalid || ngForm?.errors?.loadLimit2Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit3TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit3Type || control?.invalid || ngForm?.errors?.loadLimit3Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit4TypeErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit4Type || control?.invalid || ngForm?.errors?.loadLimit4Value;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit1ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit1Value || control?.invalid || ngForm?.errors?.loadLimit1Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit2ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit2Value || control?.invalid || ngForm?.errors?.loadLimit2Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit3ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit3Value || control?.invalid || ngForm?.errors?.loadLimit3Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleLoadLimit4ValueErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid =
      ngForm?.errors?.loadLimit4Value || control?.invalid || ngForm?.errors?.loadLimit4Type;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleStartTimeWindowSoftStartErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.startWindowSoftStartTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleStartTimeWindowSoftEndErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.startWindowSoftEndTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleEndTimeWindowSoftStartErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.endWindowSoftStartTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

class VehicleEndTimeWindowSoftEndErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(
    control: UntypedFormControl | null,
    ngForm: FormGroupDirective | NgForm | null
  ): boolean {
    const invalid = ngForm?.errors?.endWindowSoftEndTimeIfCost || control?.invalid;
    const show = ngForm;
    return !!(invalid && show);
  }
}

@Component({
  selector: 'app-csv-upload-dialog',
  templateUrl: './csv-upload-dialog.component.html',
  styleUrls: ['./csv-upload-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CsvVehicleLayer, CsvVisitRequestLayer],
})
export class CsvUploadDialogComponent implements OnDestroy, OnInit {
  @ViewChild('shipmentFileInput', { static: true }) shipmentFileInput: ElementRef<HTMLInputElement>;
  @ViewChild('vehicleFileInput', { static: true }) vehicleFileInput: ElementRef<HTMLInputElement>;
  @ViewChild('stepper') stepper: MatStepper;

  get shipmentFilename(): UntypedFormControl {
    return this.uploadForm.get('shipmentFilename') as UntypedFormControl;
  }
  get vehicleFilename(): UntypedFormControl {
    return this.uploadForm.get('vehicleFilename') as UntypedFormControl;
  }

  readonly previewRows = 5;
  readonly uploadForm: UntypedFormGroup;

  readonly shipmentPickupLocationErrorStateMatcher = new ShipmentPickupLocationErrorStateMatcher();
  readonly shipmentDeliveryLocationErrorStateMatcher =
    new ShipmentDeliveryLocationErrorStateMatcher();
  readonly shipmentPickupSoftStartTimeErrorStateMatcher =
    new ShipmentPickupSoftStartTimeErrorStateMatcher();
  readonly shipmentPickupSoftEndTimeErrorStateMatcher =
    new ShipmentPickupSoftEndTimeErrorStateMatcher();
  readonly shipmentDeliverySoftStartTimeErrorStateMatcher =
    new ShipmentDeliverySoftStartTimeErrorStateMatcher();
  readonly shipmentDeliverySoftEndTimeErrorStateMatcher =
    new ShipmentDeliverySoftEndTimeErrorStateMatcher();
  readonly shipmentLoadDemand1TypeErrorStateMatcher =
    new ShipmentLoadDemand1TypeErrorStateMatcher();
  readonly shipmentLoadDemand2TypeErrorStateMatcher =
    new ShipmentLoadDemand2TypeErrorStateMatcher();
  readonly shipmentLoadDemand3TypeErrorStateMatcher =
    new ShipmentLoadDemand3TypeErrorStateMatcher();
  readonly shipmentLoadDemand4TypeErrorStateMatcher =
    new ShipmentLoadDemand4TypeErrorStateMatcher();
  readonly shipmentLoadDemand1ValueErrorStateMatcher =
    new ShipmentLoadDemand1ValueErrorStateMatcher();
  readonly shipmentLoadDemand2ValueErrorStateMatcher =
    new ShipmentLoadDemand2ValueErrorStateMatcher();
  readonly shipmentLoadDemand3ValueErrorStateMatcher =
    new ShipmentLoadDemand3ValueErrorStateMatcher();
  readonly shipmentLoadDemand4ValueErrorStateMatcher =
    new ShipmentLoadDemand4ValueErrorStateMatcher();

  readonly vehicleStartTimeWindowSoftStartErrorStateMatcher =
    new VehicleStartTimeWindowSoftStartErrorStateMatcher();
  readonly vehicleStartTimeWindowSoftEndErrorStateMatcher =
    new VehicleStartTimeWindowSoftEndErrorStateMatcher();
  readonly vehicleEndTimeWindowSoftStartErrorStateMatcher =
    new VehicleEndTimeWindowSoftStartErrorStateMatcher();
  readonly vehicleEndTimeWindowSoftEndErrorStateMatcher =
    new VehicleEndTimeWindowSoftEndErrorStateMatcher();
  readonly vehicleLoadLimit1TypeErrorStateMatcher = new VehicleLoadLimit1TypeErrorStateMatcher();
  readonly vehicleLoadLimit2TypeErrorStateMatcher = new VehicleLoadLimit2TypeErrorStateMatcher();
  readonly vehicleLoadLimit3TypeErrorStateMatcher = new VehicleLoadLimit3TypeErrorStateMatcher();
  readonly vehicleLoadLimit4TypeErrorStateMatcher = new VehicleLoadLimit4TypeErrorStateMatcher();
  readonly vehicleLoadLimit1ValueErrorStateMatcher = new VehicleLoadLimit1ValueErrorStateMatcher();
  readonly vehicleLoadLimit2ValueErrorStateMatcher = new VehicleLoadLimit2ValueErrorStateMatcher();
  readonly vehicleLoadLimit3ValueErrorStateMatcher = new VehicleLoadLimit3ValueErrorStateMatcher();
  readonly vehicleLoadLimit4ValueErrorStateMatcher = new VehicleLoadLimit4ValueErrorStateMatcher();

  shipmentFieldKeys: string[] = [];
  vehicleFieldKeys: string[] = [];

  allowExperimentalFeatures: boolean;
  autoMappingUsed: boolean;
  shipmentColumnMappings = {};
  shipmentChipList = [];
  vehicleColumnMappings = {};
  vehicleChipList = [];
  errorLoadingShipmentCsv: boolean;
  errorLoadingVehicleCsv: boolean;
  errorValidating: boolean;
  geocodingErrorsShipments: GeocodeErrorResponse[] = [];
  geocodingErrorsVehicles: GeocodeErrorResponse[] = [];
  shipmentFile: File;
  vehicleFile: File;
  geocodingResults: any[] = [];
  isGeocoding: boolean;
  isLoadingCsv: boolean;
  isValidatingWithApi: boolean;
  mappingFormShipments: UntypedFormGroup;
  mappingFormVehicles: UntypedFormGroup;
  shipmentPreviewCsvColumns: string[] = [];
  vehiclePreviewCsvColumns: string[] = [];
  shipmentPreviewData: any = [];
  vehiclePreviewData: any = [];
  scenario: any = {};
  timezone: Timezone;
  validationErrors: string[] = [];

  get mapPortal(): DomPortal<any> {
    return this.formMapService.domPortal;
  }

  constructor(
    private changeRef: ChangeDetectorRef,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CsvUploadDialogComponent>,
    private fb: UntypedFormBuilder,
    private formMapService: FormMapService,
    private messageService: MessageService,
    private store: Store,
    private service: CsvService,
    private vehicleLayer: CsvVehicleLayer,
    private visitRequestLayer: CsvVisitRequestLayer
  ) {
    this.uploadForm = fb.group(
      {
        shipmentFilename: fb.control(''),
        vehicleFilename: fb.control(''),
      },
      {
        validators: [requireAny(['shipmentFilename', 'vehicleFilename'])],
      }
    );
    this.initMappingForms();
  }

  ngOnInit(): void {
    this.store.select(selectTimezone).subscribe((tz) => (this.timezone = tz));
    this.store.select(selectAllowExperimentalFeatures).subscribe((allow) => {
      this.allowExperimentalFeatures = allow;
      this.loadFieldMappings();
    });
  }

  ngOnDestroy(): void {
    this.vehicleLayer.reset();
    this.visitRequestLayer.reset();
  }

  loadFieldMappings(): void {
    this.shipmentFieldKeys = Object.values(ShipmentFields).filter(
      (value) => typeof value === 'string'
    ) as string[];

    const experimentalFieldsLower = EXPERIMENTAL_API_FIELDS_VEHICLES.map((field) =>
      field.toLowerCase()
    );
    this.vehicleFieldKeys = Object.values(VehicleFields).filter(
      (value) =>
        typeof value === 'string' &&
        (this.allowExperimentalFeatures || experimentalFieldsLower.indexOf(value.toLowerCase()) < 0)
    ) as string[];
  }

  initMappingForms(): void {
    this.mappingFormVehicles = this.fb.group(
      {
        Label: this.fb.control(''),
        TravelMode: this.fb.control(''),
        StartWaypoint: this.fb.control(''),
        EndWaypoint: this.fb.control(''),
        UnloadingPolicy: this.fb.control(''),
        CostPerHour: this.fb.control(''),
        CostPerTraveledHour: this.fb.control(''),
        CostPerKilometer: this.fb.control(''),
        FixedCost: this.fb.control(''),
        UsedIfRouteIsEmpty: this.fb.control(''),
        TravelDurationMultiple: this.fb.control(''),
        StartTimeWindowStartTime: this.fb.control(''),
        StartTimeWindowSoftStartTime: this.fb.control(''),
        StartTimeWindowEndTime: this.fb.control(''),
        StartTimeWindowSoftEndTime: this.fb.control(''),
        StartTimeWindowCostPerHourBeforeSoftStartTime: this.fb.control(''),
        StartTimeWindowCostPerHourAfterSoftEndTime: this.fb.control(''),
        EndTimeWindowStartTime: this.fb.control(''),
        EndTimeWindowSoftStartTime: this.fb.control(''),
        EndTimeWindowEndTime: this.fb.control(''),
        EndTimeWindowSoftEndTime: this.fb.control(''),
        EndTimeWindowCostPerHourBeforeSoftStartTime: this.fb.control(''),
        EndTimeWindowCostPerHourAfterSoftEndTime: this.fb.control(''),
        LoadLimit1Type: this.fb.control(''),
        LoadLimit1Value: this.fb.control(''),
        LoadLimit2Type: this.fb.control(''),
        LoadLimit2Value: this.fb.control(''),
        LoadLimit3Type: this.fb.control(''),
        LoadLimit3Value: this.fb.control(''),
        LoadLimit4Type: this.fb.control(''),
        LoadLimit4Value: this.fb.control(''),
      },
      {
        validators: [
          aRequiredIfB(
            'StartTimeWindowCostPerHourBeforeSoftStartTime',
            'StartTimeWindowSoftStartTime',
            'startWindowSoftStartTimeIfCost'
          ),
          aRequiredIfB(
            'StartTimeWindowCostPerHourAfterSoftEndTime',
            'StartTimeWindowSoftEndTime',
            'startWindowSoftEndTimeIfCost'
          ),
          aRequiredIfB(
            'EndTimeWindowCostPerHourBeforeSoftStartTime',
            'EndTimeWindowSoftStartTime',
            'endWindowSoftStartTimeIfCost'
          ),
          aRequiredIfB(
            'EndTimeWindowCostPerHourAfterSoftEndTime',
            'EndTimeWindowSoftEndTime',
            'endWindowSoftEndTimeIfCost'
          ),

          aRequiredIfB('LoadLimit1Type', 'LoadLimit1Value', 'loadLimit1Type'),
          aRequiredIfB('LoadLimit2Type', 'LoadLimit2Value', 'loadLimit2Type'),
          aRequiredIfB('LoadLimit3Type', 'LoadLimit3Value', 'loadLimit3Type'),
          aRequiredIfB('LoadLimit4Type', 'LoadLimit4Value', 'loadLimit4Type'),
          aRequiredIfB('LoadLimit1Value', 'LoadLimit1Type', 'loadLimit1Value'),
          aRequiredIfB('LoadLimit2Value', 'LoadLimit2Type', 'loadLimit2Value'),
          aRequiredIfB('LoadLimit3Value', 'LoadLimit3Type', 'loadLimit3Value'),
          aRequiredIfB('LoadLimit4Value', 'LoadLimit4Type', 'loadLimit4Value'),
        ],
      }
    );

    this.mappingFormShipments = this.fb.group(
      {
        Label: this.fb.control(''),
        PenaltyCost: this.fb.control(''),
        PickupArrivalWaypoint: this.fb.control(''),
        PickupDuration: this.fb.control(''),
        PickupCost: this.fb.control(''),
        PickupStartTime: this.fb.control(''),
        PickupSoftStartTime: this.fb.control(''),
        PickupEndTime: this.fb.control(''),
        PickupSoftEndTime: this.fb.control(''),
        PickupCostPerHourBeforeSoftStartTime: this.fb.control(''),
        PickupCostPerHourAfterSoftEndTime: this.fb.control(''),
        DeliveryArrivalWaypoint: this.fb.control(''),
        DeliveryDuration: this.fb.control(''),
        DeliveryCost: this.fb.control(''),
        DeliveryStartTime: this.fb.control(''),
        DeliverySoftStartTime: this.fb.control(''),
        DeliveryEndTime: this.fb.control(''),
        DeliverySoftEndTime: this.fb.control(''),
        DeliveryCostPerHourBeforeSoftStartTime: this.fb.control(''),
        DeliveryCostPerHourAfterSoftEndTime: this.fb.control(''),
        LoadDemand1Type: this.fb.control(''),
        LoadDemand1Value: this.fb.control(''),
        LoadDemand2Type: this.fb.control(''),
        LoadDemand2Value: this.fb.control(''),
        LoadDemand3Type: this.fb.control(''),
        LoadDemand3Value: this.fb.control(''),
        LoadDemand4Type: this.fb.control(''),
        LoadDemand4Value: this.fb.control(''),
        AllowedVehicleIndices: this.fb.control(''),
      },
      {
        validators: [
          requireAny(['PickupArrivalWaypoint', 'DeliveryArrivalWaypoint']),
          aRequiredIfB('PickupArrivalWaypoint', 'PickupDuration', 'missingPickupLocation'),
          aRequiredIfB('PickupArrivalWaypoint', 'PickupCost', 'missingPickupLocation'),
          aRequiredIfB('PickupArrivalWaypoint', 'PickupStartTime', 'missingPickupLocation'),
          aRequiredIfB('PickupArrivalWaypoint', 'PickupSoftStartTime', 'missingPickupLocation'),
          aRequiredIfB('PickupArrivalWaypoint', 'PickupEndTime', 'missingPickupLocation'),
          aRequiredIfB('PickupArrivalWaypoint', 'PickupSoftEndTime', 'missingPickupLocation'),
          aRequiredIfB(
            'PickupArrivalWaypoint',
            'PickupCostPerHourBeforeSoftStartTime',
            'missingPickupLocation'
          ),
          aRequiredIfB(
            'PickupArrivalWaypoint',
            'PickupCostPerHourAfterSoftEndTime',
            'missingPickupLocation'
          ),
          aRequiredIfB(
            'PickupCostPerHourBeforeSoftStartTime',
            'PickupSoftStartTime',
            'pickupSoftStartTimeIfCost'
          ),
          aRequiredIfB(
            'PickupCostPerHourAfterSoftEndTime',
            'PickupSoftEndTime',
            'pickupSoftEndTimeIfCost'
          ),

          aRequiredIfB('DeliveryArrivalWaypoint', 'DeliveryDuration', 'missingDeliveryLocation'),
          aRequiredIfB('DeliveryArrivalWaypoint', 'DeliveryCost', 'missingDeliveryLocation'),
          aRequiredIfB('DeliveryArrivalWaypoint', 'DeliveryStartTime', 'missingDeliveryLocation'),
          aRequiredIfB(
            'DeliveryArrivalWaypoint',
            'DeliverySoftStartTime',
            'missingDeliveryLocation'
          ),
          aRequiredIfB('DeliveryArrivalWaypoint', 'DeliveryEndTime', 'missingDeliveryLocation'),
          aRequiredIfB('DeliveryArrivalWaypoint', 'DeliverySoftEndTime', 'missingDeliveryLocation'),
          aRequiredIfB(
            'DeliveryArrivalWaypoint',
            'DeliveryCostPerHourBeforeSoftStartTime',
            'missingDeliveryLocation'
          ),
          aRequiredIfB(
            'DeliveryArrivalWaypoint',
            'DeliveryCostPerHourAfterSoftEndTime',
            'missingDeliveryLocation'
          ),
          aRequiredIfB(
            'DeliveryCostPerHourBeforeSoftStartTime',
            'DeliverySoftStartTime',
            'deliverySoftStartTimeIfCost'
          ),
          aRequiredIfB(
            'DeliveryCostPerHourAfterSoftEndTime',
            'DeliverySoftEndTime',
            'deliverySoftEndTimeIfCost'
          ),

          aRequiredIfB('LoadDemand1Type', 'LoadDemand1Value', 'loadDemand1Type'),
          aRequiredIfB('LoadDemand2Type', 'LoadDemand2Value', 'loadDemand2Type'),
          aRequiredIfB('LoadDemand3Type', 'LoadDemand3Value', 'loadDemand3Type'),
          aRequiredIfB('LoadDemand4Type', 'LoadDemand4Value', 'loadDemand4Type'),
          aRequiredIfB('LoadDemand1Value', 'LoadDemand1Type', 'loadDemand1Value'),
          aRequiredIfB('LoadDemand2Value', 'LoadDemand2Type', 'loadDemand2Value'),
          aRequiredIfB('LoadDemand3Value', 'LoadDemand3Type', 'loadDemand3Value'),
          aRequiredIfB('LoadDemand4Value', 'LoadDemand4Type', 'loadDemand4Value'),
        ],
      }
    );
  }

  //
  // Mapping error states
  getErrorStateMatcher(field: string): ErrorStateMatcher {
    switch (field) {
      case 'PickupArrivalWaypoint':
        return this.shipmentPickupLocationErrorStateMatcher;
      case 'DeliveryArrivalWaypoint':
        return this.shipmentDeliveryLocationErrorStateMatcher;
      case 'PickupCostPerHourBeforeSoftStartTime':
        return this.shipmentPickupSoftStartTimeErrorStateMatcher;
      case 'PickupCostPerHourAfterSoftEndTime':
        return this.shipmentPickupSoftEndTimeErrorStateMatcher;
      case 'DeliveryCostPerHourBeforeSoftStartTime':
        return this.shipmentDeliverySoftStartTimeErrorStateMatcher;
      case 'DeliveryCostPerHourAfterSoftEndTime':
        return this.shipmentDeliverySoftEndTimeErrorStateMatcher;
      case 'LoadDemand1Type':
        return this.shipmentLoadDemand1TypeErrorStateMatcher;
      case 'LoadDemand1Value':
        return this.shipmentLoadDemand1ValueErrorStateMatcher;
      case 'LoadDemand2Type':
        return this.shipmentLoadDemand2TypeErrorStateMatcher;
      case 'LoadDemand2Value':
        return this.shipmentLoadDemand2ValueErrorStateMatcher;
      case 'LoadDemand3Type':
        return this.shipmentLoadDemand3TypeErrorStateMatcher;
      case 'LoadDemand3Value':
        return this.shipmentLoadDemand3ValueErrorStateMatcher;
      case 'LoadDemand4Type':
        return this.shipmentLoadDemand4TypeErrorStateMatcher;
      case 'LoadDemand4Value':
        return this.shipmentLoadDemand4ValueErrorStateMatcher;
      case 'LoadLimit1Type':
        return this.vehicleLoadLimit1TypeErrorStateMatcher;
      case 'LoadLimit1Value':
        return this.vehicleLoadLimit1ValueErrorStateMatcher;
      case 'LoadLimit2Type':
        return this.vehicleLoadLimit2TypeErrorStateMatcher;
      case 'LoadLimit2Value':
        return this.vehicleLoadLimit2ValueErrorStateMatcher;
      case 'LoadLimit3Type':
        return this.vehicleLoadLimit3TypeErrorStateMatcher;
      case 'LoadLimit3Value':
        return this.vehicleLoadLimit3ValueErrorStateMatcher;
      case 'LoadLimit4Type':
        return this.vehicleLoadLimit4TypeErrorStateMatcher;
      case 'LoadLimit4Value':
        return this.vehicleLoadLimit4ValueErrorStateMatcher;
      case 'StartTimeWindowCostPerHourBeforeSoftStartTime':
        return this.vehicleStartTimeWindowSoftStartErrorStateMatcher;
      case 'StartTimeWindowCostPerHourAfterSoftEndTime':
        return this.vehicleStartTimeWindowSoftEndErrorStateMatcher;
      case 'EndTimeWindowCostPerHourBeforeSoftStartTime':
        return this.vehicleEndTimeWindowSoftStartErrorStateMatcher;
      case 'EndTimeWindowCostPerHourAfterSoftEndTime':
        return this.vehicleEndTimeWindowSoftEndErrorStateMatcher;
    }
  }

  hasError(field: string): boolean {
    switch (field) {
      case 'PickupArrivalWaypoint':
        return (
          this.mappingFormShipments.errors?.missingPickupLocation ||
          this.mappingFormShipments?.errors?.pickupOrDeliveryRequired
        );
      case 'DeliveryArrivalWaypoint':
        return (
          this.mappingFormShipments.errors?.missingDeliveryLocation ||
          this.mappingFormShipments?.errors?.pickupOrDeliveryRequired
        );
      case 'PickupCostPerHourBeforeSoftStartTime':
        return this.mappingFormShipments.errors?.pickupSoftStartTimeIfCost;
      case 'PickupCostPerHourAfterSoftEndTime':
        return this.mappingFormShipments.errors?.pickupSoftEndTimeIfCost;
      case 'DeliveryCostPerHourBeforeSoftStartTime':
        return this.mappingFormShipments.errors?.deliverySoftStartTimeIfCost;
      case 'DeliveryCostPerHourAfterSoftEndTime':
        return this.mappingFormShipments.errors?.deliverySoftEndTimeIfCost;
      case 'LoadDemand1Type':
        return this.mappingFormShipments.errors?.loadDemand1Type;
      case 'LoadDemand1Value':
        return this.mappingFormShipments.errors?.loadDemand1Value;
      case 'LoadDemand2Type':
        return this.mappingFormShipments.errors?.loadDemand2Type;
      case 'LoadDemand2Value':
        return this.mappingFormShipments.errors?.loadDemand2Value;
      case 'LoadDemand3Type':
        return this.mappingFormShipments.errors?.loadDemand3Type;
      case 'LoadDemand3Value':
        return this.mappingFormShipments.errors?.loadDemand3Value;
      case 'LoadDemand4Type':
        return this.mappingFormShipments.errors?.loadDemand4Type;
      case 'LoadDemand4Value':
        return this.mappingFormShipments.errors?.loadDemand4Value;
      case 'LoadLimit1Type':
        return this.mappingFormVehicles.errors?.loadLimit1Type;
      case 'LoadLimit1Value':
        return this.mappingFormVehicles.errors?.loadLimit1Value;
      case 'LoadLimit2Type':
        return this.mappingFormVehicles.errors?.loadLimit2Type;
      case 'LoadLimit2Value':
        return this.mappingFormVehicles.errors?.loadLimit2Value;
      case 'LoadLimit3Type':
        return this.mappingFormVehicles.errors?.loadLimit3Type;
      case 'LoadLimit3Value':
        return this.mappingFormVehicles.errors?.loadLimit3Value;
      case 'LoadLimit4Type':
        return this.mappingFormVehicles.errors?.loadLimit4Type;
      case 'LoadLimit4Value':
        return this.mappingFormVehicles.errors?.loadLimit4Value;
      case 'StartTimeWindowCostPerHourBeforeSoftStartTime':
        return this.mappingFormVehicles.errors?.startWindowSoftStartTimeIfCost;
      case 'StartTimeWindowCostPerHourAfterSoftEndTime':
        return this.mappingFormVehicles.errors?.startWindowSoftEndTimeIfCost;
      case 'EndTimeWindowCostPerHourBeforeSoftStartTime':
        return this.mappingFormVehicles.errors?.endWindowSoftStartTimeIfCost;
      case 'EndTimeWindowCostPerHourAfterSoftEndTime':
        return this.mappingFormVehicles.errors?.endWindowSoftEndTimeIfCost;
    }
  }

  getErrorMessage(field: string): string {
    switch (field) {
      case 'PickupArrivalWaypoint':
        if (this.mappingFormShipments?.errors?.pickupOrDeliveryRequired) {
          return 'Pickup or delivery location required';
        }
        return 'Location required if other pickup parameters are defined';
      case 'DeliveryArrivalWaypoint':
        if (this.mappingFormShipments?.errors?.pickupOrDeliveryRequired) {
          return 'Pickup or delivery location required';
        }
        return 'Location required if other delivery parameters are defined';
      case 'PickupCostPerHourBeforeSoftStartTime':
      case 'DeliveryCostPerHourBeforeSoftStartTime':
      case 'StartTimeWindowCostPerHourBeforeSoftStartTime':
      case 'EndTimeWindowCostPerHourBeforeSoftStartTime':
        return 'Required if soft start is defined';
      case 'PickupCostPerHourAfterSoftEndTime':
      case 'DeliveryCostPerHourAfterSoftEndTime':
      case 'StartTimeWindowCostPerHourAfterSoftEndTime':
      case 'EndTimeWindowCostPerHourAfterSoftEndTime':
        return 'Required if soft end is defined';
      case 'LoadDemand1Type':
      case 'LoadDemand2Type':
      case 'LoadDemand3Type':
      case 'LoadDemand4Type':
        return 'Required if load demand value defined';
      case 'LoadDemand1Value':
      case 'LoadDemand2Value':
      case 'LoadDemand3Value':
      case 'LoadDemand4Value':
        return 'Required if load demand type defined';
      case 'LoadLimit1Type':
      case 'LoadLimit2Type':
      case 'LoadLimit3Type':
      case 'LoadLimit4Type':
        return 'Required if capacity value defined';
      case 'LoadLimit1Value':
      case 'LoadLimit2Value':
      case 'LoadLimit3Value':
      case 'LoadLimit4Value':
        return 'Required if capacity type defined';
    }
  }

  // Map logic
  updateMapBounds(): void {
    const bounds = this.calculateBounds();
    this.formMapService.updateBounds(bounds, () => {
      if (!bounds || bounds.isEmpty()) {
        this.formMapService.zoomToHome();
      }
    });
  }

  calculateBounds(): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();
    this.scenario.model.vehicles.forEach((vehicle) => {
      if (vehicle.startWaypoint && !vehicle.startWaypoint.error) {
        bounds.extend(fromDispatcherWaypointLatLng(vehicle.startWaypoint));
      }
      if (vehicle.endWaypoint && !vehicle.endWaypoint.error) {
        bounds.extend(fromDispatcherWaypointLatLng(vehicle.endWaypoint));
      }
    });
    this.scenario.model.shipments.forEach((shipment) => {
      if (
        shipment.pickups &&
        shipment.pickups[0].arrivalWaypoint &&
        !shipment.pickups[0].arrivalWaypoint.error
      ) {
        bounds.extend(fromDispatcherWaypointLatLng(shipment.pickups[0].arrivalWaypoint));
      }
      if (
        shipment.deliveries &&
        shipment.deliveries[0].arrivalWaypoint &&
        !shipment.deliveries[0].arrivalWaypoint.error
      ) {
        bounds.extend(fromDispatcherWaypointLatLng(shipment.deliveries[0].arrivalWaypoint));
      }
    });
    return bounds;
  }

  //
  // Dialog controls
  cancel(): void {
    this.dialogRef.close();
  }

  back(): void {
    this.stepper.previous();
  }

  next(): void {
    if (this.stepper.selectedIndex === 3) {
      this.uploadScenario();
      return;
    }
    this.stepper.next();
  }

  nextButtonText(): string {
    return this.stepper.selectedIndex === 3 ? 'Finish' : 'Next';
  }

  uploadScenario(): void {
    this.dialogRef.close({ scenario: this.scenario, timezone: this.timezone });
  }

  formatFieldName(name: string): string {
    // Split field name into words at capital letter locations but only capitalize the first word
    const split = name
      .split(/(?=[A-Z0-9])/)
      .map((word) => word && word[0].toLowerCase() + word.slice(1))
      .join(' ');
    return split[0].toUpperCase() + split.slice(1);
  }

  nextButtonDisabled(): boolean {
    switch (this.stepper.selectedIndex) {
      case 0:
        return this.uploadForm.invalid;
      case 1:
        return (
          (this.shipmentFile &&
            (this.errorLoadingShipmentCsv || !this.shipmentPreviewData.length)) ||
          (this.vehicleFile && this.errorLoadingVehicleCsv && !this.vehiclePreviewData.length)
        );
      case 2:
        return (
          (this.shipmentFile && this.mappingFormShipments.invalid) ||
          (this.vehicleFile && this.mappingFormVehicles.invalid)
        );
      case 3:
        return (
          this.isValidatingWithApi ||
          this.errorValidating ||
          this.geocodingErrorsShipments?.length > 0 ||
          this.geocodingErrorsVehicles?.length > 0
        );
    }
  }

  displayBackButton(): boolean {
    return this.stepper && this.stepper.selectedIndex > 0;
  }

  displayNextButton(): MatStepper {
    return this.stepper;
  }

  onStepperSelectionChange(e: StepperSelectionEvent): void {
    if (e.previouslySelectedIndex === 0 && e.selectedIndex === 1) {
      this.loadCsvs();
    } else if (e.previouslySelectedIndex === 2 && e.selectedIndex === 3) {
      this.validateMapping();
    }
  }

  //
  // Data processing
  loadCsvs(): void {
    this.isLoadingCsv = true;
    this.errorLoadingShipmentCsv = false;
    this.errorLoadingVehicleCsv = false;
    this.shipmentPreviewData = [];
    this.vehiclePreviewData = [];
    this.shipmentPreviewCsvColumns = [];
    this.vehiclePreviewCsvColumns = [];

    const csvObservables = [];

    let shipmentIndex = -1;
    let vehicleIndex = -1;

    if (this.shipmentFile) {
      shipmentIndex = 0;
      csvObservables.push(
        this.service.getCsvPreview(this.shipmentFile, this.previewRows).pipe(
          catchError((error) => {
            this.errorLoadingShipmentCsv = true;
            return of(error);
          })
        )
      );
    }
    if (this.vehicleFile) {
      vehicleIndex = this.shipmentFile ? 1 : 0;
      csvObservables.push(
        this.service.getCsvPreview(this.vehicleFile, this.previewRows).pipe(
          catchError((error) => {
            this.errorLoadingShipmentCsv = true;
            return of(error);
          })
        )
      );
    }

    forkJoin(csvObservables).subscribe((res: any[]) => {
      this.isLoadingCsv = false;

      if (shipmentIndex >= 0) {
        this.shipmentPreviewData = res[shipmentIndex].data;
        if (this.errorLoadingShipmentCsv || !this.shipmentPreviewData.length) {
          return;
        }
        this.shipmentPreviewCsvColumns = Object.keys(this.shipmentPreviewData[0]);
      }
      if (vehicleIndex >= 0) {
        this.vehiclePreviewData = res[vehicleIndex].data;
        if (this.errorLoadingVehicleCsv || !this.vehiclePreviewData.length) {
          return;
        }
        this.vehiclePreviewCsvColumns = Object.keys(this.vehiclePreviewData[0]);
      }
      this.autoMapColumns();
    });
  }

  calculateGlobalTimeWindows(): void {
    let minTimeWindow = Infinity;
    let maxTimeWindow = -Infinity;

    this.scenario.model.shipments.forEach((shipment) => {
      if (shipment.pickups?.length && shipment.pickups[0].timeWindows?.length) {
        minTimeWindow = Math.min(
          minTimeWindow,
          shipment.pickups[0].timeWindows[0].startTime?.seconds || Infinity,
          shipment.pickups[0].timeWindows[0].softStartTime?.seconds || Infinity,
          shipment.pickups[0].timeWindows[0].endTime?.seconds || Infinity,
          shipment.pickups[0].timeWindows[0].softEndTime?.seconds || Infinity
        );

        maxTimeWindow = Math.max(
          maxTimeWindow,
          shipment.pickups[0].timeWindows[0].startTime?.seconds || -Infinity,
          shipment.pickups[0].timeWindows[0].softStartTime?.seconds || -Infinity,
          shipment.pickups[0].timeWindows[0].endTime?.seconds || -Infinity,
          shipment.pickups[0].timeWindows[0].softEndTime?.seconds || -Infinity
        );
      }

      if (shipment.deliveries?.length && shipment.deliveries[0].timeWindows?.length) {
        minTimeWindow = Math.min(
          minTimeWindow,
          shipment.deliveries[0].timeWindows[0].startTime?.seconds || Infinity,
          shipment.deliveries[0].timeWindows[0].softStartTime?.seconds || Infinity,
          shipment.deliveries[0].timeWindows[0].endTime?.seconds || Infinity,
          shipment.deliveries[0].timeWindows[0].softEndTime?.seconds || Infinity
        );

        maxTimeWindow = Math.max(
          maxTimeWindow,
          shipment.deliveries[0].timeWindows[0].startTime?.seconds || -Infinity,
          shipment.deliveries[0].timeWindows[0].softStartTime?.seconds || -Infinity,
          shipment.deliveries[0].timeWindows[0].endTime?.seconds || -Infinity,
          shipment.deliveries[0].timeWindows[0].softEndTime?.seconds || -Infinity
        );
      }
    });

    this.scenario.model.vehicles.forEach((vehicle) => {
      if (vehicle.startTimeWindows) {
        minTimeWindow = Math.min(
          minTimeWindow,
          vehicle.startTimeWindows[0].startTime?.seconds || Infinity,
          vehicle.startTimeWindows[0].softStartTime?.seconds || Infinity,
          vehicle.startTimeWindows[0].endTime?.seconds || Infinity,
          vehicle.startTimeWindows[0].softEndTime?.seconds || Infinity
        );

        maxTimeWindow = Math.max(
          maxTimeWindow,
          vehicle.startTimeWindows[0].startTime?.seconds || -Infinity,
          vehicle.startTimeWindows[0].softStartTime?.seconds || -Infinity,
          vehicle.startTimeWindows[0].endTime?.seconds || -Infinity,
          vehicle.startTimeWindows[0].softEndTime?.seconds || -Infinity
        );
      }
      if (vehicle.endTimeWindows) {
        minTimeWindow = Math.min(
          minTimeWindow,
          vehicle.endTimeWindows[0].startTime?.seconds || Infinity,
          vehicle.endTimeWindows[0].softStartTime?.seconds || Infinity,
          vehicle.endTimeWindows[0].endTime?.seconds || Infinity,
          vehicle.endTimeWindows[0].softEndTime?.seconds || Infinity
        );

        maxTimeWindow = Math.max(
          maxTimeWindow,
          vehicle.endTimeWindows[0].startTime?.seconds || -Infinity,
          vehicle.endTimeWindows[0].softStartTime?.seconds || -Infinity,
          vehicle.endTimeWindows[0].endTime?.seconds || -Infinity,
          vehicle.endTimeWindows[0].softEndTime?.seconds || -Infinity
        );
      }
    });

    // One hour window on either side of vehicle / shipment windows
    if (minTimeWindow < Infinity && maxTimeWindow > -Infinity) {
      this.scenario.model.globalStartTime = { seconds: minTimeWindow - 3600 };
      this.scenario.model.globalEndTime = { seconds: maxTimeWindow + 3600 };
    }
  }

  geocodingResultsToShipments(res: any): void {
    for (let i = 0; i < res.length; i += 2) {
      const shipment = this.scenario.model.shipments[i / 2];
      if (shipment.pickups && shipment.pickups[0].arrivalWaypoint && res[i]) {
        shipment.pickups[0].arrivalWaypoint = {
          location: {
            latLng: res[i],
          },
        };
      }
      if (shipment.deliveries && shipment.deliveries[0].arrivalWaypoint && res[i + 1]) {
        shipment.deliveries[0].arrivalWaypoint = {
          location: {
            latLng: res[i + 1],
          },
        };
      }
    }
  }

  geocodingResultsToVehicles(res: any): void {
    for (let i = 0; i < res.length; i += 2) {
      const start = res[i];
      const end = res[i + 1];
      if (start) {
        this.scenario.model.vehicles[i / 2].startWaypoint = {
          location: {
            latLng: res[i],
          },
        };
      }
      if (end) {
        this.scenario.model.vehicles[i / 2].endWaypoint = {
          location: {
            latLng: res[i + 1],
          },
        };
      }
    }
  }

  mapScenario(): void {
    const visitRequests = [];
    this.scenario.model.shipments.forEach((shipment) => {
      if (shipment.pickups) {
        visitRequests.push({ ...shipment.pickups[0], pickup: true });
      }
      if (shipment.deliveries) {
        visitRequests.push({ ...shipment.deliveries[0], pickup: false });
      }
    });
    this.visitRequestLayer.add(visitRequests);
    this.visitRequestLayer.visible = true;

    this.vehicleLayer.add(this.scenario.model.vehicles);
    this.vehicleLayer.visible = true;
  }

  //
  // Data mapping
  autoMapColumns(): void {
    this.autoMappingUsed = false;

    if (this.shipmentFile) {
      const shipmentAutoMappingFieldsLower = this.shipmentFieldKeys.map((key) => key.toLowerCase());
      this.shipmentPreviewCsvColumns.forEach((column) => {
        const autoIndex = shipmentAutoMappingFieldsLower.indexOf(column.toLowerCase());
        if (autoIndex >= 0) {
          this.autoMappingUsed = true;
          this.setMapping(this.shipmentFieldKeys[autoIndex], column, true, false);
        }
      });
    }

    if (this.vehicleFile) {
      const vehicleAutoMappingFieldsLower = this.vehicleFieldKeys.map((key) => key.toLowerCase());
      this.vehiclePreviewCsvColumns.forEach((column) => {
        const autoIndex = vehicleAutoMappingFieldsLower.indexOf(column.toLowerCase());
        if (autoIndex >= 0) {
          this.autoMappingUsed = true;
          this.setMapping(this.vehicleFieldKeys[autoIndex], column, false, true);
        }
      });
    }
  }

  validateMapping(): void {
    this.vehicleLayer.reset();
    this.visitRequestLayer.reset();
    this.validationErrors = [];
    this.errorValidating = false;
    this.geocodingErrorsShipments = [];
    this.geocodingErrorsVehicles = [];
    this.isValidatingWithApi = true;
    let shipments = [];
    let vehicles = [];

    const csvObservables = [
      this.shipmentFile ? this.service.loadCsv(this.shipmentFile) : of(null),
      this.vehicleFile ? this.service.loadCsv(this.vehicleFile) : of(null),
    ];

    forkJoin(csvObservables)
      .pipe(
        mergeMap((res: any[]) => {
          if (this.shipmentFile) {
            const shipmentsResults = this.service.csvToShipments(
              res[0].data,
              this.mappingFormShipments.value
            );
            if (shipmentsResults.some((result) => result.errors.length)) {
              shipmentsResults.forEach((result, index) => {
                this.validationErrors.push(
                  ...result.errors.map(
                    (error) =>
                      `Shipment ${result.shipment.label || ''} at index ${index}: ${error.message}`
                  )
                );
              });
              throw Error('Shipment validation error');
            }

            shipments = shipmentsResults.map((result) => result.shipment);
          }
          if (this.vehicleFile) {
            const vehiclesResults = this.service.csvToVehicles(
              res[1].data,
              this.mappingFormVehicles.value
            );

            if (vehiclesResults.some((result) => result.errors.length)) {
              vehiclesResults.forEach((result, index) => {
                this.validationErrors.push(
                  ...result.errors.map(
                    (error) =>
                      `Vehicle ${result.vehicle.label || ''} at index ${index}: ${error.message}`
                  )
                );
              });
              throw Error('Vehicle validation error');
            }

            vehicles = vehiclesResults.map((result) => result.vehicle);
          }

          // geocode all shipments, then all vehicles
          return concat(
            // shipments
            !shipments?.length
              ? of(null)
              : this.service.geocodeShipments(shipments).pipe(
                  map((res) => {
                    this.geocodingErrorsShipments = res.filter(
                      (result) => (result as GeocodeErrorResponse)?.error
                    ) as GeocodeErrorResponse[];
                    return res;
                  })
                ),

            // vehicles
            !vehicles?.length
              ? of(null)
              : this.service.geocodeVehicles(vehicles).pipe(
                  map((res) => {
                    this.geocodingErrorsVehicles = res.filter(
                      (result) => (result as GeocodeErrorResponse)?.error
                    ) as GeocodeErrorResponse[];
                    return res;
                  })
                )
          ).pipe(toArray());
        })
      )
      .subscribe(
        (geocodingResults) => this.createScenario(shipments, vehicles, geocodingResults),
        (err) => {
          this.isValidatingWithApi = false;
          this.errorValidating = true;

          // Throw default error if none have been provided
          if (!this.validationErrors) {
            this.validationErrors.push(err.error?.error?.message || err.message);
          }

          this.changeRef.detectChanges();
        }
      );
  }

  createScenario(shipments: any[], vehicles: any[], geocodingResults: any[]): void {
    this.isValidatingWithApi = false;
    this.scenario = {
      model: {
        shipments,
        vehicles,
      },
    };

    if (geocodingResults[0]) {
      this.geocodingResultsToShipments(geocodingResults[0]);
    }
    if (geocodingResults[1]) {
      this.geocodingResultsToVehicles(geocodingResults[1]);
    }

    this.calculateGlobalTimeWindows();
    this.mapScenario();
    this.updateMapBounds();
    this.changeRef.detectChanges();
  }

  setMapping(
    key: string,
    value: string,
    isShipmentMapping: boolean,
    isVehicleMapping: boolean
  ): void {
    if (isShipmentMapping) {
      this.shipmentColumnMappings[key] = value;
      this.shipmentChipList = this.getMappedFields(true);
      this.mappingFormShipments.get(key).setValue(value);
    } else if (isVehicleMapping) {
      this.vehicleColumnMappings[key] = value;
      this.vehicleChipList = this.getMappedFields(false);
      this.mappingFormVehicles.get(key).setValue(value);
    }
    this.changeRef.detectChanges();
  }

  isColumnMapped(key: string, forShipments: boolean): boolean {
    return forShipments
      ? !!Object.values(this.shipmentColumnMappings).includes(key)
      : !!Object.values(this.vehicleColumnMappings).includes(key);
  }

  getMappedFields(forShipments: boolean): { apiField: string; column: string }[] {
    return forShipments
      ? Object.keys(this.shipmentColumnMappings)
          .filter((key) => this.shipmentColumnMappings[key] != null)
          .map((key) => ({ apiField: key, column: this.shipmentColumnMappings[key] }))
      : Object.keys(this.vehicleColumnMappings)
          .filter((key) => this.vehicleColumnMappings[key] != null)
          .map((key) => ({ apiField: key, column: this.vehicleColumnMappings[key] }));
  }

  removeChip(
    mapping: { apiField: string; column: string },
    fromShipments: boolean,
    fromVehicles: boolean
  ): void {
    this.setMapping(mapping.apiField, null, fromShipments, fromVehicles);
  }

  //
  // File upload step
  onTimezoneSelected(tz: Timezone): void {
    this.timezone = tz;
  }

  resetData(): void {
    // Cache first page results since they will be erased by stepper.reset()
    const shipmentFileUpload = this.shipmentFilename.value;
    const vehicleFileUpload = this.vehicleFilename.value;
    this.mappingFormShipments.reset();
    this.mappingFormVehicles.reset();
    this.shipmentChipList = [];
    this.vehicleChipList = [];
    this.shipmentColumnMappings = {};
    this.vehicleColumnMappings = {};
    this.vehicleLayer.reset();
    this.visitRequestLayer.reset();
    this.stepper.reset();

    this.shipmentFilename.setValue(shipmentFileUpload);
    this.vehicleFilename.setValue(vehicleFileUpload);
  }

  uploadFilesChanged(): void {
    this.resetData();
  }

  selectShipmentFile(): void {
    if (!this.shipmentFileInput) {
      return;
    }

    this.shipmentFileInput.nativeElement.click();
    this.shipmentFilename.markAsTouched();
  }

  selectVehicleFile(): void {
    if (!this.vehicleFileInput) {
      return;
    }

    this.vehicleFileInput.nativeElement.click();
    this.vehicleFilename.markAsTouched();
  }

  fileSelected(e: Event, asShipment: boolean, asVehicle: boolean): void {
    const target = e.target as HTMLInputElement;
    const selectedFile = target && target.files && target.files[0];
    if (asShipment && selectedFile) {
      this.shipmentFile = selectedFile;
      this.shipmentFilename.setValue(selectedFile.name);
    } else if (asVehicle && selectedFile) {
      this.vehicleFile = selectedFile;
      this.vehicleFilename.setValue(selectedFile.name);
    }
  }

  downloadShipmentsSample(): void {
    this.service.downloadShipmentsSample();
  }

  downloadVehiclesSample(): void {
    this.service.downloadVehiclesSample();
  }

  retryGeocode(result: GeocodeErrorResponse, newLocation: string): void {
    let geocodingErrorsArray: GeocodeErrorResponse[];
    if (result.shipment) {
      geocodingErrorsArray = this.geocodingErrorsShipments;
    } else if (result.vehicle) {
      geocodingErrorsArray = this.geocodingErrorsVehicles;
    } else {
      throw 'GeocodeErrorResponse is missing shipment or vehicle property';
    }

    const resultIndex = geocodingErrorsArray.indexOf(result);
    result.message = null;

    this.uploadForm.disable();

    this.service.geocodeLocation(newLocation).subscribe((retryResponse) => {
      this.uploadForm.enable();

      // success
      if (!(retryResponse as GeocodeErrorResponse)?.error) {
        const name = getEntityName(
          result.shipment || result.vehicle,
          result.shipment ? 'Shipment' : 'Vehicle'
        );
        this.messageService.info(`${result.field || 'Address'} for ${name} successfully geocoded`, {
          duration: 3000,
        });

        geocodingErrorsArray.splice(resultIndex, 1);

        result.source[result.field] = {
          location: {
            latLng: retryResponse,
          },
        };
        this.mapScenario();
        this.updateMapBounds();
      } else {
        // error
        geocodingErrorsArray.splice(resultIndex, 1, {
          ...result,
          ...(retryResponse as GeocodeErrorResponse),
        });
      }

      // update validation status
      this.validationErrors = (this.geocodingErrorsShipments || [])
        .concat(this.geocodingErrorsVehicles || [])
        .map((e) => e.message);

      this.changeRef.detectChanges();
    });
  }

  removeShipmentRow(index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog',
      data: {
        title: 'Confirm Remove Shipment',
        message: `Remove ${getEntityName(
          this.scenario.model.shipments[index],
          'Shipment'
        )} from scenario?`,
      },
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.scenario.model.shipments.splice(index, 1);
        this.geocodingErrorsShipments = this.geocodingErrorsShipments.filter(
          (e) => e.index !== index
        );
        this.geocodingErrorsShipments.forEach(
          (e) => (e.index = this.scenario.model.shipments.indexOf(e.shipment))
        );

        this.changeRef.detectChanges();

        this.mapScenario();
        this.updateMapBounds();
      }
    });
  }

  removeVehicleRow(index: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      panelClass: 'app-dialog',
      data: {
        title: 'Confirm Remove Vehicle',
        message: `Remove ${getEntityName(
          this.scenario.model.vehicles[index],
          'Vehicle'
        )} from scenario?`,
      },
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.scenario.model.vehicles.splice(index, 1);
        this.geocodingErrorsVehicles = this.geocodingErrorsVehicles.filter(
          (e) => e.index !== index
        );
        this.geocodingErrorsVehicles.forEach(
          (e) => (e.index = this.scenario.model.vehicles.indexOf(e.vehicle))
        );

        this.changeRef.detectChanges();

        this.mapScenario();
        this.updateMapBounds();
      }
    });
  }
}
