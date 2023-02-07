/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { BehaviorSubject, Subscription, combineLatest, Observable } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  IPrecedenceRule,
  IShipmentTypeIncompatibility,
  IShipmentTypeRequirement,
  IncompatibilityMode,
  RequirementMode,
  Shipment,
  ITransitionAttributes,
  NormalizedShipmentModel,
} from '../../models';
import { ShipmentModelSelectors } from '../../selectors/shipment-model.selectors';
import { ShipmentSelectors } from '../../selectors/shipment.selectors';
import { selectShipmentTypes as selectScenarioShipmentTypes } from '../../selectors/scenario.selectors';
import { selectAll as selectAllShipments } from '../../selectors/shipment.selectors';
import {
  aRequiredIfB,
  noDuplicateFormArrayValuesValidator,
  requireAxorB,
  timeStringValidator,
} from '../../../util/validators';
import {
  durationMinutesSeconds,
  durationSeconds,
  formatLongTime,
  localDateTimeToUtcSeconds,
  maxInt32Value,
  secondsToDuration,
  timeToDate,
} from 'src/app/util';
import { Timezone } from '../../../shared/models';
import { selectTimezone, selectTimezoneOffset } from '../../selectors/config.selectors';
import * as Long from 'long';
import { map, take } from 'rxjs/operators';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import VisitRequestSelectors from '../../selectors/visit-request.selectors';

export const INCOMPATIBILITY_MODE_LABELS = {
  [IncompatibilityMode.NOT_PERFORMED_BY_SAME_VEHICLE]: 'Not performed by same vehicle',
  [IncompatibilityMode.NOT_IN_SAME_VEHICLE_SIMULTANEOUSLY]: 'Not in same vehicle simultaneously',
};
export const REQUIREMENT_MODE_LABELS = {
  [RequirementMode.PERFORMED_BY_SAME_VEHICLE]: 'Performed by same vehicle',
  [RequirementMode.IN_SAME_VEHICLE_AT_PICKUP_TIME]: 'In same vehicle at pickup time',
  [RequirementMode.IN_SAME_VEHICLE_AT_DELIVERY_TIME]: 'In same vehicle at delivery time',
};

