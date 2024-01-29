/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import Long from 'long';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ILoad } from 'src/app/core/models';
import { nonNegativeIntegerValidator } from 'src/app/util/validators';
import { LoadDemandFormValue } from '../../models/load-demand';

@Component({
  selector: 'app-load-demands-form',
  templateUrl: './load-demands-form.component.html',
  styleUrls: ['./load-demands-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadDemandsFormComponent implements OnChanges, OnDestroy, OnInit {
  @Input() abbreviations: { [unit: string]: string };
  @Input() appearance: string;
  @Input() disabled = false;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;

  addingCapacity = false;
  control: UntypedFormArray;
  changeSub: Subscription;

  currentFilterIndex: number;
  filteredTypes$: Observable<string[]>;
  uniqueTypes: string[] = [];
  unusedCapacities: { [index: number]: boolean } = {};

  constructor(
    public controlContainer: ControlContainer,
    private changeDetector: ChangeDetectorRef
  ) {}

  static createFormGroup(fb: UntypedFormBuilder): UntypedFormGroup {
    return fb.group({
      type: fb.control(null, [Validators.required]),
      value: fb.control(null, [Validators.required, nonNegativeIntegerValidator]),
    });
  }

  static readFormValues(loadDemands: LoadDemandFormValue[] = []): { [k: string]: ILoad } {
    return loadDemands
      ?.map((loadDemand) => ({ type: loadDemand.type, value: loadDemand.value }))
      .reduce((obj, item) => Object.assign(obj, { [item.type]: { amount: item.value } }), {});
  }

  static createFormValues(loadDemands: LoadDemandFormValue[]): { type: string; value: number }[] {
    return loadDemands?.map((loadDemand) => LoadDemandsFormComponent.createFormValue(loadDemand));
  }

  static createFormValue(loadDemand: LoadDemandFormValue): { type: string; value: number } {
    return {
      type: loadDemand.type,
      value: loadDemand.value ? Long.fromValue(loadDemand.value.amount).toNumber() : null,
    };
  }

  ngOnInit(): void {
    this.control = this.controlContainer.control as UntypedFormArray;
    this.changeSub = this.control?.valueChanges.subscribe(() => {
      this.changeDetector.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.scenarioCapacities || changes.scenarioDemands) {
      this.uniqueTypes = [];
      new Set([...(this.scenarioCapacities || []), ...(this.scenarioDemands || [])]).forEach(
        (capacity) => {
          if (capacity && !this.uniqueTypes.includes(capacity)) {
            this.uniqueTypes.push(capacity);
          }
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }

  removeCapacity(index: number): void {
    this.control.removeAt(index);
    this.changeDetector.detectChanges();
  }

  setAutocompleteFocus(index: number): void {
    if (this.currentFilterIndex === index) {
      return;
    }
    this.currentFilterIndex = index;
    this.filteredTypes$ = this.control.controls[index].get('type').valueChanges.pipe(
      startWith(''),
      map((value) => this.filterLoadDemands(value))
    );
  }

  checkCapacityUsage(index: number): void {
    const value = this.control.controls[index].value as LoadDemandFormValue;
    if (!value.type) {
      return;
    }
    const fullValue = value.type;
    if (this.scenarioCapacities.has(fullValue)) {
      delete this.unusedCapacities[index];
    } else {
      this.unusedCapacities[index] = true;
    }
  }

  private filterLoadDemands(value: string): string[] {
    return this.uniqueTypes.filter(this.getLoadDemandsPredicateFn(value));
  }

  private getLoadDemandsPredicateFn(value: string): (loadDemand: string) => boolean {
    const loadDemandsInUse = this.control.controls.map((c) => (c.value ? c.value.type : ''));
    const isAvailable = ((loadDemand: string) =>
      !((loadDemandsInUse as string[]) || []).includes(loadDemand)).bind(this);
    if (value == null) {
      return isAvailable;
    }
    const lowerValue = value.toLowerCase();
    return ((loadDemand: string) =>
      isAvailable(loadDemand) && loadDemand.toLowerCase().includes(lowerValue)).bind(this);
  }
}
