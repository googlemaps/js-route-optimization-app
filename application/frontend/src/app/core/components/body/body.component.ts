/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import Split from 'split.js';
import { Page } from '../../models';

@Component({
  selector: 'app-body',
  templateUrl: './body.component.html',
  styleUrls: ['./body.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BodyComponent implements OnChanges {
  @Input() page: Page;
  @Input() hasMap = false;
  @Input() loading = false;
  @Input() splitSizes: number[] = null;
  @Output() splitSizesChange = new EventEmitter<number[]>();

  private split: Split.Instance;
  private splitPanels = [
    {
      id: 'main-page',
      index: 0,
      collapsed: false,
    },
    {
      id: 'main-map',
      index: 1,
      collapsed: true,
    },
  ];

  constructor(private zone: NgZone) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasMap) {
      if (changes.hasMap.currentValue) {
        this.zone.runOutsideAngular(() => {
          if (!this.split) {
            this.createSplit();
          }
          this.split.setSizes(this.splitSizes || [50, 50]);
        });
      } else if (this.split) {
        this.split.destroy();
        this.split = null;
      }
    }
  }

  private createSplit(): void {
    this.split = Split([`#${this.splitPanels[0].id}`, `#${this.splitPanels[1].id}`], {
      direction: 'horizontal',
      sizes: [50, 50],
      minSize: 0,
      gutterStyle: () => {
        return {
          width: '15px',
        };
      },
      onDragEnd: (sizes) => {
        this.zone.run(() => this.splitSizesChange.emit(sizes));
      },
    });

    const gutter = document.querySelector('.gutter.gutter-horizontal');
    gutter.addEventListener('dblclick', () => {
      this.splitPanels.forEach((p) => {
        p.collapsed = !p.collapsed;
        if (p.collapsed) {
          this.split.collapse(p.index);
        }
      });
      this.splitSizesChange.emit(this.split.getSizes());
    });
  }

  get isWelcomePage(): boolean {
    return this.page === Page.Welcome;
  }
  get isShipmentsPage(): boolean {
    return this.page === Page.Shipments;
  }
  get isVehiclesPage(): boolean {
    return this.page === Page.Vehicles;
  }
  get isVehicleOperatorsPage(): boolean {
    return this.page === Page.VehicleOperators;
  }
  get isRoutesChartPage(): boolean {
    return this.page === Page.RoutesChart;
  }
  get isMetadata(): boolean {
    return this.page === Page.RoutesMetadata || this.page === Page.ShipmentsMetadata;
  }
  get isPreSolve(): boolean {
    return this.isShipmentsPage || this.isVehiclesPage || this.isVehicleOperatorsPage;
  }
  get isPostSolve(): boolean {
    return this.isRoutesChartPage || this.isMetadata;
  }
}
