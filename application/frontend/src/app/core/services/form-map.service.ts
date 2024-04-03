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

import { DomPortal } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { onMapReady } from 'src/app/util';
import { MapService } from './map.service';

@Injectable({ providedIn: 'root' })
export class FormMapService extends MapService {
  domPortal: DomPortal<any>;

  updateBounds(bounds: google.maps.LatLngBounds, callback?: () => void): void {
    onMapReady(
      this.map,
      () => {
        this.setBounds(bounds);
        callback?.apply(null);
      },
      250
    );
  }
}
