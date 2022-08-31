/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
