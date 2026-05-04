import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { FileService } from '../../services';
import {
  MatrixGenerationRequests,
  DistanceMatrixResult,
  DistanceMatrixService,
} from '../../services/distance-matrix.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, take } from 'rxjs/operators';
import * as fromVisitRequests from '../../selectors/visit-request.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { combineLatest, defer, of } from 'rxjs';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import RequestSettingsSelectors from '../../selectors/request-settings.selectors';
import { formattedDurationSeconds, getEntityName } from 'src/app/util';
import { selectScenarioName } from '../../selectors/dispatcher.selectors';
import { Shipment, Vehicle, VisitRequest } from '../../models';
import ShipmentSelectors from '../../selectors/shipment.selectors';

@Component({
  selector: 'app-download-distance-matrix-dialog',
  templateUrl: './download-distance-matrix-dialog.component.html',
  styleUrl: './download-distance-matrix-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadDistanceMatrixDialogComponent implements OnInit {
  isInProgress = false;

  errorMsg: string = '';
  timeToGenerateMsg: string = '';
  scenarioName: string = '';
  matrixData: string = '';

  vehicles: Vehicle[] = [];
  visitRequests: VisitRequest[] = [];
  shipments: Shipment[] = [];
  considerTraffic: boolean = false;

  matrixRequests!: MatrixGenerationRequests;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private fileService: FileService,
    private dialogRef: MatDialogRef<DownloadDistanceMatrixDialogComponent>,
    private service: DistanceMatrixService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.store.pipe(select(selectScenarioName)).subscribe((name) => {
      this.scenarioName = name;
      this.changeDetector.markForCheck();
    });

    this.store.pipe(select(fromVehicle.selectAll)).subscribe((vehicles) => {
      this.vehicles = vehicles;
      this.changeDetector.markForCheck();
    });

    combineLatest([
      this.store.pipe(select(fromVehicle.selectAll)),
      this.store.pipe(select(fromVisitRequests.selectAll)),
      this.store.pipe(select(ShipmentSelectors.selectAll)),
      this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration)),
      this.store.pipe(select(RequestSettingsSelectors.selectTraffic)),
    ])
      .pipe(take(1))
      .subscribe(([vehicles, visitRequests, shipments, globalDuration, considerTraffic]) => {
        this.vehicles = vehicles;
        this.visitRequests = visitRequests;
        this.shipments = shipments;
        this.considerTraffic = considerTraffic;

        this.matrixRequests = this.service.generateDistanceMatrixRequests(
          vehicles,
          visitRequests,
          globalDuration[0],
          considerTraffic
        );
        this.changeDetector.markForCheck();
      });
  }

  get invalidRequestReason(): string | null {
    if (!this.matrixRequests) {
      return null;
    }
    const noOrigins = this.matrixRequests.originEntities.length === 0;
    const noDestinations = this.matrixRequests.destinationEntityIds.length === 0;

    if (noOrigins && noDestinations) {
      return 'No valid origins or destinations. Ensure there is at least one visit request in the scenario.';
    }
    if (noOrigins) {
      return 'No valid origins. Ensure there is at least one vehicle or visit request in the scenario.';
    }
    if (noDestinations) {
      return 'No valid destinations. Ensure there is at least one visit request in the scenario.';
    }
    return null;
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

    defer(() => this.service.executeDistanceMatrixRequests(this.matrixRequests))
      .pipe(
        catchError((error) => {
          this.errorMsg = this.extractErrorMessage(error);
          return of([] as DistanceMatrixResult[]);
        })
      )
      .subscribe((res) => {
        const timeToRunSeconds = (Date.now() - startTime) / 1000;
        this.timeToGenerateMsg =
          Math.floor(timeToRunSeconds) > 0 ? formattedDurationSeconds(timeToRunSeconds) : '< 1s';
        this.isInProgress = false;

        if (!this.errorMsg) {
          this.matrixData = JSON.stringify(
            this.formatResponse(res as DistanceMatrixResult[]),
            null,
            2
          );
          this.downloadMatrix();
        }

        this.changeDetector.markForCheck();
      });
  }

  private formatResponse(results: DistanceMatrixResult[]): object[] {
    return results.map(({ originType, originEntityId, destinationEntityId, ...rest }) => {
      const originEntity =
        originType === 'vehicle'
          ? this.vehicles.find((v) => v.id === originEntityId)
          : this.visitRequests.find((vr) => vr.id === originEntityId);
      const destinationEntity = this.visitRequests.find((vr) => vr.id === destinationEntityId);
      return {
        ...rest,
        origin: getEntityName(
          originEntity as Vehicle | VisitRequest,
          originType === 'vehicle' ? 'Vehicle' : 'Visit Request'
        ),
        destination: getEntityName(destinationEntity as VisitRequest, 'Visit Request'),
      };
    });
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 400:
          return 'Invalid request.';
        case 401:
        case 403:
          return 'Authentication error. Please check your API key configuration.';
        case 429:
          return 'Rate limit exceeded. Please wait a moment and try again.';
      }
      if (error.status >= 500 && error.status < 600) {
        return 'Server error. Please try again later.';
      }
      return error.error?.error?.message || error.message || error.statusText || 'Unknown error.';
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unexpected error occurred.';
  }

  downloadMatrix(): void {
    const filename = `${
      this.scenarioName.length ? this.scenarioName : new Date().toISOString()
    }-distance-matrix`;
    this.fileService.download(`${filename}.json`, [this.matrixData], 'application/json');
  }
}
