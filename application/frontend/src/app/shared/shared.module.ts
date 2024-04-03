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

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material';
import {
  CapacityQuantityComponent,
  LoadDemandsFormComponent,
  FilterBooleanFormComponent,
  FilterComponent,
  FilterDateFormComponent,
  FilterListComponent,
  ConfirmOverwriteDialogComponent,
  FilterMenuComponent,
  FilterNumberFormComponent,
  FilterSelectFormComponent,
  FilterStringFormComponent,
  GanttChartComponent,
  GanttChartControlBarComponent,
  GanttSettingsDialogComponent,
  InjectedRelaxationConstraintsFormComponent,
  LoadLimitsFormComponent,
  PlaceAutocompleteComponent,
  PointsOfInterestComponent,
  RangeSliderComponent,
  ShipmentFormComponent,
  TableComponent,
  TableControlBarComponent,
  TimeLabelComponent,
  TimelineComponent,
  TimeWindowComponent,
  TimezoneEditComponent,
  VisitFormComponent,
  VisitRequestFormComponent,
} from './components';
import {
  GanttColumnHeaderDirective,
  GanttColumnHeadersOverlayDirective,
  GanttRowColumnHeaderDirective,
  GanttRowDirective,
} from './directives';
import {
  CapacityQuantitiesHasValuePipe,
  CapacityQuantityLabelPipe,
  CapacityQuantityUnitPipe,
  DistanceLimitPipe,
  DurationLimitPipe,
  DurationValuePipe,
  EntityNamePipe,
  FormatDurationPipe,
  FormatHardTimeWindowPipe,
  FormatLatLngPipe,
  FormatSecondsDatePipe,
  FormatSoftTimeWindowPipe,
  FormatTimestampPipe,
  SoftTimeWindowsPipe,
  SplitLabelPipe,
  UnitAbbreviationPipe,
  VehicleImageSourcePipe,
} from './pipes';
import { DurationMinSecFormComponent } from './components/duration-min-sec-form/duration-min-sec-form.component';
import { ExtraVisitDurationFormComponent } from './components/extra-visit-duration-form/extra-visit-duration-form.component';
import { BreakRequestFormComponent } from './components/break-request-form/break-request-form.component';
import { FrequencyConstraintFormComponent } from './components/frequency-constraint-form/frequency-constraint-form.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BulkEditUnsetComponent } from './components/bulk-edit-unset/bulk-edit-unset.component';

export const INTERNAL_COMPONENTS = [TimeLabelComponent];

export const COMPONENTS = [
  BreakRequestFormComponent,
  ConfirmDialogComponent,
  CapacityQuantityComponent,
  ConfirmOverwriteDialogComponent,
  DurationMinSecFormComponent,
  ExtraVisitDurationFormComponent,
  FilterComponent,
  FilterBooleanFormComponent,
  FilterDateFormComponent,
  FilterListComponent,
  FilterMenuComponent,
  FilterNumberFormComponent,
  FilterSelectFormComponent,
  FilterStringFormComponent,
  FrequencyConstraintFormComponent,
  GanttChartComponent,
  GanttChartControlBarComponent,
  GanttSettingsDialogComponent,
  InjectedRelaxationConstraintsFormComponent,
  LoadDemandsFormComponent,
  LoadLimitsFormComponent,
  PlaceAutocompleteComponent,
  PointsOfInterestComponent,
  RangeSliderComponent,
  ShipmentFormComponent,
  TableComponent,
  TableControlBarComponent,
  TimelineComponent,
  TimeWindowComponent,
  BulkEditUnsetComponent,
  TimezoneEditComponent,
  VisitFormComponent,
  VisitRequestFormComponent,
];

export const DIRECTIVES = [
  GanttColumnHeaderDirective,
  GanttColumnHeadersOverlayDirective,
  GanttRowColumnHeaderDirective,
  GanttRowDirective,
];

export const PIPES = [
  CapacityQuantitiesHasValuePipe,
  CapacityQuantityLabelPipe,
  CapacityQuantityUnitPipe,
  DistanceLimitPipe,
  DurationLimitPipe,
  DurationValuePipe,
  EntityNamePipe,
  FormatDurationPipe,
  FormatHardTimeWindowPipe,
  FormatLatLngPipe,
  FormatSecondsDatePipe,
  FormatSoftTimeWindowPipe,
  FormatTimestampPipe,
  SoftTimeWindowsPipe,
  SplitLabelPipe,
  UnitAbbreviationPipe,
  VehicleImageSourcePipe,
];

@NgModule({
  declarations: [COMPONENTS, DIRECTIVES, INTERNAL_COMPONENTS, PIPES, BulkEditUnsetComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, MatTooltipModule],
  exports: [COMPONENTS, DIRECTIVES, PIPES],
})
export class SharedModule {}
