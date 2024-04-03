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

import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Input,
  LOCALE_ID,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as Long from 'long';
import {
  PointOfInterest,
  PointOfInterestCategory,
  PointOfInterestClick,
  PointOfInterestStartDrag,
  PointOfInterestTimelineOverlapBegin,
  ChangedVisits,
} from 'src/app/core/models';
import { RoutesChartService } from 'src/app/core/services/routes-chart.service';
import { defaultTimeFormat, formatSecondsDate, timeToPixel } from 'src/app/util';
import { Cluster, PointsOfInterestImageAttribute, pointsOfInterestImages } from '../../models';

type NormalPoi = [number, PointOfInterestCategory, number, string];
type PoiPoint = [number, number, number, string];

/**
 * Displays the points of interest for a timeline
 *
 * @remarks Supplemental component to the timeline.
 */
@Component({
  selector: 'app-points-of-interest',
  templateUrl: './points-of-interest.component.html',
  styleUrls: ['./points-of-interest.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PointsOfInterestComponent implements OnChanges, OnInit, OnDestroy {
  private static readonly imageAttributeLookup: {
    [key: number]: PointsOfInterestImageAttribute;
  } = pointsOfInterestImages;
  static readonly maxOffset = PointsOfInterestComponent.getMaxOffset();

  @ViewChild('poiSvg', { static: true }) poiSvg: ElementRef<SVGElement>;
  @Input() currentDragVisitIds: number[];
  @Input() currentOverlapId: number;
  @HostBinding('class.dragging')
  @Input()
  isDragging: boolean;
  @Input() usableWidth = 0;
  @Input() maxOffset = 0;
  @Input() duration: [Long, Long];
  @Input() pointsOfInterest: PointOfInterest[];
  @Input() pendingNewPois: PointOfInterest[];
  @Input() pendingOldVisitIds: Set<number>;
  @Input() timezoneOffset: number;
  @Input() routeId: number;
  @Input() changedVisits: ChangedVisits;
  @Output() dragStart = new EventEmitter<PointOfInterestStartDrag>();
  @Output() timelineEnter = new EventEmitter<PointOfInterestTimelineOverlapBegin>();
  @Output() timelineLeave = new EventEmitter<number>();
  @Output() pointOfInterestClick = new EventEmitter<PointOfInterestClick>();
  @Output() mouseEnterVisit = new EventEmitter<number>();
  @Output() mouseExitVisit = new EventEmitter();

  get imageAttributeLookup(): { [key: string]: PointsOfInterestImageAttribute } {
    return PointsOfInterestComponent.imageAttributeLookup;
  }

  points: PoiPoint[] = [];
  pendingNewPoints: PoiPoint[] = [];
  clusters: Cluster[] = [];
  private normalPointsOfInterest: NormalPoi[] = [];
  private normalPendingNewPois: NormalPoi[] = [];
  private readonly overlapThreshold = 4; // Pixel threshold before considered overlapping

  private readonly dragThreshold = 4;
  private lastMousePosition: [number, number] = [0, 0];
  private mouseDown = false;
  private mouseDownIsDrag = false;
  private mouseDownPosition: [number, number];
  private mouseDownTarget: Element;
  private mouseDownPoi: PoiPoint;
  private mouseIsOverlapping = false;
  private onMouseMoveFn = this.onMouseMove.bind(this) as (event: MouseEvent) => void;

  private static getMaxOffset(): number {
    const lookup = PointsOfInterestComponent.imageAttributeLookup;
    return Math.max(0, ...Object.values(lookup).map((value) => value.width / 2));
  }

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    @Inject(DOCUMENT) private document: Document,
    private ref: ElementRef,
    private routeChartService: RoutesChartService,
    private zone: NgZone
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    const timeChange = (changes.duration || changes.timezoneOffset) != null;
    const pixelChange = (changes.maxOffset || changes.usableWidth) != null;

    let updatePoints = pixelChange;
    if (changes.pointsOfInterest || timeChange) {
      this.normalPointsOfInterest = this.getNormalPois(this.pointsOfInterest);
      updatePoints = true;
    }

    let updatePendingNewPoints = pixelChange;
    if (changes.pendingNewPois || timeChange) {
      this.normalPendingNewPois = this.getNormalPois(this.pendingNewPois);
      updatePendingNewPoints = true;
    }

    if (this.usableWidth > 0 && (updatePoints || updatePendingNewPoints)) {
      if (updatePoints) {
        this.points = this.getPoiPoints(this.normalPointsOfInterest);
      }
      if (updatePendingNewPoints) {
        this.pendingNewPoints = this.getPoiPoints(this.normalPendingNewPois);
      }
      this.updateClusterCounts();
    }

    // Ensure that timeline overlap is up to date when a new drag begins
    if (changes.isDragging?.currentValue && this.mouseIsOverlapping) {
      // mouseleave listener does not fire when an overlapping element is placed
      // ie when you drag a point and drop it, the dropping action blocks the mouseleave event
      // So have to double check the bounding rect to make sure mouseIsOverlapping resets correctly
      this.mouseIsOverlapping = this.mouseWithinBoundingBox();
      if (this.mouseIsOverlapping) {
        this.onTimelineEnter();
      }
    }
  }

  mouseWithinBoundingBox(): boolean {
    const bounds = this.poiSvg.nativeElement.getBoundingClientRect();
    return (
      this.lastMousePosition[0] >= bounds.left &&
      this.lastMousePosition[0] <= bounds.right &&
      this.lastMousePosition[1] >= bounds.top &&
      this.lastMousePosition[1] <= bounds.bottom
    );
  }

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      this.poiSvg.nativeElement.addEventListener('mouseenter', this.onTimelineEnter.bind(this));
      this.poiSvg.nativeElement.addEventListener('mouseleave', this.onTimelineLeave.bind(this));
      this.document.addEventListener('mousemove', this.onMouseMoveFn);
    });
  }

  ngOnDestroy(): void {
    this.document.removeEventListener('mousemove', this.onMouseMoveFn);
  }

  onMouseDown(event: MouseEvent, point: PoiPoint): void {
    if (event.buttons !== 1 || this.mouseDown) {
      // Not the primary button or already down
      return;
    }

    this.mouseDown = true;
    this.mouseDownIsDrag = false;
    this.mouseDownPosition = [event.x, event.y];
    this.mouseDownTarget = event.target as Element;
    this.mouseDownPoi = point;
    event.preventDefault();
    event.stopPropagation();
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (event.button !== 0 || !this.mouseDown) {
      // Not the primary button or not down
      return;
    }
    if (!this.mouseDownIsDrag) {
      // Trigger regular click event here
      this.pointOfInterestClick.emit({
        category: this.mouseDownPoi[1],
        visitId: this.mouseDownPoi[0],
        relativeTo: this.mouseDownTarget,
      });
      event.preventDefault();
    }
    this.mouseDown = false;
    this.mouseDownIsDrag = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.mouseDown && !this.mouseDownIsDrag) {
      const deltaX = event.x - this.mouseDownPosition[0];
      const deltaY = event.y - this.mouseDownPosition[1];
      const deltaTotal = Math.sqrt(deltaX ** 2 + deltaY ** 2);

      if (deltaTotal >= this.dragThreshold) {
        this.zone.run(() => {
          this.activateDrag();
        });
      }
    }

    this.lastMousePosition = [event.x, event.y];
  }

  onTimelineEnter(): void {
    this.mouseIsOverlapping = true;
    if (this.isDragging) {
      this.zone.run(() => {
        this.timelineEnter.emit({
          id: this.routeId,
          scrollOffsetY: this.routeChartService.measureScrollOffset('top'),
          y: this.ref.nativeElement.getBoundingClientRect().top,
        });
      });
    }
  }

  onTimelineLeave(): void {
    this.mouseIsOverlapping = false;
    if (this.isDragging) {
      this.zone.run(() => {
        this.timelineLeave.emit(this.routeId);
      });
    }
  }

  onMouseEnter(point: PointOfInterest): void {
    this.mouseEnterVisit.emit(point[0]);
  }

  onMouseLeave(): void {
    this.mouseExitVisit.emit();
  }

  activateDrag(): void {
    if (this.mouseDownPoi[1] === PointOfInterestCategory.Depot) {
      return;
    }

    this.dragStart.emit({
      mousePosition: [
        this.mouseDownPosition[0] + this.routeChartService.measureScrollOffset('left'),
        this.mouseDownPosition[1] + this.routeChartService.measureScrollOffset('top'),
      ],
      scrollOffset: [
        this.routeChartService.measureScrollOffset('left'),
        this.routeChartService.measureScrollOffset('top'),
      ],
      secondsPerPixel: this.duration[1].subtract(this.duration[0]).toNumber() / this.usableWidth,
      visitId: this.mouseDownPoi[0],
    });
    this.mouseDown = false;
    this.mouseDownIsDrag = true;
  }

  isPendingOldPoi(point: PoiPoint): boolean {
    return !!this.pendingOldVisitIds?.has(point[0]);
  }

  isDraggingPoint(point: PoiPoint): boolean {
    return this.isDragging && this.currentDragVisitIds.indexOf(point[0]) >= 0;
  }

  /** Project normal points of interest to pixel space */
  private getPoiPoints(normalPois: NormalPoi[]): PoiPoint[] {
    return normalPois.map((poi) => {
      return [poi[0], poi[1], this.maxOffset + Math.round(this.usableWidth * poi[2]), poi[3]];
    });
  }

  /** Get points of interest normal to duration */
  private getNormalPois(pois: PointOfInterest[]): NormalPoi[] {
    if (!this.duration || !pois?.length) {
      return [];
    }

    const startTime = this.duration[0];
    const durationSeconds = this.duration[1].subtract(startTime);
    const normalized = pois
      .map((poi) => {
        const title = formatSecondsDate(
          poi[2].toNumber(),
          this.timezoneOffset,
          defaultTimeFormat,
          this.locale
        ).toLocaleLowerCase(this.locale);
        return [
          poi[0],
          poi[1],
          timeToPixel(poi[2], startTime, durationSeconds),
          title,
        ] as NormalPoi;
      })
      .filter((tuple) => this.imageAttributeLookup[tuple[1]]);
    return normalized;
  }

  private updateClusterCounts(): Cluster[] {
    if (this.points.length < 2) {
      return [];
    }

    const clusters: Cluster[] = [];
    for (const poi of this.points) {
      const created = this.createCluster(poi);
      const existing = clusters.find(
        (c) => this.hasOverlap(created, c) && this.getOverlap(created, c) > this.overlapThreshold
      );
      if (existing == null) {
        clusters.push(created);
        continue;
      }

      // Merge into existing
      this.mergeCluster(existing, created);

      // Merge others into existing until none overlap
      while (true) {
        const index = clusters.findIndex(
          (c) =>
            c !== existing &&
            this.hasOverlap(existing, c) &&
            this.getOverlap(existing, c) > this.overlapThreshold
        );
        if (index < 0) {
          break;
        }
        this.mergeCluster(existing, clusters.splice(index, 1)[0]);
      }
    }
    this.clusters = clusters.filter((c) => c.count > 1);
  }

  private createCluster(poi: PoiPoint): { start: number; end: number; count: number } {
    const offset = this.imageAttributeLookup[poi[1]].width / 2;
    return { start: poi[2] - offset, end: poi[2] + offset, count: 1 };
  }

  private hasOverlap(a: Cluster, b: Cluster): boolean {
    return a.start < b.end && a.end > b.start;
  }

  private getOverlap(a: Cluster, b: Cluster): number {
    return Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));
  }

  private mergeCluster(dest: Cluster, other: Cluster): void {
    dest.start = Math.min(dest.start, other.start);
    dest.end = Math.max(dest.end, other.end);
    dest.count += other.count;
  }
}
