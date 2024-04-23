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

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
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
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatExpansionPanel } from '@angular/material/expansion';
import { EMPTY, merge, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ILatLng, VisitCategory, VisitRequest } from 'src/app/core/models';
import { FormVisitRequestLayer } from 'src/app/core/services';
import {
  durationMinutesSeconds,
  joinLabel,
  localDateTimeToUtcSeconds,
  noDuplicateCapacitiesValidator,
  secondsToDuration,
  setControlDisabled,
  splitLabel,
  toDispatcherLatLng,
  toFiniteOrNull,
} from 'src/app/util';
import { TimeWindowComponent } from '../time-window/time-window.component';
import { overlapValidator } from '../time-window/validators';
import { LoadDemandsFormComponent } from '../load-demands-form/load-demands-form.component';
import { LoadDemandFormValue } from '../../models/load-demand';

@Component({
  selector: 'app-visit-request-form',
  templateUrl: './visit-request-form.component.html',
  styleUrls: ['./visit-request-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class VisitRequestFormComponent implements OnChanges, OnInit, OnDestroy {
  @Input() id = 0;
  @Input() disabled = false;
  @Input() startAt?: Date;
  @Input() appearance: string;
  @Input() timezoneOffset = 0;
  @Input() visitRequest?: VisitRequest;
  @Input() visitCategory?: VisitCategory;
  @Input() visitTagOptions?: string[];
  @Input() visitTypeOptions?: string[];
  @Input() bounds?: google.maps.LatLngBounds;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
  @Input() abbreviations: { [unit: string]: string };

  @Output() remove = new EventEmitter<void>();

  get VisitCategory(): typeof VisitCategory {
    return VisitCategory;
  }
  get arrivalLocation(): AbstractControl {
    return this.form.get('arrivalLocation');
  }
  get arrivalHeading(): AbstractControl {
    return this.form.get('arrivalHeading');
  }
  get arrivalSideOfRoad(): AbstractControl {
    return this.form.get('arrivalSideOfRoad');
  }
  get departureLocation(): AbstractControl {
    return this.form.get('departureLocation');
  }
  get departureHeading(): AbstractControl {
    return this.form.get('departureHeading');
  }
  get departureSideOfRoad(): AbstractControl {
    return this.form.get('departureSideOfRoad');
  }
  get cost(): AbstractControl {
    return this.form.get('cost');
  }
  get durationMinutes(): AbstractControl {
    return this.form.get('durationMinutes');
  }
  get durationSeconds(): AbstractControl {
    return this.form.get('durationSeconds');
  }
  get visitTags(): AbstractControl {
    return this.form.get('visitTags');
  }
  get visitTypes(): AbstractControl {
    return this.form.get('visitTypes');
  }
  get timeWindows(): UntypedFormArray {
    return this.form.get('timeWindows') as UntypedFormArray;
  }
  get invalid(): boolean {
    return this.form.invalid;
  }
  get isPickup(): boolean {
    return this.visitCategory !== VisitCategory.Delivery;
  }
  get hasMap(): boolean {
    return !!this.formVisitRequestLayer?.visible;
  }
  get setMapActive(): boolean {
    return this.setArrivalLocationSubscription != null;
  }
  get loadDemands(): UntypedFormArray {
    return this.form.get('loadDemands') as UntypedFormArray;
  }

  @ViewChild('timeWindowsPanel', { static: true }) timeWindowsExpansionPanel: MatExpansionPanel;
  @ViewChildren(TimeWindowComponent) timeWindowForms: QueryList<TimeWindowComponent>;

  readonly form: UntypedFormGroup;

  labels: string[] = [];
  labelCtrl = new UntypedFormControl();
  labelSeparatorKeysCodes: number[] = [ENTER, COMMA];

  private availableVisitTags: string[] = [];
  visitTagsCtrl = new UntypedFormControl();
  visitTagsSeparatorKeysCodes: number[] = [ENTER, COMMA];
  filteredAvailableVisitTags: Observable<string[]>;

  private availableVisitTypes: string[] = [];
  visitTypesCtrl = new UntypedFormControl();
  visitTypesSeparatorKeysCodes: number[] = [ENTER, COMMA];
  filteredAvailableVisitTypes: Observable<string[]>;

  private setArrivalLocationSubscription: Subscription;
  private setDepartureLocationSubscription: Subscription;
  private readonly subscriptions: Subscription[] = [];

  get timeWindowsStartAt(): Date {
    const { startDate, startTime } = this.timeWindows?.[0]?.value || {};
    const startSeconds = localDateTimeToUtcSeconds(startDate, startTime, this.timezoneOffset);
    return startSeconds != null ? new Date(startSeconds * 1000) : this.startAt;
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    @Optional() private formVisitRequestLayer: FormVisitRequestLayer,
    private fb: UntypedFormBuilder
  ) {
    this.form = fb.group({
      arrivalLocation: [null, [Validators.required]],
      arrivalHeading: [null],
      arrivalSideOfRoad: [null],
      departureLocation: [null],
      departureHeading: [null],
      departureSideOfRoad: [null],
      cost: [null],
      durationMinutes: [null],
      durationSeconds: [null],
      visitTags: [null],
      visitTypes: [null],
      timeWindows: fb.array([], (formArray: UntypedFormArray) => overlapValidator(formArray)),
      loadDemands: fb.array([], (formArray: UntypedFormArray) =>
        noDuplicateCapacitiesValidator(formArray)
      ),
    });
  }

  onLabelKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addLabel(input.value, input);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.disabled) {
      this.updateDisabledState();
    }
    if (changes.visitRequest) {
      this.reset();
      this.form.markAllAsTouched();
    }
    if (changes.visitTagOptions) {
      this.availableVisitTags = (changes.visitTagOptions.currentValue as string[]) || [];
      this.visitTagsCtrl.setValue(null);
    }
    if (changes.visitTypeOptions) {
      this.availableVisitTypes = (changes.visitTypeOptions.currentValue as string[]) || [];
      this.visitTypesCtrl.setValue(null);
    }
  }

  ngOnInit(): void {
    this.filteredAvailableVisitTags = this.visitTagsCtrl.valueChanges.pipe(
      startWith(null as string),
      map((value: string) => this.filterVisitTags(value))
    );

    this.filteredAvailableVisitTypes = this.visitTypesCtrl.valueChanges.pipe(
      startWith(null as string),
      map((value: string) => this.filterVisitTypes(value))
    );

    const positionChanges = this.formVisitRequestLayer
      ? merge(this.formVisitRequestLayer.dragEnd$, this.formVisitRequestLayer.edit$)
      : EMPTY;

    this.subscriptions.push(
      positionChanges.subscribe(({ id, pos }) => {
        if (
          this.visitRequest?.id === id ||
          (typeof id === 'string' &&
            id.startsWith(this.visitRequest?.id.toString()) &&
            id.endsWith('arrival'))
        ) {
          this.arrivalLocation.setValue(pos ? toDispatcherLatLng(pos) : null);
          this.arrivalLocation.markAsDirty();
          this.arrivalLocation.markAsTouched();
        }

        if (
          this.visitRequest?.id === id ||
          (typeof id === 'string' &&
            id.startsWith(this.visitRequest?.id.toString()) &&
            id.endsWith('departure'))
        ) {
          this.departureLocation.setValue(pos ? toDispatcherLatLng(pos) : null);
          this.departureLocation.markAsDirty();
          this.departureLocation.markAsTouched();
        }
      }),

      this.arrivalLocation.valueChanges.subscribe((pos?: ILatLng) => {
        this.formVisitRequestLayer?.move(this.visitRequest, 'arrival', pos);
        this.cancelSetArrivalLocation();
      }),

      this.departureLocation.valueChanges.subscribe((pos?: ILatLng) => {
        this.formVisitRequestLayer?.move(this.visitRequest, 'departure', pos);
        this.cancelSetDepartureLocation();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.splice(0).forEach((subscription) => subscription?.unsubscribe());
    this.cancelSetArrivalLocation();
  }

  clearControl(control: AbstractControl): void {
    control.setValue(null);
    control.markAsDirty();
    control.markAsTouched();
  }

  reset(): void {
    const visitRequest = this.visitRequest || ({} as VisitRequest);
    this.parseLabels();

    // Seed a single time window if none are specified
    const timeWindows = visitRequest.timeWindows?.length > 0 ? visitRequest.timeWindows : [{}];
    while (this.timeWindows.length > timeWindows.length) {
      this.timeWindows.removeAt(this.timeWindows.length - 1);
    }
    while (timeWindows.length > this.timeWindows.length) {
      this.timeWindows.push(TimeWindowComponent.createFormGroup(this.fb));
    }

    const loadDemands: Array<LoadDemandFormValue> = [];
    if (this.visitRequest.loadDemands) {
      Object.keys(this.visitRequest.loadDemands).forEach((key) => {
        return loadDemands.push({
          type: key,
          value: this.visitRequest.loadDemands[key],
        });
      });
    }

    this.resetDemands(loadDemands);

    this.form.reset({
      arrivalLocation: visitRequest.arrivalWaypoint?.location?.latLng,
      arrivalHeading: visitRequest.arrivalWaypoint?.location?.heading,
      arrivalSideOfRoad: visitRequest.arrivalWaypoint?.sideOfRoad,
      departureLocation: visitRequest.departureWaypoint?.location?.latLng,
      departureHeading: visitRequest.departureWaypoint?.location?.heading,
      departureSideOfRoad: visitRequest.departureWaypoint?.sideOfRoad,
      cost: toFiniteOrNull(visitRequest.cost),
      durationMinutes: durationMinutesSeconds(visitRequest.duration, null).minutes,
      durationSeconds: durationMinutesSeconds(visitRequest.duration, null).seconds,
      visitTags: visitRequest.tags || [],
      visitTypes: visitRequest.visitTypes || [],
      timeWindows: TimeWindowComponent.createFormValues(timeWindows, this.timezoneOffset),
      loadDemands: LoadDemandsFormComponent.createFormValues(loadDemands),
    });
    this.updateDisabledState();
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

  addTimeWindow(): void {
    const form = TimeWindowComponent.createFormGroup(this.fb);
    this.timeWindows.push(form);
    form.markAllAsTouched();
    if (this.timeWindows.length > 1) {
      this.timeWindowsExpansionPanel?.open();
    }
    this.changeDetector.detectChanges();
  }

  addDemand(): void {
    this.loadDemands.push(LoadDemandsFormComponent.createFormGroup(this.fb));
    this.loadDemands.markAllAsTouched();
    this.loadDemands.updateValueAndValidity();
    this.changeDetector.detectChanges();
  }

  resetDemands(loadDemands): void {
    this.loadDemands.clear();
    (loadDemands || []).forEach((_) => {
      this.loadDemands.push(LoadDemandsFormComponent.createFormGroup(this.fb));
    });
  }

  onVisitTagsKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addVisitTagInputToken(input.value, input);
    }
  }

  onVisitTagSelected(event: MatAutocompleteSelectedEvent): void {
    this.addVisitTag(event.option.value);
  }

  addVisitTagInputToken(rawValue: any, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();

    // Add our visit type
    if (value) {
      const visitTag = this.availableVisitTags.find(this.getVisitTagsPredicateFn(value));
      if (visitTag) {
        this.addVisitTag(visitTag);
      } else if (!((this.visitTags.value as string[]) || []).includes(value)) {
        this.addVisitTag(value);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  onVisitTypesKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      const input = event.target as HTMLInputElement;
      this.addVisitTypeInputToken(input.value, input);
    }
  }

  onVisitTypeSelected(event: MatAutocompleteSelectedEvent): void {
    this.addVisitType(event.option.value);
  }

  addVisitTypeInputToken(rawValue: any, input: HTMLInputElement): void {
    const value = (rawValue || '').trim();

    // Add our visit type
    if (value) {
      const visitType = this.availableVisitTypes.find(this.getVisitTypesPredicateFn(value));
      if (visitType) {
        this.addVisitType(visitType);
      } else if (!((this.visitTypes.value as string[]) || []).includes(value)) {
        this.addVisitType(value);
      }
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  setArrivalLocation(): void {
    this.cancelSetArrivalLocation();
    this.setArrivalLocationSubscription = this.formVisitRequestLayer
      .edit(this.visitRequest, 'arrival')
      .subscribe(() => (this.setArrivalLocationSubscription = null));
  }

  cancelSetArrivalLocation(): void {
    this.setArrivalLocationSubscription?.unsubscribe();
    this.setArrivalLocationSubscription = null;
  }

  setDepartureLocation(): void {
    this.cancelSetDepartureLocation();
    this.setDepartureLocationSubscription = this.formVisitRequestLayer
      .edit(this.visitRequest, 'departure')
      .subscribe(() => (this.setDepartureLocationSubscription = null));
  }

  cancelSetDepartureLocation(): void {
    this.setDepartureLocationSubscription?.unsubscribe();
    this.setDepartureLocationSubscription = null;
  }

  removeTimeWindow(index: number): void {
    this.timeWindows.removeAt(index);
    this.form.updateValueAndValidity();
    this.changeDetector.detectChanges();
    if (this.timeWindows.length < 2) {
      this.timeWindowsExpansionPanel?.close();
    }
  }

  removeVisitTag(visitTag: string): void {
    this.visitTags.setValue((this.visitTags.value as string[]).filter((vt) => vt !== visitTag));
    this.visitTagsCtrl.setValue(null);
  }

  removeVisitType(visitType: string): void {
    this.visitTypes.setValue((this.visitTypes.value as string[]).filter((vt) => vt !== visitType));
    this.visitTypesCtrl.setValue(null);
  }

  getVisitRequest(): VisitRequest {
    const source = this.visitRequest || ({} as VisitRequest);

    let arrivalWaypoint = undefined;
    if (this.arrivalLocation.value) {
      arrivalWaypoint = {
        location: {
          latLng: this.arrivalLocation.value,
          heading: this.arrivalHeading.value || undefined,
        },
        sideOfRoad: this.arrivalSideOfRoad.value || undefined,
      };
    }

    let departureWaypoint = undefined;
    if (this.departureLocation.value) {
      departureWaypoint = {
        location: {
          latLng: this.departureLocation.value,
          heading: this.departureHeading.value || undefined,
        },
        sideOfRoad: this.departureSideOfRoad.value || undefined,
      };
    }

    const visitRequest: VisitRequest = {
      ...source,
      label: joinLabel(this.labels),
      arrivalWaypoint,
      departureWaypoint,
      cost: this.cost.valid ? this.cost.value : null,
      duration:
        this.durationMinutes.valid && this.durationSeconds.valid
          ? secondsToDuration(this.durationMinutes.value * 60 + this.durationSeconds.value)
          : null,
      tags: this.visitTags.value || [],
      visitTypes: this.visitTypes.value || [],
      timeWindows: TimeWindowComponent.createTimeWindows(this.timeWindows, this.timezoneOffset),
      loadDemands: LoadDemandsFormComponent.readFormValues(this.loadDemands.value),
    };
    return visitRequest;
  }

  private addVisitTag(visitTag: string): void {
    this.visitTags.setValue(((this.visitTags.value as string[]) || []).concat(visitTag));
    this.visitTagsCtrl.setValue(null);
  }

  private filterVisitTags(value: string): string[] {
    return this.availableVisitTags.filter(this.getVisitTagsPredicateFn(value));
  }

  /** Gets a visit types predicate function for find/filter */
  private getVisitTagsPredicateFn(value: string): (visitTag: string) => boolean {
    // Exclude visit type options already part of the visit types
    const isAvailable = ((visitTag: string) =>
      !((this.visitTags.value as string[]) || []).includes(visitTag)).bind(this);
    if (value == null) {
      return isAvailable;
    }

    // If a filter value is provided, compose the isAvailable filter with a value filter
    const lowerValue = value.toLowerCase();
    return ((visitTag: string) =>
      isAvailable(visitTag) && visitTag.toLowerCase().includes(lowerValue)).bind(this);
  }

  private addVisitType(visitType: string): void {
    this.visitTypes.setValue(((this.visitTypes.value as string[]) || []).concat(visitType));
    this.visitTypesCtrl.setValue(null);
  }

  private filterVisitTypes(value: string): string[] {
    return this.availableVisitTypes.filter(this.getVisitTypesPredicateFn(value));
  }

  /** Gets a visit types predicate function for find/filter */
  private getVisitTypesPredicateFn(value: string): (visitType: string) => boolean {
    // Exclude visit type options already part of the visit types
    const isAvailable = ((visitType: string) =>
      !((this.visitTypes.value as string[]) || []).includes(visitType)).bind(this);
    if (value == null) {
      return isAvailable;
    }

    // If a filter value is provided, compose the isAvailable filter with a value filter
    const lowerValue = value.toLowerCase();
    return ((visitType: string) =>
      isAvailable(visitType) && visitType.toLowerCase().includes(lowerValue)).bind(this);
  }

  private parseLabels(): void {
    this.labels = splitLabel(this.visitRequest?.label) || [];
  }

  private updateDisabledState(): void {
    setControlDisabled(this.form, this.disabled);
    this.timeWindowForms?.toArray().forEach((form) => form.updateDisabledState());
  }
}
