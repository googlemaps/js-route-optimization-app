import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LoadDemandKPI } from 'src/app/core/models';

@Component({
  selector: 'app-load-demands-metrics',
  templateUrl: './load-demands-metrics.component.html',
  styleUrls: ['./load-demands-metrics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadDemandsMetricsComponent {
  constructor(
    private dialogRef: MatDialogRef<LoadDemandsMetricsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      kpis: LoadDemandKPI[];
      isShipmentDemands: boolean;
    }
  ) {}
}
