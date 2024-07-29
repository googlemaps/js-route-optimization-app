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
  HostBinding,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import Long from 'long';
import { Observable, Subscription, interval } from 'rxjs';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { map } from 'rxjs/operators';
import { setActive, setTime } from '../../actions/travel-simulator.actions';
import TravelSimulatorSelectors from '../../selectors/travel-simulator.selectors';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { formatSecondsDate } from 'src/app/util/time-translation';
import { MapService } from '../../services';

@Component({
  selector: 'app-travel-simulator',
  templateUrl: './travel-simulator.component.html',
  styleUrls: ['./travel-simulator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TravelSimulatorComponent implements OnInit, OnDestroy {
  @HostBinding('class.app-map-panel') readonly mapPanel = true;

  readonly animationRateMs: number = 33;
  readonly animationStepSize: number = 2;

  get animating(): boolean {
    return this.animationTimer$?.closed === false;
  }

  active$: Observable<boolean>;
  animationTimer$: Subscription;
  animationSpeedMultiple = 1;
  end$: Subscription;
  end: number;
  time$: Subscription;
  time: number;

  formatSecondsDate = formatSecondsDate;

  constructor(
    private store: Store,
    private detectorRef: ChangeDetectorRef,
    private map: MapService
  ) {}

  ngOnInit(): void {
    this.end$ = this.store
      .select(ShipmentModelSelectors.selectGlobalEndTime)
      .pipe(map((value) => Long.fromValue(value).toNumber()))
      .subscribe((end) => {
        this.end = end;
        this.detectorRef.markForCheck();
      });

    this.time$ = this.store.select(TravelSimulatorSelectors.selectTime).subscribe((time) => {
      this.time = time;
      this.detectorRef.markForCheck();
    });

    this.active$ = this.store.pipe(select(TravelSimulatorSelectors.selectActive));
  }

  ngOnDestroy(): void {
    this.onEndAnimate();
    this.time$.unsubscribe();
    this.end$.unsubscribe();
  }

  onBeginAnimate(): void {
    this.animationTimer$ = interval(this.animationRateMs).subscribe((_value) => {
      const newTime = this.time + this.animationStepSize * this.animationSpeedMultiple;
      if (newTime >= this.end) {
        this.onEndAnimate();
        return;
      }
      this.store.dispatch(setTime({ time: newTime }));
    });
  }

  onEndAnimate(): void {
    this.animationTimer$?.unsubscribe();
    this.detectorRef.markForCheck();
  }

  onToggleActive(event: MatSlideToggleChange): void {
    this.store.dispatch(setActive({ active: event.checked }));

    if (event.checked) {
      this.map.zoomToHome();
    } else {
      this.onEndAnimate();
    }
  }
}
