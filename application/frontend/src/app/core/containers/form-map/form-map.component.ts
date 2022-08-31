/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DomPortal } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, ElementRef, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { asyncScheduler, Observable } from 'rxjs';
import { delay, map, take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import * as fromConfig from '../../selectors/config.selectors';
import { MapService } from '../../services';
import { FormMapService } from '../../services/form-map.service';

@Component({
  selector: 'app-form-map',
  templateUrl: './form-map.component.html',
  styleUrls: ['./form-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: MapService, useExisting: FormMapService }],
})
export class FormMapComponent implements OnInit {
  readonly zoomToHomeDisabled$: Observable<boolean>;

  options$: Observable<google.maps.MapOptions>;

  constructor(
    private elementRef: ElementRef,
    private store: Store<fromRoot.State>,
    private formMapService: FormMapService
  ) {
    this.formMapService.domPortal = new DomPortal(this.elementRef);
    this.zoomToHomeDisabled$ = this.formMapService.bounds$.pipe(
      delay(0, asyncScheduler),
      map((bounds) => bounds == null || bounds.isEmpty())
    );
  }

  ngOnInit(): void {
    this.options$ = this.store.pipe(select(fromConfig.selectMapOptions), take(1));
  }

  onTypeChange(satellite: boolean): void {
    this.formMapService.map.setMapTypeId(satellite ? 'satellite' : 'roadmap');
  }

  onZoomToHome(): void {
    this.formMapService.zoomToHome();
  }
}
