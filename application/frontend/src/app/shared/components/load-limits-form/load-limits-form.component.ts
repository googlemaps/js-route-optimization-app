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

import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  ControlContainer,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import Long from 'long';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ILoadLimit } from 'src/app/core/models';
import { aLessThanB, nonNegativeIntegerValidator } from 'src/app/util';
import { LoadLimitFormValue } from '../../models/load-limit';

export class StartLoadErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl, form: FormGroupDirective | NgForm): boolean {
    const isSubmitted = form && form.submitted;
    return (
      form.errors?.startMinLessThanMax ||
      !!(control && control.invalid && (control.dirty || control.touched || isSubmitted))
    );
  }
}

export class EndLoadErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl, form: FormGroupDirective | NgForm): boolean {
    const isSubmitted = form && form.submitted;
    return (
      form.errors?.endMinLessThanMax ||
      !!(control && control.invalid && (control.dirty || control.touched || isSubmitted))
    );
  }
}

export class SoftMaxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl, form: FormGroupDirective | NgForm): boolean {
    const isSubmitted = form && form.submitted;
    return (
      form.errors?.softMaxLessThanMax ||
      !!(control && control.invalid && (control.dirty || control.touched || isSubmitted))
    );
  }
}

@Component({
  selector: 'app-load-limits-form',
  templateUrl: './load-limits-form.component.html',
  styleUrls: ['./load-limits-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadLimitsFormComponent implements OnChanges, OnDestroy, OnInit {
  @Input() abbreviations: { [unit: string]: string };
  @Input() appearance: string;
  @Input() disabled = false;
  @Input() scenarioLoadLimits: Set<string>;
  @Input() scenarioLoadDemands: Set<string>;

  control: UntypedFormArray;
  changeSub: Subscription;

  currentFilterIndex: number;
  filteredTypes$: Observable<string[]>;
  uniqueTypes: string[] = [];
  unusedLoadLimits: { [index: number]: boolean } = {};

  startLoadErrorStateMatcher = new StartLoadErrorStateMatcher();
  endLoadErrorStateMatcher = new EndLoadErrorStateMatcher();
  softMaxErrorStateMatcher = new SoftMaxErrorStateMatcher();

  static createFormGroup(fb: UntypedFormBuilder): UntypedFormGroup {
    return fb.group(
      {
        type: fb.control(null, [Validators.required]),
        maxLoad: fb.control(null, [Validators.required, nonNegativeIntegerValidator]),
        softMaxLoad: fb.control(null, [nonNegativeIntegerValidator]),
        costPerUnitAboveSoftMax: fb.control(null),
        startLoadIntervalMin: fb.control(null),
        startLoadIntervalMax: fb.control(null),
        endLoadIntervalMin: fb.control(null),
        endLoadIntervalMax: fb.control(null),
      },
      {
        validators: [
          aLessThanB('softMaxLoad', 'maxLoad', 'softMaxLessThanMax', true),
          aLessThanB(
            'startLoadIntervalMin',
            'startLoadIntervalMax',
            'startMinLessThanMax',
            true,
            true
          ),
          aLessThanB('endLoadIntervalMin', 'endLoadIntervalMax', 'endMinLessThanMax', true, true),
        ],
      }
    );
  }

  static readFormValues(loadLimits: LoadLimitFormValue[] = []): { [k: string]: ILoadLimit } {
    return loadLimits
      .map((loadLimit) => ({
        type: loadLimit.type,
        maxLoad: loadLimit.maxLoad,
        softMaxLoad: loadLimit.softMaxLoad,
        costPerUnitAboveSoftMax: loadLimit.costPerUnitAboveSoftMax,
        startLoadInterval: {
          min: loadLimit.startLoadIntervalMin,
          max: loadLimit.startLoadIntervalMax,
        },
        endLoadInterval: {
          min: loadLimit.endLoadIntervalMin,
          max: loadLimit.endLoadIntervalMax,
        },
      }))
      .reduce(
        (obj, item) =>
          Object.assign(obj, {
            [item.type]: {
              maxLoad: item.maxLoad,
              softMaxLoad: item.softMaxLoad,
              costPerUnitAboveSoftMax: item.costPerUnitAboveSoftMax,
              startLoadInterval: item.startLoadInterval,
              endLoadInterval: item.endLoadInterval,
            },
          }),
        {}
      );
  }

  static createFormValues(loadLimits: { [type: string]: ILoadLimit }): LoadLimitFormValue[] {
    return Object.keys(loadLimits).map((type) =>
      LoadLimitsFormComponent.createFormValue(type, loadLimits[type])
    );
  }

  static createFormValue(type: string, loadLimit: ILoadLimit): LoadLimitFormValue {
    return {
      type,
      maxLoad: loadLimit.maxLoad ? Long.fromValue(loadLimit.maxLoad).toNumber() : null,
      softMaxLoad: loadLimit.softMaxLoad ? Long.fromValue(loadLimit.softMaxLoad).toNumber() : null,
      costPerUnitAboveSoftMax: loadLimit.costPerUnitAboveSoftMax
        ? Long.fromValue(loadLimit.costPerUnitAboveSoftMax).toNumber()
        : null,
      startLoadIntervalMin: loadLimit.startLoadInterval?.min
        ? Long.fromValue(loadLimit.startLoadInterval.min).toNumber()
        : null,
      startLoadIntervalMax: loadLimit.startLoadInterval?.max
        ? Long.fromValue(loadLimit.startLoadInterval.max).toNumber()
        : null,
      endLoadIntervalMin: loadLimit.endLoadInterval?.min
        ? Long.fromValue(loadLimit.endLoadInterval.min).toNumber()
        : null,
      endLoadIntervalMax: loadLimit.endLoadInterval?.max
        ? Long.fromValue(loadLimit.endLoadInterval.max).toNumber()
        : null,
    };
  }

  constructor(
    public controlContainer: ControlContainer,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.control = this.controlContainer.control as UntypedFormArray;
    this.changeSub = this.control?.valueChanges.subscribe(() => {
      this.changeDetector.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.changeSub?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.scenarioLoadLimits || changes.scenarioLoadDemands) {
      this.uniqueTypes = [];
      new Set([...(this.scenarioLoadLimits || []), ...(this.scenarioLoadDemands || [])]).forEach(
        (capacity) => {
          if (capacity && !this.uniqueTypes.includes(capacity)) {
            this.uniqueTypes.push(capacity);
          }
        }
      );
    }
  }

  removeLoadLimit(index: number): void {
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
      map((value) => this.filterLoadLimits(value))
    );
  }

  checkLoadLimitUsage(index: number): void {
    const value = this.control.controls[index].value as LoadLimitFormValue;
    if (!value.type) {
      return;
    }
    const fullValue = value.type;

    if (this.scenarioLoadDemands.has(fullValue)) {
      delete this.unusedLoadLimits[index];
    } else {
      this.unusedLoadLimits[index] = true;
    }
  }

  private filterLoadLimits(value: string): string[] {
    return this.uniqueTypes.filter(this.getLoadLimitsPredicateFn(value));
  }

  private getLoadLimitsPredicateFn(value: string): (loadLimit: string) => boolean {
    const loadLimitsInUse = this.control.controls.map((c) => (c.value ? c.value.type : ''));
    const isAvailable = ((loadLimit: string) =>
      !((loadLimitsInUse as string[]) || []).includes(loadLimit)).bind(this);
    if (value == null) {
      return isAvailable;
    }
    const lowerValue = value.toLowerCase();
    return ((loadLimit: string) =>
      isAvailable(loadLimit) && loadLimit.toLowerCase().includes(lowerValue)).bind(this);
  }
}
