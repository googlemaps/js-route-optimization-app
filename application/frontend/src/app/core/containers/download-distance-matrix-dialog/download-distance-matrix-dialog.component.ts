import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { FileService } from '../../services';
import { DistanceMatrixService } from '../../services/distance-matrix.service';
import { switchMap, take } from 'rxjs/operators';
import ShipmentSelectors from '../../selectors/shipment.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-download-distance-matrix-dialog',
  templateUrl: './download-distance-matrix-dialog.component.html',
  styleUrl: './download-distance-matrix-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadDistanceMatrixDialogComponent {
  isInProgress = false;

  generationProgress = 0;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fileService: FileService,
    private dialogRef: MatDialogRef<DownloadDistanceMatrixDialogComponent>,
    private service: DistanceMatrixService,
    private store: Store
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  generate(): void {
    this.isInProgress = true;
    this.changeDetector.markForCheck();

    combineLatest([
      this.store.pipe(select(ShipmentSelectors.selectAll)),
      this.store.pipe(select(fromVehicle.selectAll)),
    ])
      .pipe(
        take(1),
        switchMap(([shipments, vehicles]) =>
          this.service.generateDistanceMatrices(vehicles, shipments)
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.isInProgress = false;
        this.changeDetector.markForCheck();
      });
  }
}
