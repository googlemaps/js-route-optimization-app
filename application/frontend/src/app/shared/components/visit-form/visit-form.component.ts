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
  Optional,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import * as Long from 'long';
import { asyncScheduler, combineLatest, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, startWith, throttleTime } from 'rxjs/operators';
import { Vehicle, Visit, VisitRequest, VisitValidationResult } from 'src/app/core/models';
import { ValidationService } from 'src/app/core/services';
import {
  durationSeconds,
  formatTime,
  getEntityName,
  localDateTimeToUtcSeconds,
  secondsToDuration,
  setControlDisabled,
  showError,
  timeToDate,
} from 'src/app/util';
import { timeStringValidator } from 'src/app/util/validators';

@Component({
  selector: 'app-visit-form',
  templateUrl: './visit-form.component.html',
  styleUrls: ['./visit-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VisitFormComponent implements OnChanges, OnInit, OnDestroy {
  @Input() appearance: string;
  @Input() disabled = false;
  @Input() pickup?: Visit;
  @Input() pickupRequest?: VisitRequest;
  @Input() delivery?: Visit;
  @Input() deliveryRequest?: VisitRequest;
  @Input() vehicles: Vehicle[];
  @Input() timezoneOffset = 0;
  @Input() globalDuration: [Long, Long];

  readonly form: UntypedFormGroup;
  readonly optionItemSize = 48;
  readonly pickupStartDateCtrl: UntypedFormControl;
  readonly pickupStartTimeCtrl: UntypedFormControl;
  readonly pickupEndDateCtrl: UntypedFormControl;
  readonly pickupEndTimeCtrl: UntypedFormControl;
  readonly deliveryStartDateCtrl: UntypedFormControl;
  readonly deliveryStartTimeCtrl: UntypedFormControl;
  readonly deliveryEndDateCtrl: UntypedFormControl;
  readonly deliveryEndTimeCtrl: UntypedFormControl;
  readonly vehicleCtrl: UntypedFormControl;

  pickupWarnings: VisitValidationResult;
  deliveryWarnings: VisitValidationResult;
  pickupErrors: VisitValidationResult;
  deliveryErrors: VisitValidationResult;
  filteredVehicles$: Observable<Vehicle[]>;
  showError = showError;

  private readonly subscription: Subscription;

  get invalid(): boolean {
    return this.form.invalid || !!this.pickupErrors || !!this.deliveryErrors;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    @Optional() private validationService: ValidationService
  ) {
    this.form = this.fb.group({
      pickupStartDate: (this.pickupStartDateCtrl = fb.control(null, Validators.required)),
      pickupStartTime: (this.pickupStartTimeCtrl = fb.control(null, [
        Validators.required,
        timeStringValidator,
      ])),
      pickupEndDate: (this.pickupEndDateCtrl = fb.control({ value: null, disabled: true })),
      pickupEndTime: (this.pickupEndTimeCtrl = fb.control({
        value: null,
        validators: timeStringValidator,
        disabled: true,
      })),
      deliveryStartDate: (this.deliveryStartDateCtrl = fb.control(null, Validators.required)),
      deliveryStartTime: (this.deliveryStartTimeCtrl = fb.control(null, [
        Validators.required,
        timeStringValidator,
      ])),
      deliveryEndDate: (this.deliveryEndDateCtrl = fb.control({ value: null, disabled: true })),
      deliveryEndTime: (this.deliveryEndTimeCtrl = fb.control({
        value: null,
        validators: timeStringValidator,
        disabled: true,
      })),
      vehicle: (this.vehicleCtrl = fb.control(null, [Validators.required, this.vehicleValidator])),
    });
    this.subscription = this.validationService
      ? this.form.valueChanges
          .pipe(
            throttleTime(50, asyncScheduler, { leading: true, trailing: true }),
            filter(() => this.form.valid)
          )
          .subscribe(() => {
            this.validatePickupDelivery();
            this.changeDetector.markForCheck();
          })
      : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabled) {
      this.updateDisabledState();
    }
    if (changes.pickup || changes.delivery) {
      this.reset();
    }
  }

  ngOnInit(): void {
    // Filter the vehicles displayed in the autocomplete list to reflect string input
    this.filteredVehicles$ = this.vehicleCtrl.valueChanges.pipe(
      startWith(null as string),
      throttleTime(300, asyncScheduler, { leading: true, trailing: true }),
      map((value: string | Vehicle) => {
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          return this.vehicles?.filter((v) =>
            this.getVehicleName(v).toLowerCase().includes(lowerValue)
          );
        }
        return this.vehicles;
      })
    );
    // Keep the pickup end date/time up-to-date with the entered start date/time
    combineLatest([
      this.pickupStartDateCtrl.valueChanges.pipe(startWith(this.pickupStartDateCtrl.value)),
      this.pickupStartTimeCtrl.valueChanges.pipe(startWith(this.pickupStartTimeCtrl.value)),
    ])
      .pipe(
        map(([startDate, startTime]) =>
          localDateTimeToUtcSeconds(startDate, startTime, this.timezoneOffset)
        ),
        distinctUntilChanged()
      )
      .subscribe((start) => {
        const end =
          start != null && this.pickupRequest
            ? durationSeconds(this.pickupRequest.duration).add(start)
            : null;
        const endDate = end != null ? timeToDate(end, this.timezoneOffset) : null;
        const endTime = end != null ? formatTime(end.toNumber(), null, this.timezoneOffset) : null;
        this.form.patchValue(
          { pickupEndDate: endDate, pickupEndTime: endTime },
          { emitEvent: false }
        );
      });
    // Keep the delivery end date/time up-to-date with the entered start date/time
    combineLatest([
      this.deliveryStartDateCtrl.valueChanges.pipe(startWith(this.deliveryStartDateCtrl.value)),
      this.deliveryStartTimeCtrl.valueChanges.pipe(startWith(this.deliveryStartTimeCtrl.value)),
    ])
      .pipe(
        map(([startDate, startTime]) =>
          localDateTimeToUtcSeconds(startDate, startTime, this.timezoneOffset)
        ),
        distinctUntilChanged()
      )
      .subscribe((start) => {
        const end =
          start != null && this.deliveryRequest
            ? durationSeconds(this.deliveryRequest.duration).add(start)
            : null;
        const endDate = end != null ? timeToDate(end, this.timezoneOffset) : null;
        const endTime = end != null ? formatTime(end.toNumber(), null, this.timezoneOffset) : null;
        this.form.patchValue(
          { deliveryEndDate: endDate, deliveryEndTime: endTime },
          { emitEvent: false }
        );
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  formatTypes(types: string[]): string {
    return '"' + types.join('", "') + '"';
  }

  reset(): void {
    // Assumes pickup and delivery share the same shipment route
    const shipmentRouteId = (this.pickup || this.delivery)?.shipmentRouteId;
    const pickupStart = this.pickup?.startTime ? durationSeconds(this.pickup.startTime) : null;
    const pickupEnd = this.pickupRequest
      ? pickupStart?.add(durationSeconds(this.pickupRequest.duration))
      : null;
    const deliveryStart = this.delivery?.startTime
      ? durationSeconds(this.delivery.startTime)
      : null;
    const deliveryEnd = this.deliveryRequest
      ? deliveryStart?.add(durationSeconds(this.deliveryRequest.duration))
      : null;
    this.form.reset({
      pickupStartDate: pickupStart != null ? timeToDate(pickupStart, this.timezoneOffset) : null,
      pickupStartTime:
        pickupStart != null ? formatTime(pickupStart.toNumber(), null, this.timezoneOffset) : null,
      pickupEndDate: pickupEnd != null ? timeToDate(pickupEnd, this.timezoneOffset) : null,
      pickupEndTime:
        pickupEnd != null ? formatTime(pickupEnd.toNumber(), null, this.timezoneOffset) : null,
      deliveryStartDate:
        deliveryStart != null ? timeToDate(deliveryStart, this.timezoneOffset) : null,
      deliveryStartTime:
        deliveryStart != null
          ? formatTime(deliveryStart.toNumber(), null, this.timezoneOffset)
          : null,
      deliveryEndDate: deliveryEnd != null ? timeToDate(deliveryEnd, this.timezoneOffset) : null,
      deliveryEndTime:
        deliveryEnd != null ? formatTime(deliveryEnd.toNumber(), null, this.timezoneOffset) : null,
      vehicle: this.vehicles?.find((v) => v.id === shipmentRouteId) || null,
    });
    this.updateDisabledState();
    this.form.markAllAsTouched();
    this.form.updateValueAndValidity();
  }

  getDelivery(): Visit {
    if (!this.delivery) {
      return;
    }
    const startTime = localDateTimeToUtcSeconds(
      this.deliveryStartDateCtrl.value,
      this.deliveryStartTimeCtrl.value,
      this.timezoneOffset
    );
    const delivery: Visit = {
      ...this.delivery,
      startTime: secondsToDuration(startTime),
      shipmentRouteId: this.vehicleCtrl.value?.id,
    };
    return delivery;
  }

  getPickup(): Visit {
    if (!this.pickup) {
      return;
    }
    const startTime = localDateTimeToUtcSeconds(
      this.pickupStartDateCtrl.value,
      this.pickupStartTimeCtrl.value,
      this.timezoneOffset
    );
    const pickup: Visit = {
      ...this.pickup,
      startTime: secondsToDuration(startTime),
      shipmentRouteId: this.vehicleCtrl.value?.id,
    };
    return pickup;
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj).sort();
  }

  getVehicleName(vehicle: Vehicle): string {
    return getEntityName(vehicle, 'Vehicle');
  }

  private updateDisabledState(): void {
    setControlDisabled(this.form, this.disabled);
    if (this.pickup == null) {
      this.pickupStartDateCtrl.disable();
      this.pickupStartTimeCtrl.disable();
    }
    if (this.delivery == null) {
      this.deliveryStartDateCtrl.disable();
      this.deliveryStartTimeCtrl.disable();
    }
  }

  private validatePickupDelivery(): void {
    const pickup = this.getPickup();
    const delivery = this.getDelivery();

    // Treat some results as warnings, others as errors, and distinguish between pickup/delivery.
    {
      const {
        globalOutOfRange,
        vehicleOutOfRange,
        deliveryOutOfRange: _deliveryOutOfRange,
        ...rest
      } = this.validationService.validateVisit(pickup, delivery) || {};
      this.pickupErrors =
        globalOutOfRange || vehicleOutOfRange ? { globalOutOfRange, vehicleOutOfRange } : null;
      this.pickupWarnings = Object.keys(rest).length ? rest : null;
    }
    {
      const { globalOutOfRange, vehicleOutOfRange, deliveryOutOfRange, ...rest } =
        this.validationService.validateVisit(delivery, pickup) || {};
      this.deliveryErrors =
        globalOutOfRange || vehicleOutOfRange || deliveryOutOfRange
          ? { globalOutOfRange, vehicleOutOfRange, deliveryOutOfRange }
          : null;
      this.deliveryWarnings = Object.keys(rest).length ? rest : null;
    }
  }

  private vehicleValidator(control: UntypedFormControl): { [error: string]: boolean } {
    return typeof control.value === 'string' ? { invalid: true } : null;
  }
}
