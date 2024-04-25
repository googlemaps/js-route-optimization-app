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
import { BehaviorSubject, combineLatest } from 'rxjs';
import {
  aRequiredIfB,
  durationMinutesSeconds,
  requireAxorB,
  secondsToDuration,
} from 'src/app/util';
import { ITransitionAttributes } from '../../models';
import { Store, select } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import * as fromVehicle from '../../../core/selectors/vehicle.selectors';
import VisitRequestSelectors from '../../../core/selectors/visit-request.selectors';

@Component({
  selector: 'app-transition-attributes-dialog',
  templateUrl: './transition-attributes-dialog.component.html',
  styleUrls: ['./transition-attributes-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransitionAttributesDialogComponent {
  get transitionAttributesControl(): UntypedFormArray {
    return this.form.get('transitionAttributes') as UntypedFormArray;
  }

  private createTransitionAttributesFormGroup(value?: ITransitionAttributes): UntypedFormGroup {
    const durationMinSec = durationMinutesSeconds(value?.delay);

    return this.fb.group(
      {
        srcTag: [value?.srcTag],
        excludedSrcTag: [value?.excludedSrcTag],
        dstTag: [value?.dstTag],
        excludedDstTag: [value?.excludedDstTag],
        cost: [value?.cost, Validators.min(0)],
        costPerKilometer: [value?.costPerKilometer, Validators.min(0)],
        distanceLimitSoftMax: [value?.distanceLimit?.softMaxMeters, Validators.min(0)],
        distanceLimitCostAboveSoftMax: [
          value?.distanceLimit?.costPerKilometerAboveSoftMax,
          Validators.min(0),
        ],
        delay: this.fb.group({
          min: [durationMinSec.minutes, Validators.min(0)],
          sec: [durationMinSec.seconds, Validators.min(0)],
        }),
      },
      {
        updateOn: 'blur',
        validators: [
          requireAxorB('srcTag', 'excludedSrcTag', 'srcTagOrExcludeSrcTag'),
          requireAxorB('dstTag', 'excludedDstTag', 'dstTagOrExcludeDstTag'),
          aRequiredIfB(
            'distanceLimitCostAboveSoftMax',
            'distanceLimitSoftMax',
            'distanceLimitSoftCostRequired'
          ),
          aRequiredIfB(
            'distanceLimitSoftMax',
            'distanceLimitCostAboveSoftMax',
            'distanceLimitSoftMaxRequired'
          ),
        ],
      }
    );
  }

  filteredTransitionTags$ = new BehaviorSubject<string[]>([]);
  transitionTags: string[] = [];

  form: UntypedFormGroup;

  transitionAttributes: ITransitionAttributes[] = [];

  constructor(private store: Store, private fb: UntypedFormBuilder) {
    this.initForm();

    // transition attributes
    store
      .pipe(select(ShipmentModelSelectors.selectTransitionAttributes), take(1))
      .subscribe((transitionAttributes) => {
        this.resetTransitionAttributes(transitionAttributes || []);
        this.transitionAttributesControl.enable();
      });

    // transition attributes
    combineLatest([
      this.store.select(fromVehicle.selectVisitTags),
      this.store.select(VisitRequestSelectors.selectVisitTags),
    ])
      .pipe(
        take(1),
        map(([vehicleTags, visitRequestTags]) => {
          return Array.from(new Set([...vehicleTags, ...visitRequestTags]));
        })
      )
      .subscribe((tags) => (this.transitionTags = tags));
  }

  initForm(): void {
    this.form = this.fb.group({
      transitionAttributes: this.fb.array([]),
    });

    this.transitionAttributesControl.statusChanges.subscribe((status) => {
      if (this.transitionAttributesControl.enabled && status === 'VALID') {
        this.onUpdateTransitionAttributes();
      }
    });
  }

  resetTransitionAttributes(transitionAttributes: ITransitionAttributes[]): void {
    this.transitionAttributesControl.clear({ emitEvent: false });
    this.transitionAttributesControl.markAsPristine();
    this.transitionAttributesControl.markAsUntouched();

    transitionAttributes.forEach((attribute) => {
      this.transitionAttributesControl.push(this.createTransitionAttributesFormGroup(attribute), {
        emitEvent: false,
      });
    });

    this.transitionAttributesControl.updateValueAndValidity();
  }

  addTransitionAttributes(): void {
    this.transitionAttributesControl.push(this.createTransitionAttributesFormGroup());
  }

  removeTransitionAttributes(index: number): void {
    this.transitionAttributesControl.markAsTouched();
    this.transitionAttributesControl.removeAt(index);
  }

  onUpdateTransitionAttributes(): void {
    // disable while updating state
    this.transitionAttributes = this.transitionAttributesControl.value.map((transition) => {
      return <ITransitionAttributes>{
        srcTag: transition.srcTag,
        excludedSrcTag: transition.excludedSrcTag,
        dstTag: transition.dstTag,
        excludedDstTag: transition.excludedDstTag,
        cost: transition.cost,
        costPerKilometer: transition.costPerKilometer,
        distanceLimit: {
          softMaxMeters: transition.distanceLimitSoftMax,
          costPerKilometerAboveSoftMax: transition.distanceLimitCostAboveSoftMax,
        },
        delay: secondsToDuration(transition.delay.min * 60 + transition.delay.sec),
      };
    });
  }

  filterTransitionAttributeTags(text: string): void {
    this.filteredTransitionTags$.next(
      this.transitionTags.filter((tag) => tag.toLowerCase().includes(text.toLowerCase()))
    );
  }
}
