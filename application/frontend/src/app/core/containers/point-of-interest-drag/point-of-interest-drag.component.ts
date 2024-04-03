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
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Inject,
  LOCALE_ID,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { withLatestFrom } from 'rxjs/operators';
import { PointsOfInterestImageAttribute, pointsOfInterestImages } from 'src/app/shared/models';
import { endDrag } from '../../actions/points-of-interest.actions';
import {
  PointOfInterestCategory,
  PointOfInterestStartDrag,
  PointOfInterestTimelineOverlapBegin,
  Visit,
} from '../../models';
import {
  selectDragEnd,
  selectDragStart,
  selectDragVisitsToEdit,
  selectOverlapTimeline,
} from '../../selectors/point-of-interest.selectors';
import { RoutesChartService } from '../../services';
import { defaultTimeFormat, durationSeconds, formatSecondsDate } from 'src/app/util';
import { selectTimezoneOffset } from '../../selectors/config.selectors';

@Component({
  selector: 'app-point-of-interest-drag',
  templateUrl: './point-of-interest-drag.component.html',
  styleUrls: ['point-of-interest-drag.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointOfInterestDragComponent implements OnInit, AfterViewInit, OnDestroy {
  private static readonly imageAttributeLookup: { [key: number]: PointsOfInterestImageAttribute } =
    pointsOfInterestImages;
  get imageAttributeLookup(): { [key: string]: PointsOfInterestImageAttribute } {
    return PointOfInterestDragComponent.imageAttributeLookup;
  }

  dragBase: number[] = [];
  dragParams: PointOfInterestStartDrag;
  visits: Visit[] = [];
  isDragging: boolean;
  pairOffset: number;
  positions: [number, number][] = [
    [0, 0],
    [0, 0],
  ];
  scrollOffsets: [number, number] = [0, 0];
  subscriptions: Subscription[] = [];
  timelineOverlap: PointOfInterestTimelineOverlapBegin;

  currentDragTimes = [];
  timezoneOffset = 0;

  lastMouseMove: [number, number];

  private onMouseMoveFn = this.onMouseMove.bind(this) as ({ x, y }) => void;

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(DOCUMENT) private document: Document,
    private changeRef: ChangeDetectorRef,
    private elRef: ElementRef,
    private routeChartService: RoutesChartService,
    private store: Store,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.document.addEventListener('mousemove', this.onMouseMoveFn);
    });
  }

  ngAfterViewInit(): void {
    this.subscriptions.push(
      this.store
        .pipe(select(selectTimezoneOffset))
        .subscribe((offset) => (this.timezoneOffset = offset))
    );
    this.subscriptions.push(
      this.store
        .select(selectDragStart)
        .pipe(withLatestFrom(this.store.select(selectDragVisitsToEdit)))
        .subscribe(([start, visits]) => this.dragStart(start, visits))
    );
    this.subscriptions.push(this.store.select(selectDragEnd).subscribe(() => this.dragEnd()));
    this.subscriptions.push(
      this.store.select(selectOverlapTimeline).subscribe((event) => {
        this.timelineOverlap = event;
        if (this.isDragging && this.lastMouseMove) {
          this.updateMouseMovement(this.lastMouseMove[0], this.lastMouseMove[1]);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.document.removeEventListener('mousemove', this.onMouseMoveFn);
  }

  getDragIcon(index = 0): PointsOfInterestImageAttribute {
    if (!this.visits || !this.visits[index]) {
      return;
    }

    if (this.visits[index].isPickup) {
      return this.imageAttributeLookup[PointOfInterestCategory.Pickup];
    } else {
      return this.imageAttributeLookup[PointOfInterestCategory.Delivery];
    }
  }

  dragStart(event: PointOfInterestStartDrag, visits: Visit[]): void {
    if (!event) {
      return;
    }
    this.dragParams = event;
    this.visits = visits;

    if (this.visits.length > 1) {
      this.pairOffset = Math.abs(
        durationSeconds(this.visits[1].startTime)
          .subtract(durationSeconds(this.visits[0].startTime))
          .toNumber() / this.dragParams.secondsPerPixel
      );

      // If user is dragging second visit in the pair, swap the default ordering and placement of the markers
      if (this.visits[1].id === this.dragParams.visitId) {
        this.pairOffset *= -1;
        [this.visits[0], this.visits[1]] = [this.visits[1], this.visits[0]];
      }
    }

    const bound = this.elRef.nativeElement.getBoundingClientRect();
    this.isDragging = true;
    this.dragBase = [event.mousePosition[0] - bound.x, event.mousePosition[1] - bound.y];
    this.updateMarkerPosition(event.mousePosition[0], event.mousePosition[1]);
    this.changeRef.detectChanges();
  }

  dragEnd(): void {
    this.isDragging = false;
    this.positions = [
      [0, 0],
      [0, 0],
    ];
    this.changeRef.detectChanges();
  }

  onMouseMove(event: MouseEvent): void {
    this.lastMouseMove = [event.x, event.y];
    this.updateMouseMovement(event.x, event.y);
  }

  updateMouseMovement(x: number, y: number): void {
    if (this.isDragging) {
      if (this.timelineOverlap?.id) {
        y = this.timelineOverlap.y + this.getDragIcon().height / 2;
      }
      this.zone.run(() => {
        this.scrollOffsets = [
          this.routeChartService.measureScrollOffset('left'),
          this.routeChartService.measureScrollOffset('top'),
        ];
        this.updateMarkerPosition(x, y);
        this.changeRef.markForCheck();
      });
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (event.button === 0 && this.isDragging) {
      this.store.dispatch(
        endDrag({
          dragEnd: {
            mousePosition: [
              event.x + this.routeChartService.measureScrollOffset('left'),
              event.y + this.routeChartService.measureScrollOffset('top'),
            ],
          },
        })
      );
    }
  }

  updateMarkerPosition(x: number, y: number): void {
    this.positions[0][0] = this.dragBase[0] + (x - this.dragParams.mousePosition[0]);
    this.positions[0][1] = this.dragBase[1] + (y - this.dragParams.mousePosition[1]);
    this.positions[1][0] = this.positions[0][0] + this.pairOffset;
    this.positions[1][1] = this.positions[0][1];
    this.formatDragTimes();
  }

  formatDragTimes(): void {
    if (!this.visits.length) {
      return;
    }
    const currentDragSeconds =
      durationSeconds(this.visits[0].startTime).toNumber() +
      (this.positions[0][0] - this.dragBase[0] + this.scrollOffsets[0]) *
        this.dragParams.secondsPerPixel;

    this.currentDragTimes[0] = formatSecondsDate(
      currentDragSeconds,
      this.timezoneOffset,
      defaultTimeFormat,
      this.locale
    ).toLocaleLowerCase(this.locale);

    if (this.visits.length > 1) {
      this.currentDragTimes[1] = formatSecondsDate(
        currentDragSeconds + this.pairOffset * this.dragParams.secondsPerPixel,
        this.timezoneOffset,
        defaultTimeFormat,
        this.locale
      ).toLocaleLowerCase(this.locale);
    }
  }
}
