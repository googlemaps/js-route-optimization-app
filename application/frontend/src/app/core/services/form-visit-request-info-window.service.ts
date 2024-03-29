/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ApplicationRef, EnvironmentInjector, Injectable } from '@angular/core';
import { BaseVisitRequestInfoWindowComponent } from '../components/base-visit-request-info-window/base-visit-request-info-window.component';
import { Shipment, Vehicle, Visit, VisitRequest } from '../models';
import { BaseInfoWindowService } from './base-info-window.service';
import { FormMapService } from './form-map.service';

/** Manages lifecycle of form visit request info windows */
@Injectable({
  providedIn: 'root',
})
export class FormVisitRequestInfoWindowService extends BaseInfoWindowService<BaseVisitRequestInfoWindowComponent> {
  constructor(
    injector: EnvironmentInjector,
    applicationRef: ApplicationRef,
    private formMapService: FormMapService
  ) {
    super(injector, applicationRef);
  }

  open(
    shipment: Shipment,
    visitRequest: VisitRequest,
    pos: google.maps.LatLng,
    vehicle?: Vehicle,
    visit?: Visit
  ): void {
    if (shipment && visitRequest) {
      this.create(BaseVisitRequestInfoWindowComponent);
      this.componentRef.instance.shipment = shipment;
      this.componentRef.instance.visitRequest = visitRequest;
      this.componentRef.instance.vehicle = vehicle;
      this.componentRef.instance.visit = visit;
      this.infoWindow.setPosition(pos);
      this.infoWindow.open(this.formMapService.map);
    } else {
      this.clear();
    }
  }

  clear(): void {
    super.clear();
  }
}
