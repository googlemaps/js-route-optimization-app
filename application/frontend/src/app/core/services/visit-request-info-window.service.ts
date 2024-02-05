/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ApplicationRef, EnvironmentInjector, Injectable, OnDestroy } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { State } from 'src/app/reducers';
import { mapVisitRequestClicked } from '../actions/ui.actions';
import { VisitRequestInfoWindowComponent } from '../containers/visit-request-info-window/visit-request-info-window.component';
import { selectInfoWindowVisitRequest } from '../selectors/map.selectors';
import { BaseInfoWindowService } from './base-info-window.service';
import { MapService } from './map.service';

/** Manages lifecycle of visit request info windows */
@Injectable({
  providedIn: 'root',
})
export class VisitRequestInfoWindowService
  extends BaseInfoWindowService<VisitRequestInfoWindowComponent>
  implements OnDestroy
{
  closeSubscription: Subscription;

  constructor(
    injector: EnvironmentInjector,
    applicationRef: ApplicationRef,
    private mapService: MapService,
    private store: Store<State>
  ) {
    super(injector, applicationRef);

    this.store
      .pipe(select(selectInfoWindowVisitRequest))
      .subscribe((visitRequest) => this.open(visitRequest));
  }

  ngOnDestroy(): void {
    this.closeSubscription?.unsubscribe();
  }

  open(visitRequest?: { id: number; position: google.maps.LatLng }): void {
    if (visitRequest) {
      this.create(VisitRequestInfoWindowComponent);
      this.componentRef.instance.visitRequestId = visitRequest.id;
      this.infoWindow.setPosition(visitRequest.position);
      this.infoWindow.open(this.mapService.map);
      this.closeSubscription = this.componentRef.instance.closeWindow.subscribe(() =>
        this.onClose()
      );
    } else {
      this.clear();
    }
  }

  onClose(): void {
    this.store.dispatch(mapVisitRequestClicked({ id: null }));
    super.onClose();
  }
}
