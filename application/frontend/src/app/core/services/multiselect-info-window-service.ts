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
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { selectClickedObjects } from '../selectors/map.selectors';
import { BaseInfoWindowService } from './base-info-window.service';
import { MapService } from './map.service';
import { UIActions } from '../actions';
import { ILatLng, Vehicle } from '../models';
import { MultiselectInfoWindowComponent } from '../containers/multiselect-info-window/multiselect-info-window.component';

/** Manages lifecycle of vehicle info windows */
@Injectable({
  providedIn: 'root',
})
export class MultiselectInfoWindowService extends BaseInfoWindowService<MultiselectInfoWindowComponent> {
  constructor(
    injector: EnvironmentInjector,
    applicationRef: ApplicationRef,
    private mapService: MapService,
    private store: Store<State>
  ) {
    super(injector, applicationRef);

    this.store.pipe(select(selectClickedObjects)).subscribe((selection) => this.open(selection));
  }

  open(selection: { position: ILatLng | null; selections: Vehicle[] }): void {
    if (selection.position) {
      this.create(MultiselectInfoWindowComponent);
      this.infoWindow.setPosition({
        lat: selection.position.latitude,
        lng: selection.position.longitude,
      });
      this.infoWindow.open(this.mapService.map);
    } else {
      this.clear();
    }
  }

  onClose(): void {
    this.store.dispatch(UIActions.mapMarkerClicked({ position: null }));
    super.onClose();
  }
}
