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
