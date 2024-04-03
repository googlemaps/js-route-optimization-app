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

import { Component, ChangeDetectionStrategy, ElementRef, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { MapService } from '../../services';
import { PdfMapService } from '../../services/pdf-map.service';
import * as fromRoot from 'src/app/reducers';
import { DomPortal } from '@angular/cdk/portal';
import { map, take } from 'rxjs/operators';
import * as fromConfig from '../../selectors/config.selectors';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-pdf-map',
  templateUrl: './pdf-map.component.html',
  styleUrls: ['./pdf-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MapService, useExisting: PdfMapService }],
})
export class PdfMapComponent implements OnInit {
  options$: Observable<google.maps.MapOptions>;

  constructor(
    private elementRef: ElementRef,
    private store: Store<fromRoot.State>,
    private pdfMapService: PdfMapService
  ) {
    this.pdfMapService.domPortal = new DomPortal(this.elementRef);
  }

  ngOnInit(): void {
    this.options$ = this.store.pipe(
      select(fromConfig.selectMapOptions),
      take(1),
      map((options) => {
        return {
          ...options,
          zoomControl: false,
          disableDefaultUI: true,
          gestureHandling: 'none',
          keyboardShortcuts: false,
        };
      })
    );
  }
}
