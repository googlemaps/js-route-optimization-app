/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { merge } from 'lodash';

import * as fromRoot from 'src/app/reducers';
import { MessagesConfig, Scenario, ScenarioSolutionPair, Solution } from '../../models';
import { UploadType } from '../../models/upload';
import { IWaypoint } from '../../models/dispatcher.model';
import * as fromConfig from '../../selectors/config.selectors';
import { DispatcherService, FileService, PlacesService, UploadService } from '../../services';
import { toDispatcherLatLng } from 'src/app/util';

@Component({
  selector: 'app-upload-dialog',
  templateUrl: './upload-dialog.component.html',
  styleUrls: ['./upload-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class UploadDialogComponent {
  @ViewChild('fileInput', { static: true }) fileInput: ElementRef<HTMLInputElement>;

  readonly form: UntypedFormGroup;
  readonly fileName: UntypedFormControl;
  fileInvalid: boolean;
  validatingUpload: boolean;
  private json: any;
  private _scenario: Scenario;
  private get scenario(): Scenario {
    return this._scenario || this.scenarioSolutionPair?.scenario;
  }
  private set scenario(value: Scenario) {
    this._scenario = value;
  }
  private scenarioSolutionPair: ScenarioSolutionPair;
  zipContentsInvalid: boolean;

  resolvingPlaceIds = false;
  placeIdProgress = 0;
  placeIdError: string;
  get placeIdCount(): number {
    return this.scenarioWaypointsWithPlaceIDs.length;
  }

  readonly messages$: Observable<MessagesConfig>;

  constructor(
    private store: Store<fromRoot.State>,
    private dialogRef: MatDialogRef<UploadDialogComponent>,
    private dispatcherService: DispatcherService,
    private fileService: FileService,
    private placesService: PlacesService,
    private uploadService: UploadService,
    fb: UntypedFormBuilder
  ) {
    this.form = fb.group({
      fileName: (this.fileName = fb.control('', [this.fileValidator.bind(this)])),
    });
    this.messages$ = this.store.pipe(select(fromConfig.selectMessagesConfig));
  }

  cancel(): void {
    this.dialogRef.close();
  }

  solve(): void {
    this.dialogRef.close({
      uploadType: this.scenarioSolutionPair ? UploadType.ScenarioSolutionPair : UploadType.Scenario,
      content: this.scenarioSolutionPair ? this.scenarioSolutionPair : this.scenario,
    });
  }

  selectFile(): void {
    if (!this.fileInput) {
      return;
    }

    this.fileInput.nativeElement.click();
    this.fileName.markAsTouched();
  }

  fileUploadClicked(e: MouseEvent): void {
    (e.target as HTMLInputElement).value = null;
  }

  async fileSelected(e: Event): Promise<void> {
    const target = e.target as HTMLInputElement;
    const file = target && target.files && target.files[0];
    if (!file) {
      return;
    }

    this.validatingUpload = true;

    // First check if the file is valid JSON
    let json: any = null;
    this.fileInvalid = false;
    try {
      const text = await this.fileService.readAsText(file);
      json = JSON.parse(text);
    } catch (error) {
      this.fileInvalid = true;
      json = null;
    }

    if (!this.fileInvalid && json) {
      // Set json and scenario value before fileName value for validation
      this.json = json;
      this.scenario = null;
      this.fileName.setValue(file.name);
      this.validatingUpload = false;
      return;
    }

    this.json = false;
    this.scenario = null;

    // If file is not valid JSON, check if it's a ZIP
    this.fileInvalid = false;
    this.zipContentsInvalid = false;
    let fileIsZip = false;

    try {
      await this.fileService.unzip(file);
      fileIsZip = true;
      const files = await this.fileService.getJSONFromZip(file);
      this.scenarioSolutionPair = this.loadZipContents(files);
    } catch (err) {
      if (fileIsZip) {
        this.zipContentsInvalid = true;
      } else {
        this.fileInvalid = true;
      }
    }
    this.validatingUpload = false;
    this.fileName.setValue(file.name);
  }

  get scenarioHasPlaceIds(): boolean {
    return this.scenarioWaypointsWithPlaceIDs.length > 0;
  }

  private get scenarioWaypoints(): IWaypoint[] {
    return [
      this.scenario?.model?.shipments?.flatMap((shipment) =>
        shipment.pickups
          ?.flatMap((pickup) => [pickup.arrivalWaypoint, pickup.departureWaypoint])
          .concat(
            shipment.deliveries?.flatMap((delivery) => [
              delivery.arrivalWaypoint,
              delivery.departureWaypoint,
            ])
          )
      ),
      this.scenario?.model?.vehicles?.flatMap((vehicle) => [
        vehicle.startWaypoint,
        vehicle.endWaypoint,
      ]),
    ]
      .flat()
      .filter((waypoint) => !!waypoint);
  }

  private get scenarioWaypointsWithPlaceIDs(): IWaypoint[] {
    return this.scenarioWaypoints.filter((waypoint) => !!waypoint.placeId);
  }

  private resetResolvingPlaceIds(): void {
    this.placeIdProgress = 0;
    this.resolvingPlaceIds = false;
  }

  /**
   * For all waypoints in the `scenario` with Place IDs,
   * set the lat/lng location of the waypoint
   * from a Place Details request.
   */
  async resolveWaypointPlaceIds(): Promise<void> {
    if (this.scenarioHasPlaceIds) {
      this.resolvingPlaceIds = true;
      this.placeIdProgress = 0;
      this.placeIdError = null;

      for (const waypoint of this.scenarioWaypointsWithPlaceIDs) {
        // stop if the user has clicked the cancel button
        if (this.dialogRef.getState() === MatDialogState.CLOSED) {
          this.resetResolvingPlaceIds();
          break;
        }

        try {
          const placeResult = await this.placesService.getDetails(waypoint.placeId);

          waypoint.location = merge(waypoint.location, {
            latLng: toDispatcherLatLng(placeResult.geometry.location),
          });

          this.placeIdProgress++;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error(err);
          this.placeIdError = `Place ID lookup failed: ${err}`;
          this.resetResolvingPlaceIds();
          break;
        }
      }

      this.resolvingPlaceIds = false;
    }
  }

  fileValidator(control: UntypedFormControl): ValidationErrors | null {
    if (this.fileInvalid) {
      return { fileFormat: true };
    }
    if (this.zipContentsInvalid) {
      return { zipContents: true };
    }
    if (!(typeof control.value === 'string') || control.value.trim().length === 0) {
      return { required: true };
    }
    if (this.json) {
      return this.scenarioValidator(control);
    }
  }

  loadZipContents(files: { content: JSON; filename: string }[]): ScenarioSolutionPair {
    if (files.length !== 2) {
      throw new Error('Incorrect number of files');
    }

    let scenario;
    let solution;
    files.forEach((file) => {
      if (file.filename === 'scenario.json') {
        scenario = this.validateScenario(file.content);
      }
      if (file.filename === 'solution.json') {
        solution = this.validateSolution(file.content);
      }
    });

    if (!scenario) {
      throw new Error('Missing scenario.json');
    }

    if (!solution) {
      throw new Error('Missing solution.json');
    }

    return { scenario, solution };
  }

  /**
   * Returns scenario validation errors
   *
   * @remarks
   * Only validates the message/value structure
   */
  scenarioValidator(_: UntypedFormControl): ValidationErrors | null {
    try {
      const scenario = this.validateScenario(this.json);

      if (this.scenario == null) {
        this.scenario = scenario;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Invalid request format:', error);
      return { requestFormat: true };
    }
    return null;
  }

  validateScenario(json: any): Scenario {
    const validationResult = this.uploadService.validateScenarioFormat(json);
    if (validationResult) {
      throw validationResult;
    }

    return this.dispatcherService.objectToScenario(json);
  }

  validateSolution(json: any): Solution {
    const validationResult = this.uploadService.validateSolutionFormat(json);
    if (validationResult) {
      throw validationResult;
    }

    return this.dispatcherService.objectToSolution(json);
  }
}
