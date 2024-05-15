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
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
} from '@angular/core';
import { TimeSet } from '../../models';

@Component({
  selector: 'app-post-solve-timeline-legend',
  templateUrl: './post-solve-timeline-legend.component.html',
  styleUrls: ['./post-solve-timeline-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostSolveTimelineLegendComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('legendContainer') legendContainer: ElementRef;
  @ViewChild('legendTimeline') legendTimeline: ElementRef;

  @Input() vehicleTimeAverages: TimeSet;

  formattedVehicleTimeAverages: TimeSet;
  timelineOffset = 4;

  timelineLengths = {
    break: [0, 0],
    idle: [0, 0],
    service: [0, 0],
    travel: [0, 0],
  };

  observer: ResizeObserver;

  constructor(private changeRef: ChangeDetectorRef) {}

  ngOnDestroy(): void {
    this.observer.disconnect();
  }

  ngAfterViewInit(): void {
    this.observer = new ResizeObserver((entries) => {
      if (entries.length) {
        this.calculateTimelineSections();
      }
    });
    this.observer.observe(this.legendContainer.nativeElement);

    this.calculateTimelineSections();
  }

  ngOnChanges(): void {
    if (this.vehicleTimeAverages) {
      this.formattedVehicleTimeAverages = {
        breakTime: this.vehicleTimeAverages.breakTime * 100,
        idleTime: this.vehicleTimeAverages.idleTime * 100,
        serviceTime: this.vehicleTimeAverages.serviceTime * 100,
        travelTime: this.vehicleTimeAverages.travelTime * 100,
      };

      if (this.invalidTimeAverages()) {
        this.vehicleTimeAverages = {
          breakTime: 0.25,
          idleTime: 0.25,
          serviceTime: 0.25,
          travelTime: 0.25,
        };
      }
    }

    this.calculateTimelineSections();
  }

  private calculateTimelineSections(): void {
    if (!this.legendTimeline || !this.vehicleTimeAverages) {
      return;
    }
    const timelineWidth = this.legendTimeline.nativeElement.getBoundingClientRect().width;
    const adjustedTimelineWidth = timelineWidth - this.timelineOffset;

    this.timelineLengths.service = [
      this.timelineOffset,
      this.vehicleTimeAverages.serviceTime * adjustedTimelineWidth,
    ];
    this.timelineLengths.travel = [
      this.timelineLengths.service[1],
      this.timelineLengths.service[1] + this.vehicleTimeAverages.travelTime * adjustedTimelineWidth,
    ];
    this.timelineLengths.idle = [
      this.timelineLengths.travel[1],
      this.timelineLengths.travel[1] + this.vehicleTimeAverages.idleTime * adjustedTimelineWidth,
    ];
    this.timelineLengths.break = [
      this.timelineLengths.idle[1],
      this.timelineLengths.idle[1] + this.vehicleTimeAverages.breakTime * adjustedTimelineWidth,
    ];

    this.changeRef.detectChanges();
  }

  invalidTimeAverages(): boolean {
    return (
      Number.isNaN(this.vehicleTimeAverages.breakTime) &&
      Number.isNaN(this.vehicleTimeAverages.idleTime) &&
      Number.isNaN(this.vehicleTimeAverages.serviceTime) &&
      Number.isNaN(this.vehicleTimeAverages.travelTime)
    );
  }
}
