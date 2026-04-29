import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { FileService } from '../../services';
import { DistanceMatrixService } from '../../services/distance-matrix.service';
import { catchError, switchMap, take } from 'rxjs/operators';
import * as fromVisitRequests from '../../selectors/visit-request.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { combineLatest, of } from 'rxjs';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import RequestSettingsSelectors from '../../selectors/request-settings.selectors';
import { formattedDurationSeconds } from 'src/app/util';
import { selectScenarioName } from '../../selectors/dispatcher.selectors';

@Component({
  selector: 'app-download-distance-matrix-dialog',
  templateUrl: './download-distance-matrix-dialog.component.html',
  styleUrl: './download-distance-matrix-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadDistanceMatrixDialogComponent {
  isInProgress = false;
  errorMsg: string = '';
  timeToGenerateMsg: string = '';
  scenarioName: string = '';
  matrixData: string = '';

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fileService: FileService,
    private dialogRef: MatDialogRef<DownloadDistanceMatrixDialogComponent>,
    private service: DistanceMatrixService,
    private store: Store
  ) {
    this.store.pipe(select(selectScenarioName)).subscribe((name) => (this.scenarioName = name));
  }

  cancel(): void {
    this.dialogRef.close();
  }

  generate(): void {
    this.isInProgress = true;
    this.timeToGenerateMsg = '';
    this.errorMsg = '';
    this.changeDetector.markForCheck();

    const startTime = Date.now();

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
        ),
        catchError((error) => {
          this.errorMsg = `Placeholder - ${error}`;
          return of(true);
        })
      )
      .subscribe((res) => {
        const timeToRunSeconds = (Date.now() - startTime) / 1000;
        this.timeToGenerateMsg =
          Math.floor(timeToRunSeconds) > 0 ? formattedDurationSeconds(timeToRunSeconds) : '< 1s';
        this.isInProgress = false;

        if (!this.errorMsg) {
          this.matrixData = JSON.stringify(res, null, 2);
          this.downloadMatrix();
        }

        this.changeDetector.markForCheck();
      });
  }

  downloadMatrix(): void {
    const filename = `${
      this.scenarioName.length ? this.scenarioName : new Date().toISOString()
    }-distance-matrix`;
    this.fileService.download(`${filename}.json`, [this.matrixData], 'application/json');
  }
}
