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
