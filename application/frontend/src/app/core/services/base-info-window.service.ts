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

import {
  ApplicationRef,
  Type,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';

/** Base class to manage info windows */
export abstract class BaseInfoWindowService<T> {
  protected infoWindow: google.maps.InfoWindow;
  protected componentRef: ComponentRef<T>;

  constructor(private injector: EnvironmentInjector, private applicationRef: ApplicationRef) {}

  protected create(component: Type<T>): void {
    this.clear();
    const componentRef = createComponent(component, { environmentInjector: this.injector });
    this.applicationRef.attachView(componentRef.hostView);
    const infoWindow = this.infoWindow || this.createInfoWindow();
    infoWindow.setContent(componentRef.location.nativeElement);
    this.componentRef = componentRef;
    this.infoWindow = infoWindow;
  }

  clear(): void {
    if (this.infoWindow) {
      this.infoWindow.close();
    }
    this.destroyComponent();
  }

  protected onClose(): void {
    this.destroyComponent();
  }

  private createInfoWindow(): google.maps.InfoWindow {
    const infoWindow = new google.maps.InfoWindow();
    infoWindow.addListener('closeclick', (_) => {
      this.onClose();
    });
    return infoWindow;
  }

  private destroyComponent(): void {
    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
