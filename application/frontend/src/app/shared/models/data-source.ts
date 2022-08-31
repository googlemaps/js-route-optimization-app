/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DataSource as CdkDataSource } from '@angular/cdk/table';
import { Injectable } from '@angular/core';
import { asyncScheduler, combineLatest, Observable, timer } from 'rxjs';
import { map, shareReplay, startWith, switchMapTo } from 'rxjs/operators';

/**
 * @remarks
 * Based on: https://github.com/angular/components/issues/10122#issuecomment-626647861
 */
@Injectable()
export class DataSource<T = any> extends CdkDataSource<T> {
  private viewPort: CdkVirtualScrollViewport;

  // Expose dataStream to simulate CdkVirtualScrollRepeater.dataStream
  readonly dataStream: Observable<T[]>;

  constructor(dataStream: Observable<T[]>) {
    super();
    // Delay data stream to give the route/view some time to update
    this.dataStream = timer(100, asyncScheduler).pipe(
      shareReplay(1),
      switchMapTo(dataStream.pipe(shareReplay(1)))
    );
  }

  attach(viewPort: CdkVirtualScrollViewport): void {
    this.viewPort = viewPort;

    // Attach DataSource as CdkVirtualScrollRepeater so ViewPort can access dataStream
    this.viewPort.attach(this as any);
  }

  // Called by CDK Table
  connect(): Observable<T[]> {
    return this.viewPort == null ? this.dataStream : this.viewPortStream(this.dataStream);
  }

  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  disconnect(): void {}

  private viewPortStream(tableData: Observable<T[]>): Observable<T[]> {
    return combineLatest([
      tableData,
      this.viewPort.renderedRangeStream.pipe(startWith({ start: 0, end: 0 })),
    ]).pipe(map(([data, { start, end }]) => data.slice(start, end)));
  }
}
