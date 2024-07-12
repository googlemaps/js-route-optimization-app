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
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import {
  PointOfInterest,
  ShipmentRoute,
  Timeline,
  Vehicle,
  PointOfInterestClick,
  ChangedVisits,
} from 'src/app/core/models';
import { formatLongTime } from 'src/app/util';
import { selectAllowExperimentalFeatures } from '../../../../app/core/selectors/config.selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-base-routes-row',
  templateUrl: './base-routes-row.component.html',
  styleUrls: ['./base-routes-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseRoutesRowComponent implements OnInit {
  @Input() route: ShipmentRoute;
  @Input() vehicle: Vehicle;
  @Input() shipmentCount: number;
  @HostBinding('class.selected') @Input() selected = false;
  @Input() timeline: Timeline;
  @Input() duration: [Long, Long];
  @Input() availability: [Long, Long];
  @Input() pointsOfInterest: PointOfInterest[];
  @Input() pendingNewPois: PointOfInterest[];
  @Input() pendingOldVisitIds: Set<number>;
  @Input() range: number;
  @Input() relaxationTimes: Long[];
  @Input() timezoneOffset: number;
  @Input() changedVisits: ChangedVisits;
  @Input() color = '#1a73e8';
  @Output() selectedChange = new EventEmitter<boolean>();
  @Output() editVehicle = new EventEmitter<number>();
  @Output() viewMetadata = new EventEmitter<number>();
  @Output() clickVisitIds = new EventEmitter<number[]>();
  @HostBinding('class') className = 'item item-container';
  allowExperimentalFeatures: boolean;

  maxNameLength = 10;

  constructor(private store: Store, private domSanitizer: DomSanitizer) {}
  /**
   * @remarks
   * Workaround to allow component recycling; otherwise, the checkbox stops
   * reflecting selected state.
   */

  ngOnInit(): void {
    this.store.select(selectAllowExperimentalFeatures).subscribe((allow) => {
      this.allowExperimentalFeatures = allow;
    });
  }

  getSelected(): any {
    return this.selected ? this.route : false;
  }

  getMarkerElementLeft(time: Long, el: HTMLElement): SafeStyle {
    if (!this.validTime(time)) {
      return null;
    }
    const markerPercent = (time.subtract(this.duration[0]).toNumber() / this.range) * 100;

    const left = 'calc(' + markerPercent + '% - ' + el.clientWidth / 2 + 'px)';
    return this.domSanitizer.bypassSecurityTrustStyle(left);
  }

  validTime(time: Long): boolean {
    return (
      this.duration &&
      this.range &&
      this.duration[0].lessThan(time) &&
      this.duration[1].greaterThan(time)
    );
  }

  getInjectedSolutionTimeLabel(time: Long): string {
    const timeLabel = formatLongTime(time, null, this.timezoneOffset);
    return `Injected Solution Relaxation at ${timeLabel}`;
  }
}
