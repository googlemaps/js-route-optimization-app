/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { DialogPosition, MatDialog } from '@angular/material/dialog';
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
