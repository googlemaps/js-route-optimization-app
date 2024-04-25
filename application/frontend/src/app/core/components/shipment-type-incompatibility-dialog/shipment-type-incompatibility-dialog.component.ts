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
import { IShipmentTypeIncompatibility, IncompatibilityMode } from '../../models';
import { BehaviorSubject } from 'rxjs';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Store, select } from '@ngrx/store';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { take } from 'rxjs/operators';
import ShipmentSelectors from '../../selectors/shipment.selectors';
import { selectShipmentTypes as selectScenarioShipmentTypes } from '../../../core/selectors/scenario.selectors';
import { noDuplicateFormArrayValuesValidator } from 'src/app/util';

export const INCOMPATIBILITY_MODE_LABELS = {
  [IncompatibilityMode.NOT_PERFORMED_BY_SAME_VEHICLE]: 'Not performed by same vehicle',
  [IncompatibilityMode.NOT_IN_SAME_VEHICLE_SIMULTANEOUSLY]: 'Not in same vehicle simultaneously',
};

@Component({
  selector: 'app-shipment-type-incompatibility-dialog',
  templateUrl: './shipment-type-incompatibility-dialog.component.html',
  styleUrls: ['./shipment-type-incompatibility-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentTypeIncompatibilityDialogComponent {
  get shipmentTypeIncompatsControl(): UntypedFormArray {
    return this.form.get('shipmentTypeIncompatibilities') as UntypedFormArray;
  }

  private createShipmentTypeIncompatsFormGroup(
    value: IShipmentTypeIncompatibility = null
  ): UntypedFormGroup {
    return this.fb.group(
      {
        types: [value?.types || [], [Validators.required, Validators.minLength(2)]],
        incompatibilityMode: [value?.incompatibilityMode || null, Validators.required],
      },
      { updateOn: 'blur' }
    );
  }

  unusedShipmentIncompatTypes: { [index: number]: string[] } = {};

  readonly shipmentTypeIncompatModeLabels = INCOMPATIBILITY_MODE_LABELS;
  availableIncompatShipmentTypes$ = new BehaviorSubject<string[][]>([]);
  filteredAvailableIncompatShipmentTypes$ = new BehaviorSubject<string[][]>([]);

  shipmentTypeIncompatibilities: IShipmentTypeIncompatibility[] = [];

  keys = Object.keys;
  parseInt = parseInt;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  form: UntypedFormGroup;
  scenarioShipmentTypes: string[] = []; // shipment types anywhere in the scenario
  shipmentsShipmentTypes: string[] = []; // shipment types only on shipments

  constructor(private store: Store, private fb: UntypedFormBuilder) {
    this.initForm();

    // shipment type incompatibilities
    store
      .pipe(select(ShipmentModelSelectors.selectShipmentTypeIncompatibilities), take(1))
      .subscribe((shipmentTypeIncompatibilities) => {
        this.resetShipmentTypeIncompatibilities(shipmentTypeIncompatibilities || []);
        this.shipmentTypeIncompatsControl.enable();
      });

    // scenario-wide shipment types
    store.pipe(select(selectScenarioShipmentTypes), take(1)).subscribe((scenarioTypes) => {
      this.scenarioShipmentTypes = scenarioTypes;
      this.updateAvailableIncompatShipmentTypes();
    });

    // shipment-only shipment types
    store.pipe(select(ShipmentSelectors.selectShipmentTypes), take(1)).subscribe((types) => {
      this.shipmentsShipmentTypes = Array.from(types);
      this.checkShipmentIncompatTypeUsage();
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      shipmentTypeIncompatibilities: this.fb.array([], (formArray: UntypedFormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
    });

    this.shipmentTypeIncompatsControl.statusChanges.subscribe((status) => {
      if (this.shipmentTypeIncompatsControl.enabled && status === 'VALID') {
        this.onUpdateShipmentTypeIncompatibilities();
      }

      this.updateAvailableIncompatShipmentTypes();
      this.checkShipmentIncompatTypeUsage();
    });
  }

  resetShipmentTypeIncompatibilities(
    shipmentTypeIncompatibilities: IShipmentTypeIncompatibility[]
  ): void {
    this.shipmentTypeIncompatsControl.clear({ emitEvent: false });
    this.shipmentTypeIncompatsControl.markAsPristine();
    this.shipmentTypeIncompatsControl.markAsUntouched();

    shipmentTypeIncompatibilities.forEach((incompat) => {
      this.shipmentTypeIncompatsControl.push(this.createShipmentTypeIncompatsFormGroup(incompat), {
        emitEvent: false,
      });
    });

    this.shipmentTypeIncompatsControl.updateValueAndValidity();
  }

  addShipmentTypeIncompat(): void {
    this.shipmentTypeIncompatsControl.push(this.createShipmentTypeIncompatsFormGroup());
  }

  removeShipmentTypeIncompat(index: number): void {
    this.shipmentTypeIncompatsControl.markAsTouched();
    this.shipmentTypeIncompatsControl.removeAt(index);
  }

  addTypeToShipmentTypeIncompat(rawValue: string, index: number, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();
    if (!value) {
      return;
    }
    const control = this.shipmentTypeIncompatsControl.at(index).get('types');
    if (control.value.includes(value)) {
      input.value = '';
      return;
    }
    const types = (control.value || []).concat(value);
    control.setValue(types);
    control.markAsTouched();

    input.value = '';
  }

  removeTypeFromShipmentTypeIncompat(type: string, index: number): void {
    const control = this.shipmentTypeIncompatsControl.at(index).get('types');
    const types = (control.value || []).filter((t) => t !== type);
    control.setValue(types);
    control.markAsTouched();
    this.filteredAvailableIncompatShipmentTypes$.next(this.availableIncompatShipmentTypes$.value);
  }

  onShipmentTypeIncompatTypeKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Tab') {
      this.addTypeToShipmentTypeIncompat(input.value, index, input);
    }
  }

  updateAvailableIncompatShipmentTypes(): void {
    const availableTypes = this.shipmentTypeIncompatsControl.value.map((sti) =>
      this.scenarioShipmentTypes.filter((st) => !sti?.types?.includes(st))
    );
    this.availableIncompatShipmentTypes$.next(availableTypes);
  }

  updateFilteredAvailableIncompatShipmentTypes(text: string): void {
    const filtered = this.availableIncompatShipmentTypes$.value.map((types) => {
      if (!text) {
        return types;
      }
      return types.filter((t) => t.toLowerCase().includes(text.toLowerCase()));
    });
    this.filteredAvailableIncompatShipmentTypes$.next(filtered);
  }

  onUpdateShipmentTypeIncompatibilities(): void {
    this.shipmentTypeIncompatibilities = this.shipmentTypeIncompatsControl.value;
  }

  checkShipmentIncompatTypeUsage(): void {
    this.unusedShipmentIncompatTypes = this.shipmentTypeIncompatsControl.value?.map((incompat) => {
      const unused = incompat.types?.filter((t) => !this.shipmentsShipmentTypes.includes(t));

      if (unused?.length === 0) {
        return null;
      }
      return unused;
    });
  }
}
