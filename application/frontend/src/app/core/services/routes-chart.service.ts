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

import { CdkVirtualScrollViewport, ExtendedScrollToOptions } from '@angular/cdk/scrolling';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RoutesChartService {
  private _scrollContainer: CdkVirtualScrollViewport;
  set scrollContainer(value: CdkVirtualScrollViewport) {
    this._scrollContainer = value;
  }

  public scrollDimensions = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  public scrollTo(to: ExtendedScrollToOptions): void {
    this._scrollContainer.scrollTo(to);
  }

  public measureScrollOffset(from: 'top' | 'left' | 'right' | 'bottom' | 'start' | 'end'): number {
    return this._scrollContainer?.measureScrollOffset(from);
  }
}
