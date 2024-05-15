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
