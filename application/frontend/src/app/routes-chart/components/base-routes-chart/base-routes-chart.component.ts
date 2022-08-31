/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { BehaviorSubject, merge, Subscription, timer } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { ShipmentRoute } from 'src/app/core/models';
import { ChartColumnLabelFormatter, UnitStep } from 'src/app/shared/models';

@Component({
  selector: 'app-base-routes-chart',
  templateUrl: './base-routes-chart.component.html',
  styleUrls: ['./base-routes-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseRoutesChartComponent implements OnChanges, OnInit, OnDestroy {
  @Input() range = 0;
  @Input() duration: [Long, Long] = null;
  @Input() unitStep: UnitStep;
  @Input() columnLabelFormatter: ChartColumnLabelFormatter;
  @Input() routes: ShipmentRoute[] = [];
  @Input() nextRangeOffset: number;
  @Input() previousRangeOffset: number;
  @Input() timezoneOffset: number;
  @Output() selectPreviousRangeOffset = new EventEmitter<number>();
  @Output() selectNextRangeOffset = new EventEmitter<number>();

  marker: number;

  private readonly range$ = new BehaviorSubject<number>(this.range);
  private readonly duration$ = new BehaviorSubject<[Long, Long]>(this.duration);
  private readonly subscriptions: Subscription[] = [];

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.duration) {
      this.duration$.next(changes.duration.currentValue);
    }
    if (changes.range) {
      this.range$.next(changes.range.currentValue);
    }
  }

  ngOnInit(): void {
    const next = new Date();
    next.setUTCMinutes(next.getUTCMinutes() + 1, 0, 0);
    const firstRefresh = next.getTime() - Date.now();
    this.subscriptions.push(
      merge(this.duration$, this.range$, timer(firstRefresh, 60 * 1000))
        .pipe(auditTime(25))
        .subscribe(() => {
          this.updateMarker();
          this.changeDetector.markForCheck();
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.splice(0).forEach((subscription) => subscription.unsubscribe());
  }

  trackRouteBy(index: number, route: ShipmentRoute): number {
    return route.id;
  }

  private updateMarker(): void {
    if (!this.duration || !this.range) {
      this.marker = null;
      return;
    }
    const now = Math.floor(Date.now() / 1000);
    if (this.duration[0].greaterThan(now) || this.duration[1].lessThan(now)) {
      this.marker = null;
      return;
    }
    this.marker = now - this.duration[0].toNumber();
  }
}
