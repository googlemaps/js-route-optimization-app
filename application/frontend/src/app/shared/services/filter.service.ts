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

import { Injectable } from '@angular/core';
import { LegacyDialogPosition as DialogPosition, MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Observable, of } from 'rxjs';
import { positionTopLeftRelativeToTopRight } from 'src/app/util';
import { FilterComponent } from '../components';
import { ActiveFilter, FilterOption } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  constructor(private dialog: MatDialog) {}

  createFilter<T extends FilterOption>(
    filterOption: T,
    relativeTo?: HTMLElement,
    filter?: ActiveFilter,
    dialogPositionStrategy: (
      relativeTo?: HTMLElement
    ) => DialogPosition = positionTopLeftRelativeToTopRight
  ): Observable<ActiveFilter | void> {
    // If it doesn't have a form, the filter doesn't require params
    if (!filterOption.form) {
      return of({ id: filterOption.id, label: filterOption.label });
    }

    // Use the filter dialog to obtain params
    const position = dialogPositionStrategy?.apply(null, [relativeTo]);
    const dialogRef = this.dialog.open<FilterComponent, any, ActiveFilter>(FilterComponent, {
      backdropClass: 'filter-backdrop',
      panelClass: 'filter-dialog',
      position,
    });
    dialogRef.componentInstance.filterOption = filterOption;
    dialogRef.componentInstance.filter = filter;
    return dialogRef.afterClosed();
  }
}
