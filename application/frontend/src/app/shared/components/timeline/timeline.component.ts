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
  ElementRef,
  Inject,
  Input,
  LOCALE_ID,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import Long from 'long';
import { Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PointOfInterest, Timeline, TimelineCategory } from 'src/app/core/models';
import { defaultTimeFormat, formatSecondsDate, timeToPixel } from 'src/app/util';
import { TimelineLineAttribute } from '../../models';
import { PointsOfInterestComponent } from '../points-of-interest/points-of-interest.component';
import { TimeLabelComponent } from '../time-label/time-label.component';

/** Represents a timeline segment normalized between 0 and 1 relative to the overall duration */
type NormalSegment = [TimelineCategory, number, number, string];

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimelineComponent implements OnChanges, OnInit, OnDestroy {
  /**
   * The offset is used to avoid overlap due to stroke spill.
   * offsets should be stroke-width / 2.
   */
  private static readonly lineAttributeLookup: { [key: number]: TimelineLineAttribute } = {
    [TimelineCategory.Service]: { class: 'service', offset: 3.5, zIndex: 3, title: 'Service' },
    [TimelineCategory.Driving]: { class: 'driving', offset: 2, zIndex: 1, title: 'Driving' },
    [TimelineCategory.IdleTime]: { class: 'idle-time', offset: 0, zIndex: 0, title: 'Idle time' },
    [TimelineCategory.BreakTime]: {
      class: 'break-time',
      offset: 0,
      zIndex: 2,
      title: 'Break time',
    },
  };
  private static readonly maxOffset = TimelineComponent.getMaxOffset();

  @Input() duration: [Long, Long];
  @Input() availability: [Long, Long];
  @Input() scrubTime?: Long;
  @Input() scrubMask?: boolean;
  @Input() timeline: Timeline;
  @Input() axis: boolean;
  @Input() timeLabel: boolean;
  @Input() empty = true;
  @Input() emptyMessage?: string;
  @Input() pointsOfInterest: PointOfInterest[];
  @Input() offset?: number;
  @Input() timezoneOffset = 0;
  @Input() color = '#1a73e8';

  get lineAttributeLookup(): { [key: number]: TimelineLineAttribute } {
    return TimelineComponent.lineAttributeLookup;
  }

  usableWidth = 0;
  maxOffset = 0;
  offsetAffordance = 0;
  segments: NormalSegment[] = [];
  segmentsBound: [number, number] = [0, 0];
  availabilityRange: [number, number] = null;
  scrubTimePoint?: number;
  readonly scrubTimeWidth = 3;
  private hostWidth: number;
  private normalScrubTime?: number;
  private normalTimeline: NormalSegment[] = [];
  private normalTimelineBound: [number, number] = [0, 0];
  private normalAvailabilityRange: [number, number] = null;
  private resizeObserver: ResizeObserver;
  private readonly update$ = new Subject<void>();
  private readonly updateScrubTime$ = new Subject<void>();
  private readonly updateAvailabilityRange$ = new Subject<void>();
  private readonly scrubTimeOffset = this.scrubTimeWidth / 2;
  private readonly subscriptions: Subscription[] = [];

  constructor(
    @Inject(LOCALE_ID) private locale: string,
    private elementRef: ElementRef<HTMLElement>,
    changeDetector: ChangeDetectorRef,
    zone: NgZone
  ) {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (entries.length) {
        this.updateHostWidth(entries[0].contentRect.width, () =>
          zone.run(() => this.update$.next())
        );
      }
    });
    this.resizeObserver.observe(elementRef.nativeElement);
    this.subscriptions.push(
      this.update$.pipe(filter(() => this.usableWidth > 0)).subscribe(() => {
        this.updateAvailabilityRange();
        this.updateScrubTimePoint();
        this.updateTimeline();
        changeDetector.markForCheck();
      })
    );
    this.subscriptions.push(
      this.updateAvailabilityRange$.pipe(filter(() => this.usableWidth > 0)).subscribe(() => {
        this.updateAvailabilityRange();
        changeDetector.markForCheck();
      })
    );
    this.subscriptions.push(
      this.updateScrubTime$.pipe(filter(() => this.usableWidth > 0)).subscribe(() => {
        this.updateScrubTimePoint();
        changeDetector.markForCheck();
      })
    );
  }

  private static getMaxOffset(): number {
    const lookup = TimelineComponent.lineAttributeLookup;
    return Math.max(0, ...Object.values(lookup).map((value) => value.offset));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.pointsOfInterest || changes.offset) {
      this.updateUsableWidth();
    }
    if (changes.duration || changes.pointsOfInterest || changes.timeline) {
      this.updateNormalAvailabilityRange();
      this.updateNormalScrubTime();
      this.updateNormalTimeline();
      this.update$.next();
      return;
    }
    if (changes.availability) {
      this.updateNormalAvailabilityRange();
      this.updateAvailabilityRange$.next();
    }
    if (changes.scrubTime) {
      this.updateNormalScrubTime();
      this.updateScrubTime$.next();
    }
  }

  ngOnInit(): void {
    this.updateHostWidth(this.elementRef.nativeElement.clientWidth, () => {
      this.updateAvailabilityRange();
      this.updateScrubTimePoint();
      this.updateTimeline();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
    this.subscriptions.splice(0).forEach((subscription) => subscription.unsubscribe());
  }

  private updateHostWidth(width: number, callbackIfUpdated: () => void): void {
    if (this.hostWidth !== width) {
      this.hostWidth = width;
      this.updateUsableWidth();
      callbackIfUpdated();
    }
  }

  private updateAvailabilityRange(): void {
    if (!this.normalAvailabilityRange) {
      this.availabilityRange = null;
      return;
    }
    this.availabilityRange = this.normalAvailabilityRange.map(
      (s) => this.maxOffset + Math.round(this.usableWidth * s)
    ) as [number, number];
  }

  private updateNormalAvailabilityRange(): void {
    if (!this.duration || !this.availability) {
      this.normalAvailabilityRange = null;
      return;
    }
    const startTime = this.duration[0];
    const durationSeconds = this.duration[1].subtract(startTime);
    this.normalAvailabilityRange = [
      timeToPixel(this.availability[0], startTime, durationSeconds),
      timeToPixel(this.availability[1], startTime, durationSeconds),
    ];
  }

  private updateNormalScrubTime(): void {
    if (!this.duration || this.scrubTime == null) {
      this.normalScrubTime = null;
      return;
    }

    const startTime = this.duration[0];
    const durationSeconds = this.duration[1].subtract(startTime);
    this.normalScrubTime = timeToPixel(this.scrubTime, startTime, durationSeconds);
  }

  /** Build timeline normal to duration, adding idle segments */
  private updateNormalTimeline(): void {
    if (!this.duration || !this.timeline || !this.timeline.length) {
      this.normalTimelineBound = [0, 0];
      this.normalTimeline = [];
      return;
    }

    // Fill gaps with idle segments; assumes timeline is sorted and non-overlapping
    const timeline = this.timeline.slice();
    for (let i = timeline.length - 1; i >= 1; i--) {
      const prev = timeline[i - 1];
      const next = timeline[i];
      if (next.startTime.subtract(prev.endTime).greaterThan(1)) {
        timeline.splice(i, 0, {
          category: TimelineCategory.IdleTime,
          startTime: prev.endTime,
          endTime: next.startTime,
        });
      }
    }

    const startTime = this.duration[0];
    const durationSeconds = this.duration[1].subtract(startTime);

    const normalized = timeline
      .map((segment) => {
        const start = segment.startTime;
        const end = segment.endTime;
        return [
          segment.category,
          timeToPixel(start, startTime, durationSeconds),
          timeToPixel(end, startTime, durationSeconds),
          this.getSegmentTitle(start, end),
        ] as NormalSegment;
      })
      .filter((tuple) => this.lineAttributeLookup[tuple[0]]);

    // Capture the bounds for masking the axis before draw order sort is applied
    this.normalTimelineBound =
      normalized.length > 0 ? [normalized[0][1], normalized[normalized.length - 1][2]] : [0, 0];

    // Explicitly ordered so larger strokes are applied last (i.e. to accommodate end-caps) as well as
    // to hide overlap (particularly prevalent when the user modifies visits)
    this.normalTimeline = normalized.sort(
      (a, b) => this.lineAttributeLookup[a[0]].zIndex - this.lineAttributeLookup[b[0]].zIndex
    );
  }

  getSegmentTitle(start: Long, end: Long): string {
    const formattedStart = formatSecondsDate(
      start.toNumber(),
      this.timezoneOffset,
      defaultTimeFormat,
      this.locale
    ).toLocaleLowerCase(this.locale);
    if (start.equals(end)) {
      return '(' + formattedStart + ')';
    }
    const formattedEnd = formatSecondsDate(
      end.toNumber(),
      this.timezoneOffset,
      defaultTimeFormat,
      this.locale
    ).toLocaleLowerCase(this.locale);
    return '(' + formattedStart + ' - ' + formattedEnd + ')';
  }

  private updateUsableWidth(): void {
    this.maxOffset =
      this.offset != null
        ? this.offset
        : Math.max(
            TimelineComponent.maxOffset,
            (this.pointsOfInterest && PointsOfInterestComponent.maxOffset) || 0,
            (this.pointsOfInterest && TimeLabelComponent.maxOffset) || 0
          );
    this.offsetAffordance = this.maxOffset * 2;
    this.usableWidth =
      (this.hostWidth || 0) < this.offsetAffordance ? 0 : this.hostWidth - this.offsetAffordance;
  }

  private updateScrubTimePoint(): void {
    if (this.normalScrubTime == null) {
      this.scrubTimePoint = null;
      return;
    }

    this.scrubTimePoint =
      this.maxOffset - this.scrubTimeOffset + Math.round(this.usableWidth * this.normalScrubTime);
  }

  /** Project normal timeline to pixel space */
  private updateTimeline(): void {
    const startAxis = this.maxOffset;
    this.segments = this.normalTimeline.map((segment) => {
      const category = segment[0];
      const startTime = segment[1];
      const endTime = segment[2];
      const label = segment[3];
      const instantaneous = startTime === endTime;
      const start = startAxis + Math.round(this.usableWidth * startTime);
      if (instantaneous) {
        return [category, start, start, label];
      }

      // Allow non-instantaneous segments on the extent to spill,
      // otherwise we apply any offset to avoid spill.
      const offset = this.lineAttributeLookup[category].offset;
      const end = startAxis + Math.round(this.usableWidth * endTime);
      const offsetStart = start + (startTime === 0 ? 0 : offset);
      const offsetEnd = end - (endTime === 1 ? 0 : offset);
      return [category, offsetStart, Math.max(offsetStart, offsetEnd), label];
    });
    this.segmentsBound = this.normalTimelineBound.map(
      (s) => startAxis + Math.round(this.usableWidth * s)
    ) as [number, number];
  }
}
