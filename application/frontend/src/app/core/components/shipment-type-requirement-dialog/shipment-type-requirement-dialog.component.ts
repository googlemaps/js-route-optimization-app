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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IShipmentTypeRequirement, RequirementMode } from '../../models';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { noDuplicateFormArrayValuesValidator } from 'src/app/util';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { take } from 'rxjs/operators';
import { ShipmentSelectors } from '../../../core/selectors/shipment.selectors';
import { selectShipmentTypes as selectScenarioShipmentTypes } from '../../../core/selectors/scenario.selectors';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export const REQUIREMENT_MODE_LABELS = {
  [RequirementMode.PERFORMED_BY_SAME_VEHICLE]: 'Performed by same vehicle',
  [RequirementMode.IN_SAME_VEHICLE_AT_PICKUP_TIME]: 'In same vehicle at pickup time',
  [RequirementMode.IN_SAME_VEHICLE_AT_DELIVERY_TIME]: 'In same vehicle at delivery time',
};

@Component({
  selector: 'app-shipment-type-requirement-dialog',
  templateUrl: './shipment-type-requirement-dialog.component.html',
  styleUrls: ['./shipment-type-requirement-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentTypeRequirementDialogComponent {
  get shipmentTypeReqsControl(): UntypedFormArray {
    return this.form.get('shipmentTypeRequirements') as UntypedFormArray;
  }

  private createShipmentTypeReqsFormGroup(
    value: IShipmentTypeRequirement = null
  ): UntypedFormGroup {
    return this.fb.group(
      {
        requiredShipmentTypeAlternatives: [
          value?.requiredShipmentTypeAlternatives || [],
          Validators.required,
        ],
        dependentShipmentTypes: [value?.dependentShipmentTypes || [], Validators.required],
        requirementMode: [value?.requirementMode || null, Validators.required],
      },
      { updateOn: 'blur' }
    );
  }

  keys = Object.keys;
  parseInt = parseInt;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  readonly shipmentTypeRequirementModeLabels = REQUIREMENT_MODE_LABELS;

  unusedShipmentReqTypes: { [index: number]: string[] } = {};

  availableRequiredShipmentType$ = new BehaviorSubject<string[][]>([]);
  filteredAvailableRequiredShipmentType$ = new BehaviorSubject<string[][]>([]);
  availableDependentShipmentType$ = new BehaviorSubject<string[][]>([]);
  filteredAvailableDependentShipmentType$ = new BehaviorSubject<string[][]>([]);

  form: UntypedFormGroup;

  scenarioShipmentTypes: string[] = []; // shipment types anywhere in the scenario
  shipmentsShipmentTypes: string[] = []; // shipment types only on shipments

  shipmentTypeRequirements: IShipmentTypeRequirement[] = [];

  constructor(private fb: UntypedFormBuilder, private store: Store) {
    this.initForm();
    store
      .pipe(select(ShipmentModelSelectors.selectShipmentTypeRequirements), take(1))
      .subscribe((shipmentTypeRequirements) => {
        this.resetShipmentTypeRequirements(shipmentTypeRequirements || []);
        this.shipmentTypeReqsControl.enable();
      });

    // scenario-wide shipment types
    store.pipe(select(selectScenarioShipmentTypes), take(1)).subscribe((scenarioTypes) => {
      this.scenarioShipmentTypes = scenarioTypes;
      this.updateAvailableRequirementShipmentTypes();
      this.updateAvailableDependentShipmentTypes();
    });

    // shipment-only shipment types
    store.pipe(select(ShipmentSelectors.selectShipmentTypes), take(1)).subscribe((types) => {
      this.shipmentsShipmentTypes = Array.from(types);
      this.checkShipmentReqsTypeUsage();
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      shipmentTypeRequirements: this.fb.array([], (formArray: UntypedFormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
    });

    this.shipmentTypeReqsControl.statusChanges.subscribe((status) => {
      if (this.shipmentTypeReqsControl.enabled && status === 'VALID') {
        this.onUpdateShipmentTypeRequirements();
      }
      this.updateAvailableRequirementShipmentTypes();
      this.updateAvailableDependentShipmentTypes();
      this.checkShipmentReqsTypeUsage();
    });
  }

  resetShipmentTypeRequirements(shipmentTypeRequirements: IShipmentTypeRequirement[]): void {
    this.shipmentTypeReqsControl.clear({ emitEvent: false });
    this.shipmentTypeReqsControl.markAsPristine();
    this.shipmentTypeReqsControl.markAsUntouched();

    shipmentTypeRequirements.forEach((req) => {
      this.shipmentTypeReqsControl.push(this.createShipmentTypeReqsFormGroup(req), {
        emitEvent: false,
      });
    });

    this.shipmentTypeReqsControl.updateValueAndValidity();
  }

  addShipmentTypeRequirements(): void {
    this.shipmentTypeReqsControl.push(this.createShipmentTypeReqsFormGroup());
    this.updateAvailableRequirementShipmentTypes();
    this.updateAvailableDependentShipmentTypes();
  }

  removeAlternativeFromRequiredShipmentType(requiredType: string, index: number): void {
    const control = this.shipmentTypeReqsControl.at(index).get('requiredShipmentTypeAlternatives');
    const types = (control.value || []).filter((t) => t !== requiredType);
    control.setValue(types);
    control.markAsTouched();
    this.filteredAvailableRequiredShipmentType$.next(this.availableRequiredShipmentType$.value);
  }

  addTypeToShipmentTypeRequirements(
    rawValue: string,
    index: number,
    input?: HTMLInputElement
  ): void {
    const value = (rawValue || '').trim();
    if (!value) {
      return;
    }
    const reqControl = this.shipmentTypeReqsControl
      .at(index)
      .get('requiredShipmentTypeAlternatives');
    const depControl = this.shipmentTypeReqsControl.at(index).get('dependentShipmentTypes');
    if (reqControl.value.includes(value) || depControl.value.includes(value)) {
      input.value = '';
      return;
    }
    const types = (reqControl.value || []).concat(value);
    reqControl.setValue(types);
    reqControl.markAsTouched();
    this.shipmentTypeReqsControl.updateValueAndValidity();
    input.value = '';
  }

  updateFilteredAvailableRequiredShipmentTypes(text: string): void {
    const filtered = this.availableRequiredShipmentType$.value.map((types) => {
      if (!text) {
        return types;
      }
      return types.filter((t) => t.toLowerCase().includes(text.toLowerCase()));
    });
    this.filteredAvailableRequiredShipmentType$.next(filtered);
  }

  onRequiredShipmentTypeTypeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Tab') {
      this.addTypeToShipmentTypeRequirements(input.value, index, input);
    }
  }

  updateAvailableRequirementShipmentTypes(): void {
    const availableTypes = this.shipmentTypeReqsControl.value.map((sti) =>
      this.scenarioShipmentTypes.filter(
        (st) =>
          !(
            sti?.requiredShipmentTypeAlternatives?.includes(st) ||
            sti?.dependentShipmentTypes?.includes(st)
          )
      )
    );
    this.availableRequiredShipmentType$.next(availableTypes);
  }

  updateAvailableDependentShipmentTypes(): void {
    const availableTypes = this.shipmentTypeReqsControl.value.map((sti) =>
      this.scenarioShipmentTypes.filter(
        (st) =>
          !(
            sti?.requiredShipmentTypeAlternatives?.includes(st) ||
            sti?.dependentShipmentTypes?.includes(st)
          )
      )
    );
    this.availableDependentShipmentType$.next(availableTypes);
  }

  removeTypeFromDependentShipmentType(dependentType: string, index: number): void {
    const control = this.shipmentTypeReqsControl.at(index).get('dependentShipmentTypes');
    const types = (control.value || []).filter((t) => t !== dependentType);
    control.setValue(types);
    control.markAsTouched();
    this.filteredAvailableDependentShipmentType$.next(this.availableDependentShipmentType$.value);
  }

  addTypeToDependentShipmentType(rawValue: string, index: number, input?: HTMLInputElement): void {
    const value = (rawValue || '').trim();
    if (!value) {
      return;
    }

    const reqControl = this.shipmentTypeReqsControl
      .at(index)
      .get('requiredShipmentTypeAlternatives');
    const depControl = this.shipmentTypeReqsControl.at(index).get('dependentShipmentTypes');
    if (reqControl.value.includes(value) || depControl.value.includes(value)) {
      input.value = '';
      return;
    }

    const types = (depControl.value || []).concat(value);
    depControl.setValue(types);
    depControl.markAsTouched();
    this.shipmentTypeReqsControl.updateValueAndValidity();
    input.value = '';
  }

  updateFilteredAvailableDependentShipmentTypes(text: string): void {
    const filtered = this.availableDependentShipmentType$.value.map((types) => {
      if (!text) {
        return types;
      }
      return types.filter((t) => t.toLowerCase().includes(text.toLowerCase()));
    });
    this.filteredAvailableDependentShipmentType$.next(filtered);
  }

  onDependentShipmentTypeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Tab') {
      this.addTypeToDependentShipmentType(input.value, index, input);
    }
  }

  removeShipmentTypeRequirements(index: number): void {
    this.shipmentTypeReqsControl.markAsTouched();
    this.shipmentTypeReqsControl.removeAt(index);
  }

  onUpdateShipmentTypeRequirements(): void {
    this.shipmentTypeRequirements = this.shipmentTypeReqsControl.value;
  }

  checkShipmentReqsTypeUsage(): void {
    this.unusedShipmentReqTypes = this.shipmentTypeReqsControl.value?.map((req) => {
      const unused = (req.requiredShipmentTypeAlternatives || [])
        .concat(req.dependentShipmentTypes || [])
        ?.filter((t) => !this.shipmentsShipmentTypes.includes(t));

      if (unused?.length === 0) {
        return null;
      }
      return unused;
    });
  }
}
