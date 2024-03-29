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
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Store, select } from '@ngrx/store';
import { IPrecedenceRule, Shipment } from '../../models';
import { take } from 'rxjs/operators';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { BehaviorSubject } from 'rxjs';
import { selectAll as selectAllShipments } from '../../../core/selectors/shipment.selectors';
import { noDuplicateFormArrayValuesValidator } from 'src/app/util';

@Component({
  selector: 'app-precedence-rules-dialog',
  templateUrl: './precedence-rules-dialog.component.html',
  styleUrls: ['./precedence-rules-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrecedenceRulesDialogComponent {
  get precedenceRulesControl(): UntypedFormArray {
    return this.form.get('precedenceRules') as UntypedFormArray;
  }

  private createPrecedenceRulesFormGroup(value: IPrecedenceRule = null): UntypedFormGroup {
    return this.fb.group(
      {
        firstIndex: [value?.firstIndex, Validators.required],
        firstIsDelivery: value?.firstIsDelivery || undefined,
        secondIndex: [value?.secondIndex, Validators.required],
        secondIsDelivery: value?.secondIsDelivery || undefined,
        offsetDuration: [value?.offsetDuration?.seconds],
      },
      { updateOn: 'blur' }
    );
  }

  form: UntypedFormGroup;

  scenarioShipments$ = new BehaviorSubject<Shipment[]>([]);

  precedenceRules: IPrecedenceRule[] = [];

  constructor(private store: Store, private fb: UntypedFormBuilder) {
    this.initForm();

    store
      .pipe(select(ShipmentModelSelectors.selectPrecedenceRules), take(1))
      .subscribe((selectPrecedenceRules) => {
        this.resetPrecedenceRules(selectPrecedenceRules || []);
        this.precedenceRulesControl.enable();
      });

    store.pipe(select(selectAllShipments), take(1)).subscribe((shipments) => {
      this.scenarioShipments$.next(shipments);
    });
  }

  initForm(): void {
    this.form = this.fb.group({
      precedenceRules: this.fb.array([], (formArray: UntypedFormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
    });

    this.precedenceRulesControl.statusChanges.subscribe((status) => {
      if (this.precedenceRulesControl.enabled && status === 'VALID') {
        this.onUpdatePrecedenceRules();
      }
    });

    this.precedenceRulesControl.valueChanges.subscribe((value) => {
      value.precedenceRules?.forEach((precedenceRule, index) => {
        // enable secondIndex field if firstIndex is set
        if (precedenceRule.firstIndex !== null) {
          this.precedenceRulesControl.at(index).get('secondIndex').enable();
        }
      });
    });
  }

  resetPrecedenceRules(precedenceRules: IPrecedenceRule[]): void {
    this.precedenceRulesControl.clear({ emitEvent: false });
    this.precedenceRulesControl.markAsPristine();
    this.precedenceRulesControl.markAsUntouched();

    precedenceRules.forEach((rule) => {
      this.precedenceRulesControl.push(this.createPrecedenceRulesFormGroup(rule), {
        emitEvent: false,
      });
    });

    this.precedenceRulesControl.updateValueAndValidity();
  }

  addPrecedenceRule(): void {
    this.precedenceRulesControl.push(this.createPrecedenceRulesFormGroup());
  }

  removePrecedenceRule(index: number): void {
    this.precedenceRulesControl.markAsTouched();
    this.precedenceRulesControl.removeAt(index);
  }

  onUpdatePrecedenceRules(): void {
    this.precedenceRules = this.precedenceRulesControl.value.map((rule) => {
      return <IPrecedenceRule>{
        ...rule,
        // omit *IsDelivery values if not true
        firstIsDelivery: rule.firstIsDelivery || undefined,
        secondIsDelivery: rule.secondIsDelivery || undefined,
        // convert to `IDuration` object
        offsetDuration: rule.offsetDuration
          ? {
              seconds: rule.offsetDuration,
            }
          : undefined,
      };
    });
  }

  getPrecedenceRuleFirstIndexOptions(selectedIndex: number): Shipment[] {
    const options = [];
    if (selectedIndex != null) {
      options.push(this.scenarioShipments$.value[selectedIndex]);
    }
    options.push(...this.scenarioShipments$.value);
    return options;
  }

  getPrecendenceRuleSecondIndexOptions(firstIndex: number, selectedIndex: number): Shipment[] {
    const options = [];
    if (selectedIndex != null) {
      options.push(this.scenarioShipments$.value[selectedIndex]);
    }
    options.push(...this.scenarioShipments$.value.filter((_, i) => i !== firstIndex));
    return options;
  }

  getIndexOfShipment(shipment: Shipment): number {
    return this.scenarioShipments$.value.findIndex((s) => s.id === shipment.id);
  }

  onOffsetDurationChange(): void {
    this.precedenceRulesControl.markAsTouched();
  }
}
