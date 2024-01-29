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
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  NgForm,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { merge, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { LoadLimitsFormComponent } from 'src/app/shared/components';
import { overlapValidator } from 'src/app/shared/components/time-window/validators';
import {
  cloneDeep,
  createTimestamp,
  durationMinutesSeconds,
  durationSeconds,
  formatLongTime,
  fromDispatcherLatLng,
  joinLabel,
  localDateTimeToUtcSeconds,
  noDuplicateExtraDurationValidator,
  pointsAreCoincident,
  replaceAll,
  secondsToDuration,
  showError,
  splitLabel,
  timeToDate,
  toDispatcherLatLng,
  toPointBounds,
  boundHasOwnProperty,
} from 'src/app/util';
import {
  aLessThanB,
  durationALessThanB,
  aRequiredIfB,
  aRequiredIfDurationB,
  durationWithinGlobalStartEndTime,
  noDuplicateCapacitiesValidator,
  nonNegativeIntegerValidator,
  noUnspecifiedRelaxationLevelValidator,
  timeStringValidator,
} from 'src/app/util/validators';
import {
  IBreakRequest,
  IConstraintRelaxation,
  IFrequencyConstraint,
  ILatLng,
  ITimeWindow,
  RelaxationLevel,
  TravelMode,
  UnloadingPolicy,
  Vehicle,
} from '../../models';
import { TimeThreshold } from '../../models/request-settings';
import { FormMapService, VehicleLayer } from '../../services';
import { LocationId } from '../../services/vehicle-layer.service';
import { ExtraVisitDurationFormComponent } from '../../../shared/components/extra-visit-duration-form/extra-visit-duration-form.component';
import { ExtraVisitDurationFormValue } from '../../../shared/models/extra-visit-duration';
import { MatDialog } from '@angular/material/dialog';
import { BreakRequestFormComponent } from '../../../shared/components/break-request-form/break-request-form.component';
import { FrequencyConstraintFormComponent } from '../../../shared/components/frequency-constraint-form/frequency-constraint-form.component';
import { DomPortal } from '@angular/cdk/portal';
import { PreSolveVehicleActions } from '../../actions';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../../reducers';
import { TimeWindowComponent } from 'src/app/shared/components/time-window/time-window.component';
import { VehicleFormFields } from '../../models/vehicle-form-fields';

enum EditState {
  Off,
  Start,
  End,
}

class DurationMaxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid =
      ngForm?.errors?.softMaxLessThanMax ||
      ngForm?.errors?.quadraticMaxLessThanMax ||
      control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('maxDuration')) ||
        showError(ngForm.form.get('softMaxDuration')) ||
        showError(ngForm.form.get('quadraticMaxDuration')));
    return !!(invalid && show);
  }
}

class DurationSoftMaxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors?.softMaxLessThanMax || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('maxDuration')) ||
        showError(ngForm.form.get('softMaxDuration')));
    return !!(invalid && show);
  }
}

class DurationSoftCostErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors?.softCostRequired || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('softCost')) ||
        showError(ngForm.form.get('softMaxDuration')));
    return !!(invalid && show);
  }
}

class DurationQuadraticCostErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors?.quadraticCostRequired || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('quadraticCost')) ||
        showError(ngForm.form.get('quadraticMaxDuration')));
    return !!(invalid && show);
  }
}

class DurationQuadraticMaxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors?.quadraticMaxLessThanMax || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('maxDuration')) ||
        showError(ngForm.form.get('quadraticMaxDuration')));
    return !!(invalid && show);
  }
}

class DistanceSoftMaxErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors?.durationALessThanB || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('maxDistance')) ||
        showError(ngForm.form.get('softMaxDistance')));
    return !!(invalid && show);
  }
}

class DistanceSoftCostErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: UntypedFormControl | null, ngForm: FormGroupDirective | NgForm | null): boolean {
    const invalid = ngForm?.errors?.aRequiredIfB || control?.invalid;
    const show =
      ngForm &&
      (ngForm.submitted ||
        showError(ngForm.form.get('softCost')) ||
        showError(ngForm.form.get('softMaxDistance')));
    return !!(invalid && show);
  }
}

