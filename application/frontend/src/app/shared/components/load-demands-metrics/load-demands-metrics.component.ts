import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA,
  MatLegacyDialogRef as MatDialogRef,
} from '@angular/material/legacy-dialog';
import { ScenarioKpis } from 'src/app/core/models';

@Component({
  selector: 'app-load-demands-metrics',
  templateUrl: './load-demands-metrics.component.html',
  styleUrls: ['./load-demands-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadDemandsMetricsComponent {
  displayedColumns = ['type', 'demand', 'capacity'];
  kpiData: { type: string; demand: number; capacity: number }[] = [];

  constructor(
    private dialogRef: MatDialogRef<LoadDemandsMetricsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      kpis: ScenarioKpis;
    }
  ) {
    const allTypes: { [type: string]: { demand: number; capacity: number } } = {};
    data.kpis.shipmentKpis.demands.forEach((demand) => {
      allTypes[demand.type] = {
        demand: demand.selected,
        capacity: 0,
      };
    });

    data.kpis.vehicleKpis.capacities.forEach((capacity) => {
      if (!allTypes[capacity.type]) {
        allTypes[capacity.type] = {
          demand: 0,
          capacity: capacity.selected,
        };
        return;
      }
      allTypes[capacity.type].capacity = capacity.selected;
    });

    this.kpiData = Object.keys(allTypes).map((type) => ({
      type,
      demand: allTypes[type].demand,
      capacity: allTypes[type].capacity,
    }));
  }
}
