import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { FileService } from '../../services';
import { DistanceMatrixService } from '../../services/distance-matrix.service';
import { switchMap, take } from 'rxjs/operators';
import * as fromVisitRequests from '../../selectors/visit-request.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { combineLatest } from 'rxjs';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import RequestSettingsSelectors from '../../selectors/request-settings.selectors';

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
      this.store.pipe(select(fromVehicle.selectAll)),
      this.store.pipe(select(fromVisitRequests.selectAll)),
      this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration)),
      this.store.pipe(select(RequestSettingsSelectors.selectTraffic)),
    ])
      .pipe(
        take(1),
        switchMap(([vehicles, visitRequests, globalDuration, considerTraffic]) =>
          this.service.generateDistanceMatrices(
            vehicles,
            visitRequests,
            globalDuration[0],
            considerTraffic
          )
        )
      )
      .subscribe((res) => {
        console.log(res);
        this.isInProgress = false;
        this.changeDetector.markForCheck();
      });
  }
}
