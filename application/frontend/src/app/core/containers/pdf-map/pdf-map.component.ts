/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
