/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DataSource } from 'src/app/shared/models';
import { getCapacityQuantityUnit, getUnitAbbreviation } from 'src/app/util';
import { RouteMetadata } from '../../models';
import { selectAllowExperimentalFeatures } from '../../../../app/core/selectors/config.selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-base-routes-metadata-table',
  templateUrl: './base-routes-metadata-table.component.html',
  styleUrls: ['./base-routes-metadata-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseRoutesMetadataTableComponent implements OnInit {
  @Input() changeDisabled = false;
  @Input() columnsToDisplay: string[];
  @Input() dataSource: DataSource<RouteMetadata>;
  @Input() selected: { [id: number]: boolean } = {};
  @Input() sort?: { active: string; direction: string };
  @Input() total = 0;
  @Input() unitAbbreviations: { [unit: string]: string };
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  allowExperimentalFeatures: boolean;

  objectKeys = Object.keys;

  constructor(private store: Store, private zone: NgZone) {}

  ngOnInit(): void {
    this.store.select(selectAllowExperimentalFeatures).subscribe((allow) => {
      this.allowExperimentalFeatures = allow;
    });
  }

  getCapacityUnit(type: string): string {
    const unit = getCapacityQuantityUnit(type);
    return unit ? getUnitAbbreviation(unit, this.unitAbbreviations) : type;
  }

  idSelector(item: RouteMetadata): number {
    return item.route.id;
  }

  selectedIdSelector(item: RouteMetadata): number {
    return item.route.id;
  }

  onSelectionChange(value?: { id: number; selected: boolean }): void {
    this.zone.run(() => this.selectedChange.emit(value));
  }

  onDeselectAll(): void {
    this.zone.run(() => this.deselectAll.emit());
  }

  onSelectAll(): void {
    this.zone.run(() => this.selectAll.emit());
  }

  onSortChange(value: { active: string; direction: string }): void {
    this.zone.run(() => this.sortChange.emit(value));
  }

  formattedTravelTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds - hours * 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
}