@Component({
  selector: 'app-base-edit-vehicle-dialog',
  templateUrl: './base-edit-vehicle-dialog.component.html',
  styleUrls: ['./base-edit-vehicle-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseEditVehicleDialogComponent implements OnChanges, OnInit, OnDestroy, AfterViewInit {
  @Input() abbreviations: { [unit: string]: string };
  @Input() allowExperimentalFeatures: boolean;
  @Input() appearance: string;
  @Input() bulkEdit: boolean;
  @Input() bulkNumber: number;
  @Input() globalDuration: [Long, Long];
  @Input() injectedSolution: boolean;
  @Input() relaxationSettings: IConstraintRelaxation;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
  @Input() disabled: boolean;
  @Input() nextVehicleId: number;
  @Input() scenarioBounds?: google.maps.LatLngBounds;
  @Input() visitTags?: string[];
  @Input() visitTypes?: string[];
  @Input() operatorTypes?: Set<string>;
  @Input() existingOperatorTypes?: Set<string>;
  @Input() timezoneOffset?: number;
  @Input() vehicle: Vehicle;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    timeThresholds: TimeThreshold[];
    vehicle: Vehicle;
    unsetFields: string[];
  }>();

  @ViewChildren(TimeWindowComponent) timeWindowForms: QueryList<TimeWindowComponent>;
  @ViewChild('startTimeWindowsPanel', { static: true })
  startTimeWindowExpansionPanel: MatExpansionPanel;
  @ViewChild('endTimeWindowsPanel', { static: true })
  endTimeWindowExpansionPanel: MatExpansionPanel;

  unsetFields: string[] = [];
  formFields = VehicleFormFields;

  get invalid(): boolean {
    return this.form.invalid;
  }
  get startLocation(): AbstractControl {
    return this.form.get('startLocation');
  }
  get startLocationHeading(): AbstractControl {
    return this.form.get('startLocationHeading');
  }
  get startLocationSideOfRoad(): AbstractControl {
    return this.form.get('startLocationSideOfRoad');
  }
  get endLocation(): AbstractControl {
    return this.form.get('endLocation');
  }
  get endLocationHeading(): AbstractControl {
    return this.form.get('endLocationHeading');
  }
  get endLocationSideOfRoad(): AbstractControl {
    return this.form.get('endLocationSideOfRoad');
  }
  get startTimeWindows(): UntypedFormArray {
    return this.form.get('startTimeWindows') as UntypedFormArray;
  }
  get endTimeWindows(): UntypedFormArray {
    return this.form.get('endTimeWindows') as UntypedFormArray;
  }
  get routeDistanceLimit(): UntypedFormGroup {
    return this.form.get('routeDistanceLimit') as UntypedFormGroup;
  }
  get travelDurationLimit(): UntypedFormGroup {
    return this.form.get('travelDurationLimit') as UntypedFormGroup;
  }
  get routeDistanceMax(): AbstractControl {
    return this.routeDistanceLimit.get('maxDistance');
  }
  get routeDistanceSoftMax(): AbstractControl {
    return this.routeDistanceLimit.get('softMaxDistance');
  }
  get routeDistanceCostPerKm(): AbstractControl {
    return this.routeDistanceLimit.get('softCost');
  }
  get routeDurationLimit(): UntypedFormGroup {
    return this.form.get('routeDurationLimit') as UntypedFormGroup;
  }
  get routeDurationMax(): UntypedFormGroup {
    return this.routeDurationLimit.get('maxDuration') as UntypedFormGroup;
  }
  get routeDurationSoftMax(): UntypedFormGroup {
    return this.routeDurationLimit.get('softMaxDuration') as UntypedFormGroup;
  }
  get routeDurationSoftCost(): AbstractControl {
    return this.routeDurationLimit.get('softCost');
  }
  get routeDurationQuadraticMaxDuration(): UntypedFormGroup {
    return this.routeDurationLimit.get('quadraticMaxDuration') as UntypedFormGroup;
  }
  get routeDurationQuadraticCost(): AbstractControl {
    return this.routeDurationLimit.get('quadraticCost');
  }
  get travelCosts(): UntypedFormGroup {
    return this.form.get('travelCosts') as UntypedFormGroup;
  }
  get travelFixedCost(): AbstractControl {
    return this.travelCosts.get('fixedCost');
  }
  get travelCostPerKm(): AbstractControl {
    return this.travelCosts.get('costPerKm');
  }
  get travelCostPerHour(): AbstractControl {
    return this.travelCosts.get('costPerHour');
  }
  get travelCostPerTraveledHour(): AbstractControl {
    return this.travelCosts.get('costPerTraveledHour');
  }
  get travelDurationMax(): UntypedFormGroup {
    return this.travelDurationLimit.get('maxDuration') as UntypedFormGroup;
  }
  get travelDurationSoftMax(): UntypedFormGroup {
    return this.travelDurationLimit.get('softMaxDuration') as UntypedFormGroup;
  }
  get travelDurationCostAfterSoftMax(): AbstractControl {
    return this.travelDurationLimit.get('softCost');
  }
  get travelDurationQuadraticMaxDuration(): UntypedFormGroup {
    return this.travelDurationLimit.get('quadraticMaxDuration') as UntypedFormGroup;
  }
  get travelDurationQuadraticCostAfterSoftMax(): AbstractControl {
    return this.travelDurationLimit.get('quadraticCost');
  }
  get travelDurationMultiple(): AbstractControl {
    return this.form.get('travelDurationMultiple');
  }
  get travelMode(): AbstractControl {
    return this.form.get('travelMode');
  }
  get unloadingPolicy(): AbstractControl {
    return this.form.get('unloadingPolicy');
  }
  get loadLimits(): UntypedFormArray {
    return this.form.get('loadLimits') as UntypedFormArray;
  }
  get extraVisitDurationForVisitType(): UntypedFormArray {
    return this.form.get('extraVisitDurationForVisitType') as UntypedFormArray;
  }
  get breakRule(): UntypedFormGroup {
    return this.form.get('breakRule') as UntypedFormGroup;
  }
  get breakRequests(): UntypedFormArray {
    return this.breakRule.get('breakRequests') as UntypedFormArray;
  }
  get frequencyConstraints(): UntypedFormArray {
    return this.breakRule.get('frequencyConstraints') as UntypedFormArray;
  }
  get relaxationSettingsForm(): UntypedFormArray {
    return this.form.get('relaxationSettings') as UntypedFormArray;
  }
  get usedIfRouteIsEmpty(): AbstractControl {
    return this.form.get('usedIfRouteIsEmpty');
  }

  readonly form: UntypedFormGroup;
  readonly durationMaxErrorStateMatcher = new DurationMaxErrorStateMatcher();
  readonly durationSoftMaxErrorStateMatcher = new DurationSoftMaxErrorStateMatcher();
  readonly durationSoftCostErrorStateMatcher = new DurationSoftCostErrorStateMatcher();
  readonly durationQuadraticCostErrorStateMatcher = new DurationQuadraticCostErrorStateMatcher();
  readonly durationQuadraticMaxErrorStateMatcher = new DurationQuadraticMaxErrorStateMatcher();
  readonly distanceSoftMaxErrorStateMatcher = new DistanceSoftMaxErrorStateMatcher();
  readonly distanceSoftCostErrorStateMatcher = new DistanceSoftCostErrorStateMatcher();

  TravelMode = TravelMode;
  UnloadingPolicy = UnloadingPolicy;
  travelModeKeys = Object.keys(this.TravelMode).filter((_mode, index) => index !== 0);
  unloadingPolicyKeys = Object.keys(this.UnloadingPolicy);
  labelSeparatorKeysCodes: number[] = [ENTER, COMMA];
  visitTagsSeparatorKeysCodes: number[] = [ENTER, COMMA];
  operatorTypeKeysCodes: number[] = [ENTER, COMMA];

  private availableStartVisitTags: string[] = [];
  startVisitTagsCtrl = new UntypedFormControl();
  filteredAvailableStartVisitTags: Observable<string[]>;

  private availableEndVisitTags: string[] = [];
  endVisitTagsCtrl = new UntypedFormControl();
  filteredAvailableEndVisitTags: Observable<string[]>;

  durationSeconds = durationSeconds;
  replaceAll = replaceAll;
  labels: string[] = [];
  requiredOperatorTypes: string[] = [];
  private availableOperatorTypes: string[] = [];
  requiredOperatorTypesCtrl = new UntypedFormControl();
  filteredAvailableOperatorTypes: Observable<string[]>;

  isOperatorTypeError: boolean;
  updatedVehicle: Vehicle;

  editState: EditState = EditState.Off;
  editStates = EditState;

  vehiclePositionChangeSubscription: Subscription;
  editLocationSubscription: Subscription;

  get mapPortal(): DomPortal<any> {
    return this.formMapService.domPortal;
  }

  constructor(
    public overwriteDialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
    private fb: UntypedFormBuilder,
    private formMapService: FormMapService,
    private vehicleLayer: VehicleLayer,
    private store: Store<fromRoot.State>
  ) {
    this.form = fb.group({
      loadLimits: fb.array([], (formArray: UntypedFormArray) => noDuplicateCapacitiesValidator(formArray)),
      startLocation: [null],
      startLocationHeading: [null],
      startLocationSideOfRoad: [null],
      endLocation: [null],
      endLocationHeading: [null],
      endLocationSideOfRoad: [null],
      relaxationSettings: fb.array([]),
      requiredOperatorTypes: [null],
      startTimeWindows: fb.array([], (formArray: UntypedFormArray) => overlapValidator(formArray)),
      endTimeWindows: fb.array([], (formArray: UntypedFormArray) => overlapValidator(formArray)),
      routeDistanceLimit: fb.group(
        {
          maxDistance: [null, [Validators.min(0)]],
          softMaxDistance: [null, [Validators.min(0)]],
          softCost: [null, [Validators.min(0)]],
        },
        {
          validators: [
            aLessThanB('softMaxDistance', 'maxDistance', 'aLessThanB', true),
            aRequiredIfB('softCost', 'softMaxDistance'),
          ],
        }
      ),
      routeDurationLimit: fb.group(
        {
          maxDuration: fb.group({
            min: [null, [Validators.min(0)]],
            sec: [null, [Validators.min(0)]],
          }),
          softMaxDuration: fb.group({
            min: [null, [Validators.min(0)]],
            sec: [null, [Validators.min(0)]],
          }),
          softCost: [null, [Validators.min(0)]],
          quadraticMaxDuration: fb.group({
            min: [null, [Validators.min(0)]],
            sec: [null, [Validators.min(0)]],
          }),
          quadraticCost: [null, [Validators.min(0)]],
        },
        {
          validators: [
            durationALessThanB('softMaxDuration', 'maxDuration', 'softMaxLessThanMax', true),
            durationALessThanB(
              'quadraticMaxDuration',
              'maxDuration',
              'quadraticMaxLessThanMax',
              true
            ),
            aRequiredIfDurationB('softCost', 'softMaxDuration', 'softCostRequired'),
            aRequiredIfDurationB('quadraticCost', 'quadraticMaxDuration', 'quadraticCostRequired'),
          ],
        }
      ),
      travelCosts: fb.group({
        fixedCost: [null, [Validators.min(0)]],
        costPerKm: [null, [Validators.min(0)]],
        costPerHour: [null, [Validators.min(0)]],
        costPerTraveledHour: [null, [Validators.min(0)]],
      }),
      travelDurationLimit: fb.group(
        {
          maxDuration: fb.group({
            min: [null, [Validators.min(0)]],
            sec: [null, [Validators.min(0)]],
          }),
          softMaxDuration: fb.group({
            min: [null, [Validators.min(0)]],
            sec: [null, [Validators.min(0)]],
          }),
          softCost: [null, [Validators.min(0)]],
          quadraticMaxDuration: fb.group({
            min: [null, [Validators.min(0)]],
            sec: [null, [Validators.min(0)]],
          }),
          quadraticCost: [null, [Validators.min(0)]],
        },
        {
          validators: [
            durationALessThanB('softMaxDuration', 'maxDuration', 'softMaxLessThanMax', true),
            durationALessThanB(
              'quadraticMaxDuration',
              'maxDuration',
              'quadraticMaxLessThanMax',
              true
            ),
            aRequiredIfDurationB('softCost', 'softMaxDuration', 'softCostRequired'),
            aRequiredIfDurationB('quadraticCost', 'quadraticMaxDuration', 'quadraticCostRequired'),
          ],
        }
      ),
      extraVisitDurationForVisitType: fb.array([], (formArray: UntypedFormArray) =>
        noDuplicateExtraDurationValidator(formArray)
      ),
      breakRule: fb.group({
        breakRequests: fb.array([]),
        frequencyConstraints: fb.array([]),
      }),
      travelDurationMultiple: [null, [Validators.min(0.001), Validators.max(1000)]],
      travelMode: [null],
      unloadingPolicy: [null],
      usedIfRouteIsEmpty: [null],
    });
  }

  ngOnInit(): void {
    this.vehicleLayer.draggable = !this.disabled;

    this.vehiclePositionChangeSubscription = merge(
      this.vehicleLayer.dragEnd$,
      this.vehicleLayer.edit$
    ).subscribe(({ id, pos }) => {
      const locationControl = id === LocationId.Start ? this.startLocation : this.endLocation;
      locationControl.setValue(pos ? toDispatcherLatLng(pos) : null);
      locationControl.markAsDirty();
      locationControl.markAsTouched();
      this.updateMapBounds();
    });

    this.startLocation.valueChanges.subscribe((pos?: ILatLng) => {
      this.vehicleLayer.move(LocationId.Start, pos);
      this.updateMapBounds();
      this.cancelEditLocation();
    });
    this.endLocation.valueChanges.subscribe((pos?: ILatLng) => {
      this.vehicleLayer.move(LocationId.End, pos);
      this.updateMapBounds();
      this.cancelEditLocation();
    });
    this.filteredAvailableStartVisitTags = this.startVisitTagsCtrl.valueChanges.pipe(
      startWith(null as string),
      map((value: string) => {
        return this.availableStartVisitTags.filter(
          this.getVisitTagsPredicateFn(this.updatedVehicle?.startTags, value)
        );
      })
    );
    this.filteredAvailableEndVisitTags = this.endVisitTagsCtrl.valueChanges.pipe(
      startWith(null as string),
      map((value: string) => {
        return this.availableEndVisitTags.filter(
          this.getVisitTagsPredicateFn(this.updatedVehicle?.endTags, value)
        );
      })
    );
    this.filteredAvailableOperatorTypes = this.requiredOperatorTypesCtrl.valueChanges.pipe(
      startWith(null as string),
      map((value: string) => {
        return [...this.availableOperatorTypes].filter(
          this.getOperatorTypesPredicateFn(this.updatedVehicle?.requiredOperatorTypes, value)
        );
      })
    );
  }

  ngOnDestroy(): void {
    this.vehiclePositionChangeSubscription.unsubscribe();
    this.vehicleLayer.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timeThresholds) {
      this.resetForm();
    }

    if (changes.vehicle) {
      this.resetVehicle();
      this.resetForm();
      this.form.markAllAsTouched();
    }

    if (changes.disabled) {
      if (changes.disabled.currentValue && !changes.disabled.previousValue) {
        this.form.disable();
      } else if (!changes.disabled.currentValue && changes.disabled.previousValue) {
        this.form.enable();
      }
    }

    if (changes.nextVehicleId) {
      if (!this.updatedVehicle.id) {
        this.updatedVehicle.id = changes.nextVehicleId.currentValue;
      }
    }

    if (changes.visitTags) {
      const visitTags = (changes.visitTags.currentValue as string[]) || [];
      this.availableStartVisitTags = visitTags;
      this.availableEndVisitTags = visitTags;
      this.startVisitTagsCtrl.setValue(null);
      this.endVisitTagsCtrl.setValue(null);
    }

    if (changes.operatorTypes) {
      const operatorTypes = (changes.operatorTypes.currentValue as string[]) || [];
      this.availableOperatorTypes = operatorTypes;
      this.requiredOperatorTypesCtrl.setValue(null);
      this.checkOperatorTypeError();
    }
  }

  ngAfterViewInit(): void {
    this.vehicleLayer.show();
    this.initializeMapBounds();
  }

  resetVehicle(): void {
    if (this.vehicle) {
      this.updatedVehicle = cloneDeep(this.vehicle);
    } else {
      this.updatedVehicle = {
        id: this.nextVehicleId,
      };
    }
    this.parseLabels();
    this.setRequiredOperatorTypes();
    this.vehicleLayer.load(this.updatedVehicle);
  }

  resetForm(): void {
    const startTimeWindows = this.resetTimeWindows(
      this.updatedVehicle.startTimeWindows,
      this.startTimeWindows
    );
    const endTimeWindows = this.resetTimeWindows(
      this.updatedVehicle.endTimeWindows,
      this.endTimeWindows
    );

    this.resetLoadLimits();

    const extraVisitDuration: Array<ExtraVisitDurationFormValue> = [];
    if (this.updatedVehicle.extraVisitDurationForVisitType) {
      Object.keys(this.updatedVehicle.extraVisitDurationForVisitType).forEach((key) => {
        this.extraVisitDurationForVisitType.push(
          ExtraVisitDurationFormComponent.createFormGroup(this.fb)
        );
        return extraVisitDuration.push({
          visitType: key,
          extraDuration: this.updatedVehicle.extraVisitDurationForVisitType[key],
        });
      });
      this.resetExtraVisitDurations(extraVisitDuration);
    }

    const breakRules = this.resetBreakRequests(
      this.updatedVehicle?.breakRule?.breakRequests,
      this.breakRequests
    );

    const frequencyConstraints = this.resetFrequencyConstraints(
      this.updatedVehicle?.breakRule?.frequencyConstraints,
      this.frequencyConstraints
    );

    this.form.reset({
      loadLimits: LoadLimitsFormComponent.createFormValues(this.updatedVehicle.loadLimits || {}),
      startLocation: this.updatedVehicle.startWaypoint?.location?.latLng,
      startLocationHeading: this.updatedVehicle.startWaypoint?.location?.heading,
      startLocationSideOfRoad: this.updatedVehicle.startWaypoint?.sideOfRoad,
      endLocation: this.updatedVehicle.endWaypoint?.location?.latLng,
      endLocationHeading: this.updatedVehicle.endWaypoint?.location?.heading,
      endLocationSideOfRoad: this.updatedVehicle.endWaypoint?.sideOfRoad,
      relaxationSettings: this.loadRelaxationSettings(),
      requiredOperatorTypes: this.updatedVehicle.requiredOperatorTypes,
      startTimeWindows: TimeWindowComponent.createFormValues(startTimeWindows, this.timezoneOffset),
      endTimeWindows: TimeWindowComponent.createFormValues(endTimeWindows, this.timezoneOffset),
      travelDurationMultiple: this.updatedVehicle.travelDurationMultiple,
      travelMode: this.updatedVehicle.travelMode,
      unloadingPolicy: this.updatedVehicle.unloadingPolicy,
      usedIfRouteIsEmpty: this.updatedVehicle.usedIfRouteIsEmpty,
      extraVisitDurationForVisitType: ExtraVisitDurationFormComponent.createFormValues(
        extraVisitDuration || []
      ),
    });
    this.breakRule.reset({
      breakRequests: BreakRequestFormComponent.createFormValues(breakRules, this.timezoneOffset),
      frequencyConstraints: FrequencyConstraintFormComponent.createFormValues(frequencyConstraints),
    });

    this.routeDistanceLimit.reset({
      maxDistance: this.updatedVehicle.routeDistanceLimit?.maxMeters,
      softMaxDistance: this.updatedVehicle.routeDistanceLimit?.softMaxMeters,
      softCost: this.updatedVehicle.routeDistanceLimit?.costPerKilometerAboveSoftMax,
    });

    this.routeDurationLimit.reset({
      maxDuration: {
        min: this.updatedVehicle.routeDurationLimit?.maxDuration
          ? durationMinutesSeconds(this.updatedVehicle.routeDurationLimit?.maxDuration).minutes
          : null,
        sec: this.updatedVehicle.routeDurationLimit?.maxDuration
          ? durationMinutesSeconds(this.updatedVehicle.routeDurationLimit?.maxDuration).seconds
          : null,
      },
      softMaxDuration: {
        min: this.updatedVehicle.routeDurationLimit?.softMaxDuration
          ? durationMinutesSeconds(this.updatedVehicle.routeDurationLimit?.softMaxDuration).minutes
          : null,
        sec: this.updatedVehicle.routeDurationLimit?.softMaxDuration
          ? durationMinutesSeconds(this.updatedVehicle.routeDurationLimit?.softMaxDuration).seconds
          : null,
      },
      softCost: this.updatedVehicle.routeDurationLimit?.costPerHourAfterSoftMax,
      quadraticMaxDuration: {
        min: this.updatedVehicle.routeDurationLimit?.quadraticSoftMaxDuration
          ? durationMinutesSeconds(this.updatedVehicle.routeDurationLimit?.quadraticSoftMaxDuration)
              .minutes
          : null,
        sec: this.updatedVehicle.routeDurationLimit?.quadraticSoftMaxDuration
          ? durationMinutesSeconds(this.updatedVehicle.routeDurationLimit?.quadraticSoftMaxDuration)
              .seconds
          : null,
      },
      quadraticCost: this.updatedVehicle.routeDurationLimit?.costPerSquareHourAfterQuadraticSoftMax,
    });

    this.travelCosts.reset({
      fixedCost: this.updatedVehicle.fixedCost,
      costPerKm: this.updatedVehicle.costPerKilometer,
      costPerHour: this.updatedVehicle.costPerHour,
      costPerTraveledHour: this.updatedVehicle.costPerTraveledHour,
    });

    this.travelDurationLimit.reset({
      softCost: this.updatedVehicle.travelDurationLimit?.costPerHourAfterSoftMax,
      maxDuration: {
        min: this.updatedVehicle.travelDurationLimit?.maxDuration
          ? durationMinutesSeconds(this.updatedVehicle.travelDurationLimit?.maxDuration).minutes
          : null,
        sec: this.updatedVehicle.travelDurationLimit?.maxDuration
          ? durationMinutesSeconds(this.updatedVehicle.travelDurationLimit?.maxDuration).seconds
          : null,
      },
      quadraticCost:
        this.updatedVehicle.travelDurationLimit?.costPerSquareHourAfterQuadraticSoftMax,
      quadraticMaxDuration: {
        min: this.updatedVehicle.travelDurationLimit?.quadraticSoftMaxDuration
          ? durationMinutesSeconds(
              this.updatedVehicle.travelDurationLimit?.quadraticSoftMaxDuration
            ).minutes
          : null,
        sec: this.updatedVehicle.travelDurationLimit?.quadraticSoftMaxDuration
          ? durationMinutesSeconds(
              this.updatedVehicle.travelDurationLimit?.quadraticSoftMaxDuration
            ).seconds
          : null,
      },
      softMaxDuration: {
        min: this.updatedVehicle.travelDurationLimit?.softMaxDuration
          ? durationMinutesSeconds(this.updatedVehicle.travelDurationLimit?.softMaxDuration).minutes
          : null,
        sec: this.updatedVehicle.travelDurationLimit?.softMaxDuration
          ? durationMinutesSeconds(this.updatedVehicle.travelDurationLimit?.softMaxDuration).seconds
          : null,
      },
    });
  }

  loadRelaxationSettings(): {
    index: number;
    date: Date;
    level: RelaxationLevel;
    numberOfVisit: number;
    time: string;
  }[] {
    const values = [];
    this.relaxationSettingsForm.clear();

    if (!this.relaxationSettings) {
      return values;
    }

    for (let i = 0; i < this.relaxationSettings.relaxations.length; i++) {
      this.addTimeThreshold();

      const seconds = durationSeconds(this.relaxationSettings.relaxations[i].thresholdTime);
      values.push({
        index: i,
        date: timeToDate(seconds),
        level: this.relaxationSettings.relaxations[i].level,
        numberOfVisits: this.relaxationSettings.relaxations[i].thresholdVisitCount,
        time: formatLongTime(seconds, null, this.timezoneOffset),
      });
    }

    return values;
  }

  private initializeMapBounds(): void {
    const bounds = this.calculateBounds();
    this.formMapService.updateBounds(bounds, () => {
      if (!bounds || bounds.isEmpty()) {
        this.formMapService.zoomToHome();
      }
    });
  }

  updateMapBounds(): void {
    this.formMapService.updateBounds(this.calculateBounds());
  }

  isSinglePointLocation(): boolean {
    return (
      (!this.startLocation.value && !this.endLocation.value) ||
      (this.startLocation.value && !this.endLocation.value) ||
      (!this.startLocation.value && this.endLocation.value) ||
      pointsAreCoincident(
        fromDispatcherLatLng(this.startLocation.value),
        fromDispatcherLatLng(this.endLocation.value),
        50
      )
    );
  }

  calculateBounds(): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();
    if (this.isSinglePointLocation()) {
      const buffer = 1000;
      const position = this.startLocation.value || this.endLocation.value;
      if (position) {
        bounds.union(toPointBounds(fromDispatcherLatLng(position), buffer));
      }
    }

    if (this.startLocation.value) {
      bounds.extend(fromDispatcherLatLng(this.startLocation.value));
    }
    if (this.endLocation.value) {
      bounds.extend(fromDispatcherLatLng(this.endLocation.value));
    }
    return bounds.isEmpty() ? this.scenarioBounds : bounds;
  }

  resetTimeWindows(source: ITimeWindow[], formRef: UntypedFormArray): ITimeWindow[] {
    const timeWindows = source || [];
    while (formRef.length > timeWindows.length) {
      formRef.removeAt(formRef.length - 1);
    }
    while (timeWindows.length > formRef.length) {
      formRef.push(TimeWindowComponent.createFormGroup(this.fb));
    }

    return timeWindows;
  }

  resetLoadLimits(): void {
    this.loadLimits.clear();
    Object.keys(this.updatedVehicle.loadLimits || {}).forEach(() =>
      this.loadLimits.push(LoadLimitsFormComponent.createFormGroup(this.fb))
    );
  }

  resetExtraVisitDurations(extraVisitDuration): void {
    this.extraVisitDurationForVisitType.clear();
    (extraVisitDuration || []).forEach((_) =>
      this.extraVisitDurationForVisitType.push(
        ExtraVisitDurationFormComponent.createFormGroup(this.fb)
      )
    );
  }

  resetBreakRequests(source: IBreakRequest[], formRef: UntypedFormArray): IBreakRequest[] {
    const breakRequests = source || [];
    while (formRef.length > breakRequests.length) {
      formRef.removeAt(formRef.length - 1);
    }
    while (breakRequests.length > formRef.length) {
      formRef.push(BreakRequestFormComponent.createFormGroup(this.fb));
    }
    return breakRequests;
  }

  resetFrequencyConstraints(
    source: IFrequencyConstraint[],
    formRef: UntypedFormArray
  ): IFrequencyConstraint[] {
    const frequencyConstraints = source || [];
    while (formRef.length > frequencyConstraints.length) {
      formRef.removeAt(formRef.length - 1);
    }
    while (frequencyConstraints.length > formRef.length) {
      formRef.push(FrequencyConstraintFormComponent.createFormGroup(this.fb));
    }
    return frequencyConstraints;
  }

  addTimeThreshold(): void {
    this.relaxationSettingsForm.push(
      this.fb.group(
        {
          index: [null],
          date: [null, Validators.required],
          level: [null, [Validators.required, noUnspecifiedRelaxationLevelValidator]],
          numberOfVisits: [null, [Validators.required, nonNegativeIntegerValidator]],
          time: [null, [Validators.required, timeStringValidator]],
        },
        {
          validators: [
            durationWithinGlobalStartEndTime(
              this.globalDuration[0],
              this.globalDuration[1],
              this.timezoneOffset
            ),
          ],
        }
      )
    );
    this.relaxationSettingsForm.markAllAsTouched();
    this.form.updateValueAndValidity();
  }

  removeTimeThreshold(index: number): void {
    this.relaxationSettingsForm.removeAt(index);
  }

  addLoadLimit(): void {
    this.loadLimits.push(LoadLimitsFormComponent.createFormGroup(this.fb));
    this.loadLimits.markAllAsTouched();
    this.loadLimits.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }

  addExtraVisitDuration(): void {
    this.extraVisitDurationForVisitType.push(
      ExtraVisitDurationFormComponent.createFormGroup(this.fb)
    );
    this.extraVisitDurationForVisitType.markAllAsTouched();
    this.extraVisitDurationForVisitType.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }

  addBreakRequest(): void {
    this.breakRequests.push(BreakRequestFormComponent.createFormGroup(this.fb));
    this.breakRequests.markAllAsTouched();
    this.breakRequests.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }

  addFrequencyConstraint(): void {
    this.frequencyConstraints.push(FrequencyConstraintFormComponent.createFormGroup(this.fb));
    this.frequencyConstraints.markAllAsTouched();
    this.frequencyConstraints.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }

  addStartTimeWindow(): void {
    const form = TimeWindowComponent.createFormGroup(this.fb);
    this.startTimeWindows.push(form);
    form.markAllAsTouched();

    if (this.startTimeWindows.length > 1) {
      this.startTimeWindowExpansionPanel.open();
    }
    this.changeDetector.detectChanges();
  }

  addEndTimeWindow(): void {
    const form = TimeWindowComponent.createFormGroup(this.fb);
    this.endTimeWindows.push(form);
    form.markAllAsTouched();

    if (this.endTimeWindows.length > 1) {
      this.endTimeWindowExpansionPanel.open();
    }
    this.changeDetector.detectChanges();
  }

  removeStartTimeWindow(index: number): void {
    this.startTimeWindows.removeAt(index);
    if (this.startTimeWindows.length < 2) {
      this.startTimeWindowExpansionPanel.close();
    }
    this.changeDetector.detectChanges();
  }

  removeBreakRequest(index: number): void {
    this.breakRequests.removeAt(index);
    this.changeDetector.detectChanges();
  }
  removeFrequencyConstraint(index: number): void {
    this.frequencyConstraints.removeAt(index);
    this.changeDetector.detectChanges();
  }

  removeEndTimeWindow(index: number): void {
    this.endTimeWindows.removeAt(index);
    if (this.endTimeWindows.length < 2) {
      this.endTimeWindowExpansionPanel.close();
    }
    this.changeDetector.detectChanges();
  }

  parseLabels(): void {
    this.labels = splitLabel(this.updatedVehicle.label) || [];
  }

  setRequiredOperatorTypes(): void {
    this.requiredOperatorTypes = this.updatedVehicle.requiredOperatorTypes || [];
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

  addOperatorTypeInputToken(rawValue: any, input?: HTMLInputElement): void {
    const value = (rawValue || '').trim();
    if (value) {
      const operatorType = [...this.availableOperatorTypes].find(
        this.getOperatorTypesPredicateFn(this.updatedVehicle.requiredOperatorTypes, value)
      );
      if (operatorType) {
        this.addOperatorType(operatorType);
      } else if (!(this.updatedVehicle.requiredOperatorTypes || []).includes(value)) {
        this.addOperatorType(value);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  private addOperatorType(value: string): void {
    this.updatedVehicle.requiredOperatorTypes = (
      this.updatedVehicle.requiredOperatorTypes || []
    ).concat(value);
    this.setRequiredOperatorTypes();
    this.requiredOperatorTypesCtrl.setValue(null);
    this.checkOperatorTypeError();
  }

  removeOperatorType(index: number): void {
    if (index >= 0) {
      const types = this.requiredOperatorTypes.slice();
      types.splice(index, 1);
      this.updatedVehicle.requiredOperatorTypes = types;
      this.setRequiredOperatorTypes();
      this.requiredOperatorTypesCtrl.setValue(null);
      this.checkOperatorTypeError();
    }
  }

  checkOperatorTypeError(): void {
    this.isOperatorTypeError = false;
    this.updatedVehicle.requiredOperatorTypes?.forEach((type) => {
      if (![...this.existingOperatorTypes].includes(type)) {
        this.isOperatorTypeError = true;
        return;
      }
    });
  }

  onLabelKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addLabel(input.value, input);
    }
  }

  onStartVisitTagsKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addStartVisitTagsInputToken(input.value, input);
    }
  }

  onOperatorTypeKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addOperatorTypeInputToken(input.value, input);
    }
  }

  onStartVisitTagsSelected(event: MatAutocompleteSelectedEvent): void {
    this.addStartVisitTag(event.option.value);
  }

  addStartVisitTagsInputToken(rawValue: any, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();

    // Add our visit tag
    if (value) {
      const visitTag = this.availableStartVisitTags.find(
        this.getVisitTagsPredicateFn(this.updatedVehicle.startTags, value)
      );
      if (visitTag) {
        this.addStartVisitTag(visitTag);
      } else if (!(this.updatedVehicle.startTags || []).includes(value)) {
        this.addStartVisitTag(value);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  private addStartVisitTag(value: string): void {
    this.updatedVehicle.startTags = (this.updatedVehicle.startTags || []).concat(value);
    this.startVisitTagsCtrl.setValue(null);
  }

  removeStartVisitTag(value: string): void {
    this.updatedVehicle.startTags = this.updatedVehicle.startTags.filter((vt) => vt !== value);
    this.startVisitTagsCtrl.setValue(null);
  }

  onEndVisitTagsKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addEndVisitTagsInputToken(input.value, input);
    }
  }

  onEndVisitTagsSelected(event: MatAutocompleteSelectedEvent): void {
    this.addEndVisitTag(event.option.value);
  }

  addEndVisitTagsInputToken(rawValue: any, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();

    // Add our visit tag
    if (value) {
      const visitTag = this.availableEndVisitTags.find(
        this.getVisitTagsPredicateFn(this.updatedVehicle.endTags, value)
      );
      if (visitTag) {
        this.addEndVisitTag(visitTag);
      } else if (!(this.updatedVehicle.endTags || []).includes(value)) {
        this.addEndVisitTag(value);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  private addEndVisitTag(value: string): void {
    this.updatedVehicle.endTags = (this.updatedVehicle.endTags || []).concat(value);
    this.endVisitTagsCtrl.setValue(null);
  }

  removeEndVisitTag(visitTag: string): void {
    this.updatedVehicle.endTags = this.updatedVehicle.endTags.filter((vt) => vt !== visitTag);
    this.endVisitTagsCtrl.setValue(null);
  }

  /** Gets a visit tags predicate function for find/filter */
  private getVisitTagsPredicateFn(
    currentValues: string[],
    value: string
  ): (visitTag: string) => boolean {
    // Exclude options already part of the visit tags (control value)
    const isAvailable = ((visitTag: string) => !(currentValues || []).includes(visitTag)).bind(
      this
    );
    if (value == null) {
      return isAvailable;
    }

    // If a filter value is provided, compose the isAvailable filter with a value filter
    const lowerValue = value.toLowerCase();
    return ((visitTag: string) =>
      isAvailable(visitTag) && visitTag.toLowerCase().includes(lowerValue)).bind(this);
  }

  initProperty(root: object, property: string, initValue: any = {}): void {
    if (!boundHasOwnProperty(root, property) || root[property] === null) {
      root[property] = initValue;
    }
  }

  clearControl(control: AbstractControl): void {
    control.setValue(null);
    control.markAsDirty();
    control.markAsTouched();
  }

  startAt(): { startAt: Date } {
    const startTime = durationSeconds(this.updatedVehicle.startTimeWindows?.[0]?.startTime, null);
    return {
      startAt:
        startTime !== null ? new Date((startTime.toNumber() + this.timezoneOffset) * 1000) : null,
    };
  }

  endAt(): { startAt: Date } {
    const endTime = durationSeconds(this.updatedVehicle.startTimeWindows?.[0]?.endTime, null);
    return {
      startAt:
        endTime !== null ? new Date((endTime.toNumber() + this.timezoneOffset) * 1000) : null,
    };
  }

  setStartLocation(): void {
    this.editState = EditState.Start;
    this.editLocationSubscription = this.vehicleLayer
      .edit(LocationId.Start)
      .subscribe(() => (this.editLocationSubscription = null));
  }

  setEndLocation(): void {
    this.editState = EditState.End;
    this.editLocationSubscription = this.vehicleLayer
      .edit(LocationId.End)
      .subscribe(() => (this.editLocationSubscription = null));
  }

  cancelEditLocation(): void {
    this.editState = EditState.Off;
  }

  formToUpdatedVehicle(): void {
    this.updatedVehicle.label = joinLabel(this.labels);
    this.updatedVehicle.requiredOperatorTypes = this.requiredOperatorTypes;
    this.updatedVehicle.loadLimits = LoadLimitsFormComponent.readFormValues(this.loadLimits.value);
    this.updatedVehicle.extraVisitDurationForVisitType =
      ExtraVisitDurationFormComponent.readFormValues(this.extraVisitDurationForVisitType.value);
    this.updatedVehicle.startWaypoint = this.startLocation.value
      ? {
          location: {
            latLng: this.startLocation.value,
            heading: this.startLocationHeading.value,
          },
          sideOfRoad: this.startLocationSideOfRoad.value,
        }
      : undefined;
    this.updatedVehicle.endWaypoint = this.endLocation.value
      ? {
          location: {
            latLng: this.endLocation.value,
            heading: this.endLocationHeading.value,
          },
          sideOfRoad: this.endLocationSideOfRoad.value,
        }
      : undefined;
    this.updatedVehicle.startTimeWindows = TimeWindowComponent.createTimeWindows(
      this.startTimeWindows,
      this.timezoneOffset
    );
    this.updatedVehicle.endTimeWindows = TimeWindowComponent.createTimeWindows(
      this.endTimeWindows,
      this.timezoneOffset
    );

    this.updatedVehicle.travelDurationMultiple = this.travelDurationMultiple.value;
    this.updatedVehicle.travelMode = this.travelMode.value;
    this.updatedVehicle.unloadingPolicy = this.unloadingPolicy.value;
    this.saveTravelCostsFormData();
    this.saveRouteDistanceFormData();
    this.saveRouteDurationFormData();
    this.saveTravelDurationFormData();
    this.saveBreakRules();
    if (this.usedIfRouteIsEmpty.value) {
      this.store.dispatch(
        PreSolveVehicleActions.selectVehicle({ vehicleId: this.updatedVehicle.id })
      );
    }
    this.updatedVehicle.usedIfRouteIsEmpty = this.usedIfRouteIsEmpty.value;
  }

  saveBreakRules(): void {
    if (this.breakRequests.value.length) {
      if (!this.updatedVehicle.breakRule) {
        this.updatedVehicle.breakRule = {};
      }
      this.updatedVehicle.breakRule.breakRequests = BreakRequestFormComponent.readFormValues(
        this.breakRequests,
        this.timezoneOffset
      );
    } else if (this.updatedVehicle.breakRule?.breakRequests) {
      delete this.updatedVehicle.breakRule.breakRequests;
    }

    if (this.frequencyConstraints.value.length) {
      if (!this.updatedVehicle.breakRule) {
        this.updatedVehicle.breakRule = {};
      }
      this.updatedVehicle.breakRule.frequencyConstraints =
        FrequencyConstraintFormComponent.readFormValues(this.frequencyConstraints);
    } else if (this.updatedVehicle.breakRule?.frequencyConstraints) {
      delete this.updatedVehicle.breakRule.frequencyConstraints;
    }

    if (
      !this.updatedVehicle.breakRule?.breakRequests &&
      !this.updatedVehicle.breakRule?.frequencyConstraints
    ) {
      this.updatedVehicle.breakRule = undefined;
    }
  }

  saveTravelCostsFormData(): void {
    this.updatedVehicle.fixedCost = this.travelFixedCost.value;
    this.updatedVehicle.costPerHour = this.travelCostPerHour.value;
    this.updatedVehicle.costPerKilometer = this.travelCostPerKm.value;
    this.updatedVehicle.costPerTraveledHour = this.travelCostPerTraveledHour.value;
  }

  saveRouteDurationFormData(): void {
    if (
      this.routeDurationMax.value.min == null &&
      this.routeDurationMax.value.sec == null &&
      this.routeDurationSoftMax.value.min == null &&
      this.routeDurationSoftMax.value.sec == null &&
      this.routeDurationQuadraticMaxDuration.value.min == null &&
      this.routeDurationQuadraticMaxDuration.value.sec == null &&
      this.routeDurationSoftCost.value == null &&
      this.routeDurationQuadraticCost.value == null
    ) {
      this.updatedVehicle.routeDurationLimit = null;
      return;
    }
    this.initProperty(this.updatedVehicle, 'routeDurationLimit');
    this.updatedVehicle.routeDurationLimit.maxDuration = secondsToDuration(
      this.routeDurationMax.value.min * 60 + this.routeDurationMax.value.sec
    );
    this.updatedVehicle.routeDurationLimit.softMaxDuration = secondsToDuration(
      this.routeDurationSoftMax.value.min * 60 + this.routeDurationSoftMax.value.sec
    );
    this.updatedVehicle.routeDurationLimit.quadraticSoftMaxDuration = secondsToDuration(
      this.routeDurationQuadraticMaxDuration.value.min * 60 +
        this.routeDurationQuadraticMaxDuration.value.sec
    );
    this.updatedVehicle.routeDurationLimit.costPerHourAfterSoftMax =
      this.routeDurationSoftCost.value;
    this.updatedVehicle.routeDurationLimit.costPerSquareHourAfterQuadraticSoftMax =
      this.routeDurationQuadraticCost.value;
  }

  saveRouteDistanceFormData(): void {
    if (
      this.routeDistanceCostPerKm.value == null &&
      this.routeDistanceMax.value == null &&
      this.routeDistanceSoftMax.value == null
    ) {
      this.updatedVehicle.routeDistanceLimit = null;
      return;
    }

    this.initProperty(this.updatedVehicle, 'routeDistanceLimit');
    this.updatedVehicle.routeDistanceLimit.costPerKilometerAboveSoftMax =
      this.routeDistanceCostPerKm.value;
    this.updatedVehicle.routeDistanceLimit.maxMeters = this.routeDistanceMax.value;
    this.updatedVehicle.routeDistanceLimit.softMaxMeters = this.routeDistanceSoftMax.value;
  }

  saveTravelDurationFormData(): void {
    if (
      this.travelDurationCostAfterSoftMax.value == null &&
      this.travelDurationMax.value.min == null &&
      this.travelDurationMax.value.sec == null &&
      this.travelDurationQuadraticMaxDuration.value.min == null &&
      this.travelDurationQuadraticMaxDuration.value.sec == null &&
      this.travelDurationSoftMax.value == null
    ) {
      this.updatedVehicle.travelDurationLimit = null;
      return;
    }

    this.initProperty(this.updatedVehicle, 'travelDurationLimit');
    this.updatedVehicle.travelDurationLimit.costPerHourAfterSoftMax =
      this.travelDurationCostAfterSoftMax.value;
    this.updatedVehicle.travelDurationLimit.maxDuration = secondsToDuration(
      this.travelDurationMax.value.min * 60 + this.travelDurationMax.value.sec
    );
    this.updatedVehicle.travelDurationLimit.costPerSquareHourAfterQuadraticSoftMax =
      this.travelDurationQuadraticCostAfterSoftMax.value;
    this.updatedVehicle.travelDurationLimit.quadraticSoftMaxDuration = secondsToDuration(
      this.travelDurationQuadraticMaxDuration.value.min * 60 +
        this.travelDurationQuadraticMaxDuration.value.sec
    );
    this.updatedVehicle.travelDurationLimit.softMaxDuration = secondsToDuration(
      this.travelDurationSoftMax.value.min * 60 + this.travelDurationSoftMax.value.sec
    );
  }

  formGroupHasValue(fg: UntypedFormGroup): boolean {
    let result = false;
    const iterate = (obj): any => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          iterate(obj[key]);
        } else {
          if (obj[key]) {
            result = true;
          }
        }
      });
    };
    iterate(fg.value);
    return result;
  }

  formValuesToTimeThresholds(): TimeThreshold[] {
    return this.relaxationSettingsForm.value.map((threshold) => ({
      index: threshold.index,
      level: threshold.level,
      thresholdTime: createTimestamp(
        localDateTimeToUtcSeconds(threshold.date, threshold.time, this.timezoneOffset)
      ),
      thresholdVisits: threshold.numberOfVisits,
    }));
  }

  onSave(): void {
    this.formToUpdatedVehicle();
    this.save.emit({
      timeThresholds: this.formValuesToTimeThresholds(),
      vehicle: this.updatedVehicle,
      unsetFields: this.unsetFields,
    });
  }

  onOperatorTypesSelected(event: MatAutocompleteSelectedEvent): void {
    this.addOperatorType(event.option.value);
  }

  /** Gets a operator Types predicate function for find/filter */
  private getOperatorTypesPredicateFn(
    currentValues: string[],
    value: string
  ): (operatorType: string) => boolean {
    // Exclude options already part of the operator Types (control value)
    const isAvailable = ((operatorType: string) =>
      !(currentValues || []).includes(operatorType)).bind(this);
    if (value == null) {
      return isAvailable;
    }

    // If a filter value is provided, compose the isAvailable filter with a value filter
    const lowerValue = value.toLowerCase();
    return ((operatorType: string) =>
      isAvailable(operatorType) && operatorType.toLowerCase().includes(lowerValue)).bind(this);
  }

  onOperatorsTypeSelected(event: MatAutocompleteSelectedEvent): void {
    this.addOperatorType(event.option.value);
  }

  isUnset(field: string): boolean {
    return this.bulkEdit && this.unsetFields.includes(field);
  }

  isTravelCostsUnset(): boolean {
    return (
      this.bulkEdit &&
      (this.isUnset(this.formFields.TravelFixedCost) ||
        this.isUnset(this.formFields.TravelCostPerKm) ||
        this.isUnset(this.formFields.TravelCostPerHour) ||
        this.isUnset(this.formFields.TravelCostPerTravelledHour))
    );
  }

  isTravelSettingsUnset(): boolean {
    return (
      this.isUnset(this.formFields.TravelModeSetting) ||
      this.isUnset(this.formFields.TravelDurationSetting) ||
      this.isUnset(this.formFields.TravelUnloadingPolicy)
    );
  }

  onUnsetChange(result: { field: string }): void {
    const index = this.unsetFields.indexOf(result.field);
    if (index !== -1) {
      this.unsetFields.splice(index, 1);
    } else {
      this.unsetFields.push(result.field);
    }
  }
}
