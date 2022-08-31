/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import * as RoutesChartActions from 'src/app/core/actions/routes-chart.actions';
import { ShipmentRoute } from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import { selectIsDragging } from 'src/app/core/selectors/point-of-interest.selectors';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import { RoutesChartService } from 'src/app/core/services/routes-chart.service';
import { ChartColumnLabelFormatter, UnitStep } from 'src/app/shared/models';

@Component({
  selector: 'app-routes-chart',
  templateUrl: './routes-chart.component.html',
  styleUrls: ['./routes-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutesChartComponent implements OnInit, OnDestroy {
  readonly routes$: Observable<ShipmentRoute[]>;
  readonly nextRangeOffset$: Observable<number>;
  readonly previousRangeOffset$: Observable<number>;
  readonly unitStep$: Observable<UnitStep>;
  readonly columnLabelFormatter$: Observable<ChartColumnLabelFormatter>;
  readonly totalRoutes$: Observable<number>;
  readonly pageIndex$: Observable<number>;
  readonly pageSize$: Observable<number>;
  readonly range$: Observable<number>;
  readonly duration$: Observable<[Long, Long]>;
  readonly timezoneOffset$: Observable<number>;

  isDragging: boolean;
  // How many pixels towards the edge of the chart should the mouse be to activate scrolling while dragging
  scrollActivationMargin = { x: 40, y: 40 };
  scrollSpeed = 10;
  readonly subscriptions: Subscription[] = [];
  private onMouseMoveFn = this.onMouseMove.bind(this) as (event: MouseEvent) => void;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private service: RoutesChartService,
    private store: Store,
    private zone: NgZone
  ) {
    store.dispatch(RoutesChartActions.initialize());

    this.routes$ = store.pipe(select(RoutesChartSelectors.selectPagedRoutes));
    this.unitStep$ = store.pipe(select(RoutesChartSelectors.selectUnitStep));
    this.previousRangeOffset$ = store.pipe(select(RoutesChartSelectors.selectPreviousColumnOffset));
    this.nextRangeOffset$ = store.pipe(select(RoutesChartSelectors.selectNextColumnOffset));
    this.columnLabelFormatter$ = store.pipe(
      select(RoutesChartSelectors.selectColumnLabelFormatter)
    );
    this.totalRoutes$ = store.pipe(select(RoutesChartSelectors.selectTotalFilteredRoutes));
    this.pageIndex$ = store.pipe(select(RoutesChartSelectors.selectPageIndex));
    this.pageSize$ = store.pipe(select(RoutesChartSelectors.selectPageSize));
    this.range$ = store.pipe(select(RoutesChartSelectors.selectRange));
    this.duration$ = store.pipe(select(RoutesChartSelectors.selectDuration));
    this.timezoneOffset$ = store.pipe(select(fromConfig.selectTimezoneOffset));

    this.subscriptions.push(
      store.select(selectIsDragging).subscribe((dragging) => (this.isDragging = dragging))
    );
  }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.document.addEventListener('mousemove', this.onMouseMoveFn);
    });
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('mousemove', this.onMouseMoveFn);
    this.subscriptions.splice(0).forEach((sub) => sub.unsubscribe());
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) {
      return;
    }

    const scrollOffsetLeft = this.service.measureScrollOffset('left');
    const scrollOffsetTop = this.service.measureScrollOffset('top');

    let deltaLeft = 0;
    let deltaTop = 0;

    if (event.x >= this.service.scrollDimensions.right - this.scrollActivationMargin.x) {
      deltaLeft = this.scrollSpeed;
    } else if (event.x <= this.service.scrollDimensions.left + this.scrollActivationMargin.x) {
      deltaLeft = -this.scrollSpeed;
    }
    if (event.y >= this.service.scrollDimensions.bottom - this.scrollActivationMargin.y) {
      deltaTop = this.scrollSpeed;
    } else if (event.y <= this.service.scrollDimensions.top + this.scrollActivationMargin.y) {
      deltaTop = -this.scrollSpeed;
    }

    this.service.scrollTo({
      left: scrollOffsetLeft + deltaLeft,
      top: scrollOffsetTop + deltaTop,
    });
  }

  onPage(event: PageEvent): void {
    this.store.dispatch(
      RoutesChartActions.changePage({ pageIndex: event.pageIndex, pageSize: event.pageSize })
    );
  }

  onSelectNextRangeOffset(rangeOffset: number): void {
    this.store.dispatch(RoutesChartActions.nextRangeOffset({ rangeOffset }));
  }

  onSelectPreviousRangeOffset(rangeOffset: number): void {
    this.store.dispatch(RoutesChartActions.previousRangeOffset({ rangeOffset }));
  }
}
