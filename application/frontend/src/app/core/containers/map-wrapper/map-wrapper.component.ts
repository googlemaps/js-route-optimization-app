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
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MapService } from '../../services';

@Component({
  selector: 'app-map-wrapper',
  templateUrl: './map-wrapper.component.html',
  styleUrls: ['./map-wrapper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapWrapperComponent implements OnInit, OnDestroy {
  @Input() options: google.maps.MapOptions;
  @Output() mapInitialize = new EventEmitter<google.maps.Map>();
  private readonly subscriptions: Subscription[] = [];
  private previousMapWidth: number;

  constructor(private el: ElementRef, private mapService: MapService) {}

  ngOnInit(): void {
    // Deep clone the options as the map may modify them
    const options: google.maps.MapOptions = JSON.parse(JSON.stringify(this.options || {}));
    this.subscriptions.push(
      this.mapService.initViewDefault(options).subscribe(),
      this.initializeMap(options).subscribe()
    );
  }

  private initializeMap(options: google.maps.MapOptions): Observable<google.maps.Map> {
    return this.mapService.initMap(this.el.nativeElement, options).pipe(
      tap((map) => {
        this.mapInitialize.emit(map);

        // Reset the map bounds when it is toggled on.
        // bounds_changed fires off whenever the viewable bounds of the map change, even from user interaction,
        // so need to check if the map was actually hidden and now isn't.
        this.mapService.map.addListener('bounds_changed', () => {
          if (this.previousMapWidth === 0 && this.el.nativeElement.offsetWidth !== 0) {
            this.mapService.zoomToHome();
          }
          this.previousMapWidth = this.el.nativeElement.offsetWidth;
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.splice(0).forEach((subscription) => subscription.unsubscribe());
  }
}
