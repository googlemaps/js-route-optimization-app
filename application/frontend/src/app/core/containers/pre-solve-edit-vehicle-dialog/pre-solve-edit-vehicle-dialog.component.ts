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

import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import {
  MatLegacyDialog as MatDialog,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { upsertVehicles } from '../../actions/vehicle.actions';
import { IConstraintRelaxation, Vehicle } from '../../models';
import { selectTimezoneOffset } from '../../selectors/config.selectors';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromMap from '../../selectors/map.selectors';
import * as fromScenario from '../../selectors/scenario.selectors';
import * as fromVehicles from '../../selectors/vehicle.selectors';
import { MapService, MessageService, VehicleLayer } from '../../services';
import * as fromCapacityQuantity from '../../selectors/capacity-quantity.selectors';
import { TimeThreshold } from '../../models/request-settings';
import RequestSettingsSelectors from 'src/app/core/selectors/request-settings.selectors';
import { ConfirmBulkEditDialogComponent } from '../../components/confirm-bulk-edit-dialog/confirm-bulk-edit-dialog.component';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { boundHasOwnProperty } from '../../../util';
import { VehicleFormFields } from '../../models/vehicle-form-fields';

@Component({
  selector: 'app-pre-solve-edit-vehicle-dialog',
  templateUrl: './pre-solve-edit-vehicle-dialog.component.html',
  styleUrls: ['./pre-solve-edit-vehicle-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MapService, VehicleLayer],
})
export class PreSolveEditVehicleDialogComponent implements OnInit {
  @Input() vehicleIds: number[];

  abbreviations$: Observable<{ [unit: string]: string }>;
  allowExperimentalFeatures$: Observable<boolean>;
  bulkEditVehicles: Vehicle[];
  disabled$: Observable<boolean>;
  globalDuration$: Observable<[Long, Long]>;
  injectedSolution$: Observable<boolean>;
  nextVehicleId$: Observable<number>;
  scenarioBounds$: Observable<google.maps.LatLngBounds>;
  scenarioCapacities$: Observable<Set<string>>;
  scenarioDemands$: Observable<Set<string>>;
  visitTags$: Observable<string[]>;
  visitTypes$: Observable<string[]>;
  timezoneOffset$: Observable<number>;
  timeThresholds$: Observable<IConstraintRelaxation>;
  vehicle$: Observable<Vehicle>;

  constructor(
    private overwriteDialog: MatDialog,
    private messageService: MessageService,
    private dialogRef: MatDialogRef<PreSolveEditVehicleDialogComponent>,
    private store: Store<fromRoot.State>
  ) {}

  ngOnInit(): void {
    this.abbreviations$ = this.store.pipe(select(fromConfig.selectUnitAbbreviations));
    this.disabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));
    this.visitTags$ = this.store.pipe(select(fromScenario.selectVisitTags), take(1));
    this.visitTypes$ = this.store.pipe(select(fromScenario.selectVisitTypes), take(1));
    this.timezoneOffset$ = this.store.pipe(select(selectTimezoneOffset), take(1));
    this.scenarioCapacities$ = this.store.pipe(select(fromCapacityQuantity.selectUniqueCapacities));
    this.scenarioDemands$ = this.store.pipe(select(fromCapacityQuantity.selectUniqueDemands));
    this.injectedSolution$ = this.store.pipe(
      select(RequestSettingsSelectors.selectInjectedSolution)
    );
    this.globalDuration$ = this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration));
    this.nextVehicleId$ = this.store.pipe(select(fromVehicles.selectNextVehicleId), take(1));
    this.allowExperimentalFeatures$ = this.store.pipe(
      select(fromConfig.selectAllowExperimentalFeatures),
      take(1)
    );

    if (this.vehicleIds.length === 1) {
      this.vehicle$ = this.store.pipe(select(fromVehicles.selectById(this.vehicleIds[0])), take(1));
      this.timeThresholds$ = this.store.pipe(
        select(RequestSettingsSelectors.selectConstraintRelaxationsForVehicle(this.vehicleIds[0])),
        take(1)
      );
    } else {
      this.vehicle$ = of({ id: -1 });
      this.store
        .pipe(select(fromVehicles.selectByIds(this.vehicleIds)), take(1))
        .subscribe((vehicles) => (this.bulkEditVehicles = vehicles));
    }
    // Form map bounds will remember the initial bounds
    this.scenarioBounds$ = this.store.pipe(select(fromMap.selectFormScenarioBounds), take(1));
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(result: {
    timeThresholds: TimeThreshold[];
    vehicle: Vehicle;
    unsetFields: string[];
  }): void {
    const { timeThresholds, vehicle } = result;
    const vehicles = this.vehicleToSavedVehicles(vehicle, result.unsetFields);
    if (vehicles.length === 1) {
      this.store.dispatch(
        upsertVehicles({
          changeTime: Date.now(),
          timeThresholds,
          vehicles: vehicles,
        })
      );
      this.dialogRef.close();
    } else {
      const editedFields = this.getEditedFields(vehicle, result.unsetFields);
      if (editedFields.length === 0) {
        this.dialogRef.close();
        this.messageService.info(this.messageService.messages.noChanges);
      } else {
        this.overwriteDialog
          .open(ConfirmBulkEditDialogComponent, {
            data: {
              fields: editedFields,
              isShipment: false,
            },
          })
          .afterClosed()
          .subscribe((res) => {
            if (res) {
              this.store.dispatch(
                upsertVehicles({
                  changeTime: Date.now(),
                  timeThresholds,
                  vehicles: vehicles,
                })
              );
              this.dialogRef.close();
            }
          });
      }
    }
  }

  filterUnusedParams(vehicle: Vehicle, unsetFields: string[]): Partial<Vehicle> {
    const filteredVehicle = {};
    Object.keys(vehicle).forEach((key) => {
      const param = vehicle[key];
      if (
        key !== 'id' &&
        param != null &&
        (!boundHasOwnProperty(param, 'length') ||
          (boundHasOwnProperty(param, 'length') && param.length)) &&
        (!(typeof param == 'object') ||
          (typeof param == 'object' && Object.keys(param).filter((each) => param[each]).length > 0))
      ) {
        filteredVehicle[key] = param;
      }
    });
    return this.unsetFields(filteredVehicle, unsetFields);
  }

  unsetFields(vehicle: Partial<Vehicle>, unsetFields: string[]): Partial<Vehicle> {
    if (unsetFields.includes(VehicleFormFields.RouteEmpty)) {
      vehicle.usedIfRouteIsEmpty = null;
    }
    if (unsetFields.includes(VehicleFormFields.Label)) {
      vehicle.label = '';
    }
    if (unsetFields.includes(VehicleFormFields.StartLocation)) {
      vehicle.startWaypoint = null;
    }
    if (unsetFields.includes(VehicleFormFields.EndLocation)) {
      vehicle.endWaypoint = null;
    }
    if (unsetFields.includes(VehicleFormFields.StartVisitTags)) {
      vehicle.startTags = [];
    }
    if (unsetFields.includes(VehicleFormFields.EndVisitTags)) {
      vehicle.endTags = [];
    }
    if (unsetFields.includes(VehicleFormFields.StartTimeWindows)) {
      vehicle.startTimeWindows = [];
    }
    if (unsetFields.includes(VehicleFormFields.EndTimeWindows)) {
      vehicle.endTimeWindows = [];
    }
    if (unsetFields.includes(VehicleFormFields.LoadLimits)) {
      vehicle.loadLimits = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelFixedCost)) {
      vehicle.fixedCost = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelCostPerKm)) {
      vehicle.costPerKilometer = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelCostPerHour)) {
      vehicle.costPerHour = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelCostPerTravelledHour)) {
      vehicle.costPerTraveledHour = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelModeSetting)) {
      vehicle.travelMode = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelDurationSetting)) {
      vehicle.travelDurationMultiple = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelUnloadingPolicy)) {
      vehicle.unloadingPolicy = null;
    }
    if (unsetFields.includes(VehicleFormFields.RouteDurationLimit)) {
      vehicle.routeDurationLimit = null;
    }
    if (unsetFields.includes(VehicleFormFields.TravelDurationLimit)) {
      vehicle.travelDurationLimit = null;
    }
    if (unsetFields.includes(VehicleFormFields.RouteDistanceLimit)) {
      vehicle.routeDistanceLimit = null;
    }
    if (unsetFields.includes(VehicleFormFields.ExtraVisitDuration)) {
      vehicle.extraVisitDurationForVisitType = null;
    }
    if (unsetFields.includes(VehicleFormFields.BreakRule)) {
      vehicle.breakRule = undefined;
    }
    return vehicle;
  }

  vehicleToSavedVehicles(vehicle: Vehicle, unsetFields: string[]): Vehicle[] {
    if (this.vehicleIds.length === 1) {
      return [vehicle];
    } else {
      return this.bulkEditVehicles.map((originalVehicle) => ({
        ...originalVehicle,
        ...this.filterUnusedParams(vehicle, unsetFields),
      }));
    }
  }

  private getEditedFields(vehicle: Vehicle, unsetFields: string[]): string[] {
    const fields = [];
    if (vehicle.usedIfRouteIsEmpty || unsetFields.includes(VehicleFormFields.RouteEmpty)) {
      fields.push('Used if route is empty');
    }
    if (vehicle.label || unsetFields.includes(VehicleFormFields.Label)) {
      fields.push('Label');
    }
    if (vehicle.startWaypoint || unsetFields.includes(VehicleFormFields.StartLocation)) {
      fields.push('Start Location');
    }
    if (vehicle.endWaypoint || unsetFields.includes(VehicleFormFields.EndLocation)) {
      fields.push('End Location');
    }
    if (vehicle.startTags || unsetFields.includes(VehicleFormFields.StartVisitTags)) {
      fields.push('Start Tags');
    }
    if (vehicle.endTags || unsetFields.includes(VehicleFormFields.EndVisitTags)) {
      fields.push('End Tags');
    }
    if (
      vehicle.startTimeWindows.length > 0 ||
      unsetFields.includes(VehicleFormFields.StartTimeWindows)
    ) {
      fields.push('Start Time Windows');
    }
    if (
      vehicle.endTimeWindows.length > 0 ||
      unsetFields.includes(VehicleFormFields.EndTimeWindows)
    ) {
      fields.push('End Time Windows');
    }
    if (
      (vehicle.loadLimits && Object.keys(vehicle.loadLimits).length > 0) ||
      unsetFields.includes(VehicleFormFields.LoadLimits)
    ) {
      fields.push('Load Limits');
    }
    if (vehicle.fixedCost || unsetFields.includes(VehicleFormFields.TravelFixedCost)) {
      fields.push('Fixed cost of use');
    }
    if (vehicle.costPerKilometer || unsetFields.includes(VehicleFormFields.TravelCostPerKm)) {
      fields.push('Cost per kilometer');
    }
    if (vehicle.costPerHour || unsetFields.includes(VehicleFormFields.TravelCostPerHour)) {
      fields.push('Cost per hour');
    }
    if (
      vehicle.costPerTraveledHour ||
      unsetFields.includes(VehicleFormFields.TravelCostPerTravelledHour)
    ) {
      fields.push('Cost per traveled hour');
    }
    if (vehicle.travelMode || unsetFields.includes(VehicleFormFields.TravelModeSetting)) {
      fields.push('Travel mode');
    }
    if (
      vehicle.travelDurationMultiple ||
      unsetFields.includes(VehicleFormFields.TravelDurationSetting)
    ) {
      fields.push('Travel duration multiple');
    }
    if (vehicle.unloadingPolicy || unsetFields.includes(VehicleFormFields.TravelUnloadingPolicy)) {
      fields.push('Unloading policy');
    }
    if (vehicle.routeDurationLimit || unsetFields.includes(VehicleFormFields.RouteDurationLimit)) {
      fields.push('Route duration limit');
    }
    if (
      vehicle.travelDurationLimit.costPerHourAfterSoftMax ||
      vehicle.travelDurationLimit.maxDuration ||
      vehicle.travelDurationLimit.costPerSquareHourAfterQuadraticSoftMax ||
      vehicle.travelDurationLimit.quadraticSoftMaxDuration ||
      vehicle.travelDurationLimit.softMaxDuration ||
      unsetFields.includes(VehicleFormFields.TravelDurationLimit)
    ) {
      fields.push('Travel duration limit');
    }
    if (vehicle.routeDistanceLimit || unsetFields.includes(VehicleFormFields.RouteDistanceLimit)) {
      fields.push('Route distance limit');
    }
    if (
      Object.keys(vehicle.extraVisitDurationForVisitType).length > 0 ||
      unsetFields.includes(VehicleFormFields.ExtraVisitDuration)
    ) {
      fields.push('Extra Visit Duration');
    }
    if (unsetFields.includes(VehicleFormFields.BreakRule)) {
      fields.push('Break Rule');
    }
    if (vehicle.breakRule?.breakRequests?.length > 0) {
      fields.push('Break Requests');
    }
    if (vehicle.breakRule?.frequencyConstraints?.length > 0) {
      fields.push('Frequency Contraints');
    }
    return fields;
  }
}
