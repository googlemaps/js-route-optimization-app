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
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  LOCALE_ID,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as Long from 'long';
import {
  PointOfInterest,
  PointOfInterestCategory,
  PointOfInterestClick,
  ChangedVisits,
} from 'src/app/core/models';
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
export class PointsOfInterestComponent implements OnChanges {
  private static readonly imageAttributeLookup: {
    [key: number]: PointsOfInterestImageAttribute;
  } = pointsOfInterestImages;
  static readonly maxOffset = PointsOfInterestComponent.getMaxOffset();

  @ViewChild('poiSvg', { static: true }) poiSvg: ElementRef<SVGElement>;
  @Input() usableWidth = 0;
  @Input() maxOffset = 0;
  @Input() duration: [Long, Long];
  @Input() pointsOfInterest: PointOfInterest[];
  @Input() pendingNewPois: PointOfInterest[];
  @Input() pendingOldVisitIds: Set<number>;
  @Input() timezoneOffset: number;
  @Input() routeId: number;
  @Input() changedVisits: ChangedVisits;
  @Output() pointOfInterestClick = new EventEmitter<PointOfInterestClick>();

  get imageAttributeLookup(): { [key: string]: PointsOfInterestImageAttribute } {
    return PointsOfInterestComponent.imageAttributeLookup;
  }

  points: PoiPoint[] = [];
  pendingNewPoints: PoiPoint[] = [];
  clusters: Cluster[] = [];
  private normalPointsOfInterest: NormalPoi[] = [];
  private normalPendingNewPois: NormalPoi[] = [];
  private readonly overlapThreshold = 4; // Pixel threshold before considered overlapping

  private static getMaxOffset(): number {
    const lookup = PointsOfInterestComponent.imageAttributeLookup;
    return Math.max(0, ...Object.values(lookup).map((value) => value.width / 2));
  }

  constructor(@Inject(LOCALE_ID) private locale: string) {}

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
  }

  onMouseDown(event: MouseEvent, point: PoiPoint): void {
    if (event.button !== 0) {
      // Not the primary button
      return;
    }
    this.pointOfInterestClick.emit({
      category: point[1],
      visitId: point[0],
      relativeTo: event.target as Element,
    });
    event.preventDefault();
    event.stopPropagation();
  }

  isPendingOldPoi(point: PoiPoint): boolean {
    return !!this.pendingOldVisitIds?.has(point[0]);
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
