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
