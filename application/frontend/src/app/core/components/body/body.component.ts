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
      id: 'main-map',
      index: 1,
      collapsed: true,
    },
    {
      id: 'main-page',
      index: 0,
      collapsed: false,
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
      direction: 'vertical',
      sizes: [50, 50],
      minSize: 0,
      gutterStyle: () => {
        return {
          height: '15px',
        };
      },
      onDragEnd: (sizes) => {
        this.zone.run(() => this.splitSizesChange.emit(sizes));
      },
    });

    const gutter = document.querySelector('.gutter.gutter-vertical');
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
  get isScenarioPlanningPage(): boolean {
    return this.page === Page.ScenarioPlanning;
  }
  get isRoutesChartPage(): boolean {
    return this.page === Page.RoutesChart;
  }
  get isMetadata(): boolean {
    return this.page === Page.RoutesMetadata || this.page === Page.ShipmentsMetadata;
  }
  get isPreSolve(): boolean {
    return this.isShipmentsPage || this.isVehiclesPage || this.isScenarioPlanningPage;
  }
  get isPostSolve(): boolean {
    return this.isRoutesChartPage || this.isMetadata;
  }
}
