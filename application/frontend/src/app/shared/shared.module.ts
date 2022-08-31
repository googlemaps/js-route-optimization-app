/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
