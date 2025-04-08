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
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { LoadDemandKPI, ScenarioKpis } from '../../models';
import { selectScenarioKpis } from '../../selectors/pre-solve.selectors';
import { formattedDurationSeconds } from 'src/app/util';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { LoadDemandsMetricsComponent } from 'src/app/shared/components/load-demands-metrics/load-demands-metrics.component';

@Component({
  selector: 'app-scenario-kpis',
  templateUrl: './scenario-kpis.component.html',
  styleUrls: ['./scenario-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarioKpisComponent implements OnInit {
  kpis: ScenarioKpis;

  formattedDurationSeconds = formattedDurationSeconds;

  constructor(
    private store: Store,
    private detectorRef: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.store.pipe(select(selectScenarioKpis)).subscribe((kpis) => {
      kpis.shipmentKpis.demands.sort(this.sortLoadDemandsByType);
      kpis.vehicleKpis.capacities.sort(this.sortLoadDemandsByType);
      this.kpis = kpis;
      this.detectorRef.markForCheck();
    });
  }

  showAllKpis(): void {
    this.dialog.open(LoadDemandsMetricsComponent, {
      panelClass: 'metric-box-dialog',
      data: {
        kpis: this.kpis,
      },
    });
  }

  sortLoadDemandsByType(a: LoadDemandKPI, b: LoadDemandKPI): number {
    if (a.type < b.type) {
      return -1;
    } else if (a.type > b.type) {
      return 1;
    }
    return 0;
  }
}
