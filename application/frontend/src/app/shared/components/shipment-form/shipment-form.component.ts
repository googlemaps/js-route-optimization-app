/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Dictionary } from '@ngrx/entity';
import { asyncScheduler, BehaviorSubject, Observable } from 'rxjs';
import { filter, map, startWith, throttleTime } from 'rxjs/operators';
import { Shipment, Vehicle } from 'src/app/core/models';
import {
  durationMinutesSeconds,
  getEntityName,
  joinLabel,
  secondsToDuration,
  setControlDisabled,
  splitLabel,
} from 'src/app/util';
import {
  noDuplicateCapacitiesValidator,
  noDuplicateValuesValidator,
} from 'src/app/util/validators';
import { LoadDemandsFormComponent } from '../load-demands-form/load-demands-form.component';
import { LoadDemandFormValue } from '../../models/load-demand';
import { ShipmentFormFields } from 'src/app/core/models/shipment-form-fields';

@Component({
  selector: 'app-shipment-form',
  templateUrl: './shipment-form.component.html',
  styleUrls: ['./shipment-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ShipmentFormComponent implements OnChanges, OnInit {
  get loadDemands(): FormArray {
    return this.form.get('loadDemands') as FormArray;
  }

  @Input() abbreviations: { [unit: string]: string };
  @Input() bulkEdit: boolean;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
  @Input() scenarioShipmentTypes: string[];
  @Input() disabled = false;
  @Input() shipment?: Shipment;

  /** Vehicle entities to source shipment vehicle references from */
  @Input() vehicles: Dictionary<Vehicle> = {};

  /** Ids used to map vehicle to index */
  @Input() vehicleIds: number[] = [];
  @Output() unsetEvent = new EventEmitter<{ field: string }>();
  @Input() unsetFields: string[] = [];
  formFields = ShipmentFormFields;

  readonly form: FormGroup;

  get shipmentType(): AbstractControl {
    return this.form.get('shipmentType');
  }
  get penaltyCost(): AbstractControl {
    return this.form.get('penaltyCost');
  }
  get invalid(): boolean {
    return this.form.invalid;
  }
  get perVehicleCosts(): FormArray {
    return this.form.get('perVehicleCosts') as FormArray;
  }
  get pickupToDeliveryLimits(): FormGroup {
    return this.form.get('pickupToDeliveryLimits') as FormGroup;
  }

  separatorKeysCodes: number[] = [ENTER, COMMA];

  labels: string[] = [];
  labelCtrl = new FormControl();

  // shipment type
  shipmentTypeCtrl = new FormControl();
  private availableShipmentTypes: string[] = [];
  filteredAvailableShipmentTypes$: Observable<string[]>;

  // allowed vehicles
  allowedVehicles: Vehicle[] = [];
  private allowedVehicleIds = new Set<number>();
  private availableAllowedVehicles: Vehicle[] = [];
  allowedVehicleCtrl = new FormControl();
  filteredAvailableAllowedVehicles$: Observable<Vehicle[]>;
  readonly optionItemSize = 48;

  // costs per vehicle + costs ver vehicle indices
  costsPerVehicleMap: [cost: number, vehicles: Vehicle[]][] = []; // map each unique cost value to a list of vehicles
  private availableCostVehicles: Vehicle[] = []; // vehicles not currently assigned to a cost
  filteredAvailableCostVehicles$ = new BehaviorSubject<Vehicle[]>([]); // unassigned vehicles, filtered by user input
  /**
   * Flatten `costsPerVehicleMap` into a 1-to-1 array of costs,
   * where each element corresponds to an element in `costsPerVehicleIndices`
   */
  get costsPerVehicle(): number[] | undefined {
    if (!Array.isArray(this.costsPerVehicleMap) || this.costsPerVehicleMap.length === 0) {
      return undefined;
    }

    return this.costsPerVehicleMap.flatMap((c) => c[1].map(() => c[0]));
  }
  /**
   * Flatten `costsPerVehicleMap` into a 1-to-1 array of vehicle ids,
   * where each element corresponds to an element in `costsPerVehicle`
   */
  get costsPerVehicleIndices(): number[] | undefined {
    if (!Array.isArray(this.costsPerVehicleMap) || this.costsPerVehicleMap.length === 0) {
      return undefined;
    }

    return this.costsPerVehicleMap.flatMap((c) => c[1].map((v) => this.vehicleIds.indexOf(v.id)));
  }

  constructor(private changeDetector: ChangeDetectorRef, private fb: FormBuilder) {
    this.form = this.fb.group({
      loadDemands: fb.array([], (formArray: FormArray) =>
        noDuplicateCapacitiesValidator(formArray)
      ),
      shipmentType: this.shipmentTypeCtrl,
      penaltyCost: [null],
      perVehicleCosts: fb.array([], [noDuplicateValuesValidator('cost')]),
      pickupToDeliveryLimits: fb.group({
        timeLimit: fb.group({
          min: [null],
          sec: [null],
        }),
        absoluteDetourLimit: fb.group({
          min: [null],
          sec: [null],
        }),
        relativeDetourLimit: [null, [Validators.min(0)]],
      }),
    });
  }

  ngOnInit(): void {
    this.filteredAvailableShipmentTypes$ = this.shipmentTypeCtrl.valueChanges.pipe(
      startWith(null as string),
      map((value: string) => this.filterShipmentTypes(value))
    );

    this.filteredAvailableAllowedVehicles$ = this.allowedVehicleCtrl.valueChanges.pipe(
      startWith(null as string),
      throttleTime(300, asyncScheduler, { leading: true, trailing: true }),
      // Autocomplete option values bind to the vehicle id (number);
      // ignoring these, the selection handler will trigger another update.
      filter((value) => typeof value !== 'number'),
      map((value: string) => this.filterAllowedVehicles(value))
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabled) {
      this.updateDisabledState();
    }
    if (changes.shipment) {
      this.reset();
      this.form.markAllAsTouched();
    }
    if (changes.scenarioShipmentTypes) {
      this.availableShipmentTypes = (changes.scenarioShipmentTypes.currentValue as string[]) || [];
    }
    if (changes.vehicles) {
      const vehicles: Vehicle[] = Object.values(changes.vehicles.currentValue || {});

      this.availableAllowedVehicles = vehicles.sort((a, b) => a.id - b.id);

      this.availableCostVehicles = vehicles.sort((a, b) => a.id - b.id);
      this.updateFilteredCostVehicles();
    }
  }

  reset(): void {
    const shipment = this.shipment || ({} as Shipment);

    this.parseLabels();

    this.allowedVehicleIds = new Set(
      shipment.allowedVehicleIndices?.map((index) => this.vehicleIds[index]).filter(Boolean) || []
    );
    this.allowedVehicles = Array.from(this.allowedVehicleIds).map((id) => this.vehicles[id]) || [];

    const loadDemands: Array<LoadDemandFormValue> = [];
    if (this.shipment?.loadDemands) {
      Object.keys(this.shipment.loadDemands).forEach((key) => {
        return loadDemands.push({
          type: key,
          value: this.shipment.loadDemands[key],
        });
      });
    }

    this.resetDemands(loadDemands);
    this.resetCostsPerVehicle();

    this.form.reset(
      {
        loadDemands: LoadDemandsFormComponent.createFormValues(loadDemands),
        label: shipment.label || null,
        shipmentType: shipment.shipmentType || null,
        penaltyCost: shipment.penaltyCost ?? null,
        perVehicleCosts: this.perVehicleCosts.value,
        pickupToDeliveryLimits: {
          timeLimit: {
            min: shipment.pickupToDeliveryTimeLimit
              ? durationMinutesSeconds(shipment.pickupToDeliveryTimeLimit).minutes
              : null,
            sec: shipment.pickupToDeliveryTimeLimit
              ? durationMinutesSeconds(shipment.pickupToDeliveryTimeLimit).seconds
              : null,
          },
          absoluteDetourLimit: {
            min: shipment.pickupToDeliveryAbsoluteDetourLimit
              ? durationMinutesSeconds(shipment.pickupToDeliveryAbsoluteDetourLimit).minutes
              : null,
            sec: shipment.pickupToDeliveryAbsoluteDetourLimit
              ? durationMinutesSeconds(shipment.pickupToDeliveryAbsoluteDetourLimit).seconds
              : null,
          },
          relativeDetourLimit: shipment.pickupToDeliveryRelativeDetourLimit || null,
        },
      },
      { emitEvent: false }
    );
    this.updateDisabledState();
  }

  resetDemands(loadDemands): void {
    this.loadDemands.clear();
    (loadDemands || []).forEach((_) => {
      this.loadDemands.push(LoadDemandsFormComponent.createFormGroup(this.fb));
    });
  }

  resetCostsPerVehicle(): void {
    this.costsPerVehicleMap = [];
    this.perVehicleCosts.clear();

    if (
      this.shipment?.costsPerVehicle &&
      this.shipment?.costsPerVehicleIndices &&
      this.shipment.costsPerVehicle.length === this.shipment.costsPerVehicleIndices.length
    ) {
      const uniqueCosts = new Set(this.shipment.costsPerVehicle);

      uniqueCosts.forEach((cost) => {
        const costVehicles = this.shipment.costsPerVehicleIndices
          .filter(
            (_vehicleIndex, cpvArrayIndex) => this.shipment.costsPerVehicle[cpvArrayIndex] === cost
          )
          .map((vehicleIndex) => this.vehicles[this.vehicleIds[vehicleIndex]]);

        this.costsPerVehicleMap.push([cost, costVehicles]);

        this.perVehicleCosts.push(
          this.fb.group({
            cost: [cost],
            vehicles: [null],
          })
        );
      });
    }
  }

  addDemand(): void {
    this.loadDemands.push(LoadDemandsFormComponent.createFormGroup(this.fb));
    this.loadDemands.markAllAsTouched();
    this.loadDemands.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }

  getShipment(): Shipment {
    // Preserve the parts of the source shipment not surfaced to the UI
    const source = this.shipment || ({} as Shipment);
    const shipment: Shipment = {
      ...source,
      loadDemands: LoadDemandsFormComponent.readFormValues(this.loadDemands.value),
      label: joinLabel(this.labels),
      shipmentType: this.shipmentType.value,
      penaltyCost: this.penaltyCost.valid ? this.penaltyCost.value : null,
      costsPerVehicle: this.costsPerVehicle,
      costsPerVehicleIndices: this.costsPerVehicleIndices,
      pickupToDeliveryTimeLimit: secondsToDuration(
        this.pickupToDeliveryLimits.controls?.timeLimit.value.min * 60 +
          this.pickupToDeliveryLimits.controls?.timeLimit.value.sec
      ),
      pickupToDeliveryAbsoluteDetourLimit: secondsToDuration(
        this.pickupToDeliveryLimits.controls?.absoluteDetourLimit.value.min * 60 +
          this.pickupToDeliveryLimits.controls?.absoluteDetourLimit.value.sec
      ),
      pickupToDeliveryRelativeDetourLimit:
        this.pickupToDeliveryLimits.controls?.relativeDetourLimit.value,
      allowedVehicleIndices: this.allowedVehicles
        .map((vehicle) => this.vehicleIds.indexOf(vehicle.id))
        .filter((index) => index >= 0),
    };
    return shipment;
  }

  addLabel(rawValue: any, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();
    if (value) {
      this.labels = this.labels.concat(value);
      input.value = '';
    }
  }

  removeLabel(index: number): void {
    if (index >= 0) {
      const labels = this.labels.slice();
      labels.splice(index, 1);
      this.labels = labels;
    }
  }

  onLabelKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addLabel(input.value, input);
    }
  }

  private filterShipmentTypes(value: string): string[] {
    return this.availableShipmentTypes.filter(
      (st) => st !== value && (!value || st.toLowerCase().includes(value.toLowerCase()))
    );
  }

  onShipmentTypeSelected(event: MatAutocompleteSelectedEvent): void {
    this.shipmentType.setValue(event.option.value);
  }

  onAllowedVehicleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addAllowedVehicleInputToken(input.value, input);
    }
  }

  removeAllowedVehicle(vehicle: Vehicle): void {
    this.allowedVehicleIds.delete(vehicle.id);
    this.allowedVehicles = this.allowedVehicles.filter((v) => v.id !== vehicle.id);
    this.allowedVehicleCtrl.setValue(null);
  }

  addAllowedVehicleInputToken(rawValue: any, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();

    // Add our vehicle
    if (value) {
      const vehicle = this.availableAllowedVehicles.find(this.getAllowedVehiclePredicateFn(value));
      if (vehicle) {
        this.addAllowedVehicle(vehicle);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  selectedAllowedVehicle(event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value;
    this.addAllowedVehicle(this.vehicles[id]);
  }

  getVehicleName(vehicle: Vehicle): string {
    return getEntityName(vehicle, 'Vehicle');
  }

  private addAllowedVehicle(vehicle: Vehicle): void {
    this.allowedVehicleIds.add(vehicle.id);
    this.allowedVehicles = this.allowedVehicles.concat(vehicle);
    this.allowedVehicleCtrl.setValue(null);
  }

  private filterAllowedVehicles(value: string): Vehicle[] {
    return this.availableAllowedVehicles.filter(this.getAllowedVehiclePredicateFn(value));
  }

  /** Gets an allowed vehicle predicate function for find/filter */
  private getAllowedVehiclePredicateFn(value: string): (vehicle: Vehicle) => boolean {
    // Exclude vehicles already part of the allowed vehicles
    const isAvailable = ((vehicle: Vehicle) => !this.allowedVehicleIds.has(vehicle.id)).bind(this);
    if (value == null) {
      return isAvailable;
    }

    // If a filter value is provided, compose the isAvailable filter with a value filter
    const lowerValue = value.toLowerCase();
    return ((vehicle: Vehicle) =>
      isAvailable(vehicle) && this.getVehicleName(vehicle).toLowerCase().includes(lowerValue)).bind(
      this
    );
  }

  addPerVehicleCost(): void {
    this.costsPerVehicleMap.push([null, []]);
    this.perVehicleCosts.controls.push(
      this.fb.group({
        cost: null,
        vehicles: [],
      })
    );
  }

  updatePerVehicleCost(costIndex: number, value: number): void {
    this.costsPerVehicleMap[costIndex][0] = value;
  }

  removePerVehicleCost(costIndex: number): void {
    this.costsPerVehicleMap.splice(costIndex, 1);
    this.perVehicleCosts.controls.splice(costIndex, 1);
  }

  onCostVehicleKeyDown(costIndex: number, event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addCostVehicleInputToken(costIndex, input.value, input);
    }
  }

  removeCostVehicle(costIndex: number, vehicle: Vehicle): void {
    this.costsPerVehicleMap[costIndex][1] = this.costsPerVehicleMap[costIndex][1].filter(
      (v) => v.id !== vehicle.id
    );

    this.perVehicleCosts.controls[costIndex].get('vehicles').setValue(null);

    this.updateFilteredCostVehicles(null);
  }

  addCostVehicleInputToken(costIndex: number, rawValue: any, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();

    // Add our vehicle
    if (value) {
      const vehicle = this.availableCostVehicles.find(this.getCostVehiclePredicateFn(value));
      if (vehicle) {
        this.addCostVehicle(costIndex, vehicle);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  selectedCostVehicle(costIndex: number, event: MatAutocompleteSelectedEvent): void {
    const id = event.option.value;
    this.addCostVehicle(costIndex, this.vehicles[id]);
  }

  private addCostVehicle(costIndex: number, vehicle: Vehicle): void {
    this.costsPerVehicleMap[costIndex][1] = this.costsPerVehicleMap[costIndex][1].concat(vehicle);

    this.perVehicleCosts.controls[costIndex].get('vehicles').setValue(null);

    this.updateFilteredCostVehicles();
  }

  updateFilteredCostVehicles(value: string = null): void {
    this.filteredAvailableCostVehicles$.next(this.filterCostVehicles(value));
  }

  private filterCostVehicles(value: string): Vehicle[] {
    return this.availableCostVehicles.filter(this.getCostVehiclePredicateFn(value));
  }

  /** Gets an allowed vehicle predicate function for find/filter */
  private getCostVehiclePredicateFn(value: any): (vehicle: Vehicle) => boolean {
    // Exclude vehicles already part of the costs per vehicle
    const isAvailable = ((vehicle: Vehicle) =>
      !this.costsPerVehicleIndices?.includes(this.vehicleIds.indexOf(vehicle.id))).bind(this);
    if (value == null) {
      return isAvailable;
    }

    if (typeof value !== 'string') {
      value = value.toString();
    }

    // If a filter value is provided, compose the isAvailable filter with a value filter
    const lowerValue = value.toLowerCase();
    return ((vehicle: Vehicle) =>
      isAvailable(vehicle) && this.getVehicleName(vehicle).toLowerCase().includes(lowerValue)).bind(
      this
    );
  }

  private parseLabels(): void {
    this.labels = splitLabel(this.shipment?.label) || [];
  }

  private updateDisabledState(): void {
    setControlDisabled(this.form, this.disabled);
  }

  isUnset(field: string): boolean {
    return this.bulkEdit && this.unsetFields.includes(field);
  }

  onUnsetChange(result: { field: string }): void {
    this.unsetEvent.emit(result);
  }
}
