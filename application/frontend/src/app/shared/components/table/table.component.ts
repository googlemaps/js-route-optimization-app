/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CollectionViewer, ListRange } from '@angular/cdk/collections';
import { DataSource } from '@angular/cdk/table';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatColumnDef, MatTable } from '@angular/material/table';
import { asyncScheduler, BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TableComponent<T = any>
  implements OnChanges, AfterContentInit, OnDestroy, CollectionViewer
{
  @Input() mouseOverActive: boolean;
  @Input() dataSource: DataSource<T>;
  @Input() itemsSelected: { [id: number]: boolean } = {};
  @Input() columnsToDisplay: string[];
  @Input() totalSelectableItems = 0;
  @Input() itemSize = 49;
  @Input() selectDisabled = false;
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() mouseEnterRow = new EventEmitter<any>();
  @Output() mouseExitRow = new EventEmitter<any>();
  @Input() itemsDisabled: { [id: number]: boolean } = {};

  @ContentChildren(MatColumnDef) columnDefs: QueryList<MatColumnDef>;
  @ViewChild(MatTable, { static: true }) table: MatTable<T>;

  columns: string[] = [];
  totalSelected = 0;
  offset = 0;

  currentMouseOverItem: any;

  private subscription: Subscription;
  private previousColumnDefs: MatColumnDef[] = [];
  private initialized = false;
  viewChange = new BehaviorSubject<ListRange>({ start: 0, end: Number.MAX_VALUE });

  @Input() canSelect: (item: T) => boolean = null;
  @Input() idSelector: (item: T) => number = (item: any) => item.id;
  @Input() selectedIdSelector: (item: T) => number = (item: any) => item.id;

  constructor(private changeDetector: ChangeDetectorRef, private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.itemsSelected) {
      this.totalSelected = Object.keys(changes.itemsSelected.currentValue || {}).length;
    }
    if (changes.columnsToDisplay) {
      if (this.initialized) {
        this.columns = this.getColumns(changes.columnsToDisplay.currentValue);
      }
    }
    if (changes.dataSource) {
      // Workaround for an issue where a shipment item's "first" property would change
      // as a result of a filter, but not be reflected in the row's view.
      this.subscription?.unsubscribe();
      this.subscription = (changes.dataSource.currentValue as DataSource<T>)
        ?.connect(this)
        .subscribe(() => this.changeDetector.markForCheck());
    }
  }

  ngAfterContentInit(): void {
    this.columnDefs.changes
      .pipe(
        startWith(this.columnDefs),
        tap(() => {
          // Remove column references before altering column defs
          this.initialized = false;
          this.columns = [];
        }),
        debounceTime(0, asyncScheduler)
      )
      .subscribe((queryList: QueryList<MatColumnDef>) => this.updateColumns(queryList.toArray()));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get hasSelection(): boolean {
    return this.totalSelected > 0;
  }

  get selectAllChecked(): boolean {
    return this.hasSelection && this.totalSelected === this.totalSelectableItems;
  }

  get selectAllIndeterminate(): boolean {
    return this.hasSelection && this.totalSelected < this.totalSelectableItems;
  }

  checkboxLabel(item?: T): string {
    if (item) {
      return `${!this.isSelected(item) ? 'Select' : 'Deselect'} #${this.selectedIdSelector(item)}`;
    }
    return `${!this.selectAllChecked ? 'Select' : 'Deselect'} all`;
  }

  isSelected(item: T): boolean {
    return this.itemsSelected[this.selectedIdSelector(item)];
  }

  isDisabled(item: T): boolean {
    return this.itemsDisabled[this.selectedIdSelector(item)];
  }

  isMouseOver(item: any): boolean {
    return item === this.currentMouseOverItem;
  }

  onSelectClick(change: MatCheckboxChange, item: T): void {
    this.zone.run(() => {
      this.selectedChange.emit({ id: this.selectedIdSelector(item), selected: change.checked });
    });
  }

  onSelectAllToggleClick(change: MatCheckboxChange): void {
    if (change.checked) {
      this.selectAll.emit();
    } else {
      this.deselectAll.emit();
    }
  }

  trackItemBy(index: number, item: T): number {
    return this.idSelector(item);
  }

  mouseEnter(item: any): void {
    this.currentMouseOverItem = item;
    this.mouseEnterRow.emit(item);
  }

  mouseExit(item: any): void {
    this.currentMouseOverItem = null;
    this.mouseExitRow.emit(item);
  }

  private getColumns(ids: string[]): string[] {
    const knownIds = new Set(
      (this.columnDefs?.toArray().map((c) => c.name) || []).concat(['select', '_filler'])
    );
    return ids?.filter((id) => knownIds.has(id)) || [];
  }

  private updateColumns(columnDefs: MatColumnDef[]): void {
    columnDefs
      .concat(this.previousColumnDefs)
      .forEach((columnDef) => this.table.removeColumnDef(columnDef));
    columnDefs.forEach((columnDef) => this.table.addColumnDef(columnDef));
    this.previousColumnDefs = columnDefs;
    this.columns = this.getColumns(this.columnsToDisplay);
    this.initialized = true;
    this.changeDetector.markForCheck();
  }
}