@Component({
  selector: 'app-pre-solve-shipment-model-settings',
  templateUrl: './pre-solve-shipment-model-settings.component.html',
  styleUrls: ['./pre-solve-shipment-model-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreSolveShipmentModelSettingsComponent implements OnInit, OnDestroy {
  timezoneOffset$: Observable<number>;

  unusedShipmentIncompatTypes: { [index: number]: string[] } = {};
  unusedShipmentReqTypes: { [index: number]: string[] } = {};

  readonly shipmentTypeIncompatModeLabels = INCOMPATIBILITY_MODE_LABELS;
  availableIncompatShipmentTypes$ = new BehaviorSubject<string[][]>([]);
  filteredAvailableIncompatShipmentTypes$ = new BehaviorSubject<string[][]>([]);

  readonly shipmentTypeRequirementModeLabels = REQUIREMENT_MODE_LABELS;
  availableRequiredShipmentType$ = new BehaviorSubject<string[][]>([]);
  filteredAvailableRequiredShipmentType$ = new BehaviorSubject<string[][]>([]);
  availableDependentShipmentType$ = new BehaviorSubject<string[][]>([]);
  filteredAvailableDependentShipmentType$ = new BehaviorSubject<string[][]>([]);
  maxInt32 = maxInt32Value;
  currentTimezone: Timezone;

  filteredTransitionTags$ = new BehaviorSubject<string[]>([]);
  transitionTags: string[] = [];

  updatedShipmentModelSettings: NormalizedShipmentModel = {};

  get globalDurationCostPerHourControl(): FormControl {
    return this.form.get('globalDurationCostPerHour') as FormControl;
  }
  get maxActiveVehicles(): FormControl {
    return this.form.get('maxActiveVehicles') as FormControl;
  }
  get globalStartDate(): FormControl {
    return this.form.get('globalStartDate') as FormControl;
  }
  get globalStartTime(): FormControl {
    return this.form.get('globalStartTime') as FormControl;
  }
  get globalEndDate(): FormControl {
    return this.form.get('globalEndDate') as FormControl;
  }
  get globalEndTime(): FormControl {
    return this.form.get('globalEndTime') as FormControl;
  }
  get shipmentTypeIncompatsControl(): FormArray {
    return this.form.get('shipmentTypeIncompatibilities') as FormArray;
  }

  startAt(): { startAt: Date } {
    const startTime = durationSeconds(null, null);
    return {
      startAt: startTime != null ? new Date(startTime.toNumber() * 1000) : null,
    };
  }

  endAt(): { startAt: Date } {
    const endTime = durationSeconds(null, null);
    return {
      startAt: endTime != null ? new Date(endTime.toNumber() * 1000) : null,
    };
  }

  private createShipmentTypeIncompatsFormGroup(
    value: IShipmentTypeIncompatibility = null
  ): FormGroup {
    return this.fb.group(
      {
        types: [value?.types || [], [Validators.required, Validators.minLength(2)]],
        incompatibilityMode: [value?.incompatibilityMode || null, Validators.required],
      },
      { updateOn: 'blur' }
    );
  }

  get shipmentTypeReqsControl(): FormArray {
    return this.form.get('shipmentTypeRequirements') as FormArray;
  }

  private createShipmentTypeReqsFormGroup(value: IShipmentTypeRequirement = null): FormGroup {
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

  get precedenceRulesControl(): FormArray {
    return this.form.get('precedenceRules') as FormArray;
  }

  private createPrecedenceRulesFormGroup(value: IPrecedenceRule = null): FormGroup {
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

  get transitionAttributesControl(): FormArray {
    return this.form.get('transitionAttributes') as FormArray;
  }

  private createTransitionAttributesFormGroup(value?: ITransitionAttributes): FormGroup {
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

  keys = Object.keys;
  parseInt = parseInt;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  form: FormGroup;

  private readonly subscriptions: Subscription[] = [];
  scenarioShipmentTypes: string[] = []; // shipment types anywhere in the scenario
  shipmentsShipmentTypes: string[] = []; // shipment types only on shipments

  scenarioShipments$ = new BehaviorSubject<Shipment[]>([]);

  constructor(private fb: FormBuilder, private store: Store) {
    this.initForm();

    // global duration cost per hour
    this.subscriptions.push(
      store
        .pipe(select(ShipmentModelSelectors.selectGlobalDurationCostPerHour))
        .subscribe((globalDurationCostPerHour) => {
          this.globalDurationCostPerHourControl.reset(globalDurationCostPerHour);
        })
    );

    // max active vehicles
    this.subscriptions.push(
      store
        .pipe(select(ShipmentModelSelectors.selectMaxActiveVehicles))
        .subscribe((maxActiveVehicles) => {
          this.maxActiveVehicles.reset(maxActiveVehicles);
        })
    );

    this.subscriptions.push(
      combineLatest([
        store.pipe(select(selectTimezone)),
        store.pipe(select(ShipmentModelSelectors.selectGlobalStartTime)),
        store.pipe(select(ShipmentModelSelectors.selectGlobalEndTime)),
      ]).subscribe(([selectTimezone, selectGlobalStartTime, selectGlobalEndTime]) => {
        this.currentTimezone = selectTimezone as Timezone;
        this.globalStartDate.reset(
          timeToDate(Long.fromValue(selectGlobalStartTime), this.currentTimezone.offset)
        );
        this.globalStartTime.reset(this.formatTime(Long.fromValue(selectGlobalStartTime)));
        this.globalEndDate.reset(
          timeToDate(Long.fromValue(selectGlobalEndTime), this.currentTimezone.offset)
        );
        this.globalEndTime.reset(this.formatTime(Long.fromValue(selectGlobalEndTime)));
      })
    );

    // precedence rules
    this.subscriptions.push(
      store
        .pipe(select(ShipmentModelSelectors.selectPrecedenceRules))
        .subscribe((selectPrecedenceRules) => {
          this.resetPrecedenceRules(selectPrecedenceRules || []);
          this.precedenceRulesControl.enable();
        })
    );

    // transition attributes
    this.subscriptions.push(
      store
        .pipe(select(ShipmentModelSelectors.selectTransitionAttributes))
        .subscribe((transitionAttributes) => {
          this.resetTransitionAttributes(transitionAttributes || []);
          this.transitionAttributesControl.enable();
        })
    );

    // shipment type incompatibilities
    this.subscriptions.push(
      store
        .pipe(select(ShipmentModelSelectors.selectShipmentTypeIncompatibilities))
        .subscribe((shipmentTypeIncompatibilities) => {
          this.resetShipmentTypeIncompatibilities(shipmentTypeIncompatibilities || []);
          this.shipmentTypeIncompatsControl.enable();
        })
    );

    // shipment type requirements
    this.subscriptions.push(
      store
        .pipe(select(ShipmentModelSelectors.selectShipmentTypeRequirements))
        .subscribe((shipmentTypeRequirements) => {
          this.resetShipmentTypeRequirements(shipmentTypeRequirements || []);
          this.shipmentTypeReqsControl.enable();
        })
    );

    // scenario-wide shipment types
    this.subscriptions.push(
      store.pipe(select(selectScenarioShipmentTypes)).subscribe((scenarioTypes) => {
        this.scenarioShipmentTypes = scenarioTypes;
        this.updateAvailableIncompatShipmentTypes();
        this.updateAvailableRequirementShipmentTypes();
        this.updateAvailableDependentShipmentTypes();
      })
    );

    // shipment-only shipment types
    this.subscriptions.push(
      store.pipe(select(ShipmentSelectors.selectShipmentTypes)).subscribe((types) => {
        this.shipmentsShipmentTypes = Array.from(types);
        this.checkShipmentIncompatTypeUsage();
        this.checkShipmentReqsTypeUsage();
      })
    );

    // shipments
    this.subscriptions.push(
      store.pipe(select(selectAllShipments)).subscribe((shipments) => {
        this.scenarioShipments$.next(shipments);
      })
    );

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
  ngOnInit(): void {
    this.timezoneOffset$ = this.store.pipe(select(selectTimezoneOffset), take(1));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  initForm(): void {
    this.form = this.fb.group({
      globalDurationCostPerHour: [null],
      maxActiveVehicles: [null, [Validators.min(1), Validators.max(maxInt32Value)]],
      globalStartDate: [null, Validators.required],
      globalStartTime: [null, [Validators.required, timeStringValidator]],
      globalEndDate: [null, Validators.required],
      globalEndTime: [null, [Validators.required, timeStringValidator]],
      precedenceRules: this.fb.array([], (formArray: FormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
      shipmentTypeIncompatibilities: this.fb.array([], (formArray: FormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
      shipmentTypeRequirements: this.fb.array([], (formArray: FormArray) =>
        noDuplicateFormArrayValuesValidator(formArray)
      ),
      transitionAttributes: this.fb.array([]),
    });

    this.shipmentTypeIncompatsControl.statusChanges.subscribe((status) => {
      if (this.shipmentTypeIncompatsControl.enabled && status === 'VALID') {
        this.onUpdateShipmentTypeIncompatibilities();
      }

      this.updateAvailableIncompatShipmentTypes();
      this.checkShipmentIncompatTypeUsage();
    });

    this.shipmentTypeReqsControl.statusChanges.subscribe((status) => {
      if (this.shipmentTypeReqsControl.enabled && status === 'VALID') {
        this.onUpdateShipmentTypeRequirements();
      }
      this.updateAvailableRequirementShipmentTypes();
      this.updateAvailableDependentShipmentTypes();
      this.checkShipmentReqsTypeUsage();
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

    this.transitionAttributesControl.statusChanges.subscribe((status) => {
      if (this.transitionAttributesControl.enabled && status === 'VALID') {
        this.onUpdateTransitionAttributes();
      }
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

  // global duration cost per hour
  onUpdateGlobalDurationCostPerHour(): void {
    if (this.globalDurationCostPerHourControl.status === 'VALID') {
      this.updatedShipmentModelSettings.globalDurationCostPerHour =
        this.globalDurationCostPerHourControl.value;
    }
  }

  // max active vehicles
  onUpdateMaxActiveVehicles(): void {
    if (this.maxActiveVehicles.status === 'VALID') {
      this.updatedShipmentModelSettings.maxActiveVehicles = this.maxActiveVehicles.value;
    }
  }

  // global start date time
  onUpdateStartDatetime(): void {
    if (
      this.globalStartDate.value == null ||
      this.globalStartTime.value == null ||
      this.globalStartTime.value === ''
    ) {
      return;
    }
    this.updatedShipmentModelSettings.globalStartTime = localDateTimeToUtcSeconds(
      this.globalStartDate.value,
      this.globalStartTime.value,
      this.currentTimezone.offset
    );
  }

  // global end date time
  onUpdateEndDatetime(): void {
    if (
      this.globalEndDate.value == null ||
      this.globalEndTime.value == null ||
      this.globalEndTime.value === ''
    ) {
      return;
    }
    this.updatedShipmentModelSettings.globalEndTime = localDateTimeToUtcSeconds(
      this.globalEndDate.value,
      this.globalEndTime.value,
      this.currentTimezone.offset
    );
  }

  // shipment type incompatibilities
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

  private shouldUpdateState(control: AbstractControl): boolean {
    return control.enabled && (control.touched || control.dirty) && control.valid;
  }

  onUpdateShipmentTypeIncompatibilities(): void {
    if (this.shouldUpdateState(this.shipmentTypeIncompatsControl)) {
      // disable while updating state
      this.updatedShipmentModelSettings.shipmentTypeIncompatibilities =
        this.shipmentTypeIncompatsControl.value;
    }
  }

  // shipment type Requirements
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
    if (this.shouldUpdateState(this.shipmentTypeReqsControl)) {
      // disable while updating state
      this.updatedShipmentModelSettings.shipmentTypeRequirements =
        this.shipmentTypeReqsControl.value;
    }
  }

  // Precedence Rules
  addPrecedenceRule(): void {
    this.precedenceRulesControl.push(this.createPrecedenceRulesFormGroup());
  }

  removePrecedenceRule(index: number): void {
    this.precedenceRulesControl.markAsTouched();
    this.precedenceRulesControl.removeAt(index);
  }

  onUpdatePrecedenceRules(): void {
    if (this.shouldUpdateState(this.precedenceRulesControl)) {
      // disable while updating state

      this.updatedShipmentModelSettings.precedenceRules = this.precedenceRulesControl.value.map(
        (rule) => {
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
        }
      );
    }
  }

  getPrecedenceRuleFirstIndexOptions(selectedIndex: number): Shipment[] {
    return [
      selectedIndex && this.scenarioShipments$.value[selectedIndex],
      ...this.scenarioShipments$.value,
    ];
  }

  getPrecendenceRuleSecondIndexOptions(firstIndex: number, selectedIndex: number): Shipment[] {
    return [
      selectedIndex && this.scenarioShipments$.value[selectedIndex],
      ...this.scenarioShipments$.value.filter((_, i) => i !== firstIndex),
    ];
  }

  getIndexOfShipment(shipment: Shipment): number {
    return this.scenarioShipments$.value.findIndex((s) => s.id === shipment.id);
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

  formatTime(seconds: Long): string {
    return formatLongTime(seconds, null, this.currentTimezone.offset);
  }
  onOffsetDurationChange(): void {
    this.precedenceRulesControl.markAsTouched();
  }

  // Transition attributes
  addTransitionAttributes(): void {
    this.transitionAttributesControl.push(this.createTransitionAttributesFormGroup());
  }

  removeTransitionAttributes(index: number): void {
    this.transitionAttributesControl.markAsTouched();
    this.transitionAttributesControl.removeAt(index);
  }

  onUpdateTransitionAttributes(): void {
    if (!this.shouldUpdateState(this.transitionAttributesControl)) {
      return;
    }
    // disable while updating state
    this.updatedShipmentModelSettings.transitionAttributes =
      this.transitionAttributesControl.value.map((transition) => {
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
