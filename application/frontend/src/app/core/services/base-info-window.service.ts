/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
