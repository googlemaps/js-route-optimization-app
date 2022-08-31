/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DomPortal } from '@angular/cdk/portal';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dictionary } from '@ngrx/entity';
import { Subscription } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ShipmentFormComponent, VisitRequestFormComponent } from 'src/app/shared/components';
import { durationSeconds } from 'src/app/util';
import { ITimeWindow, Shipment, Vehicle, Visit, VisitCategory, VisitRequest } from '../../models';
import { ShipmentFormFields } from '../../models/shipment-form-fields';
import { FormMapService, FormVisitRequestLayer } from '../../services';
import { FormVisitRequestInfoWindowService } from '../../services/form-visit-request-info-window.service';

@Component({
  selector: 'app-base-edit-shipment-dialog',
  templateUrl: './base-edit-shipment-dialog.component.html',
  styleUrls: ['./base-edit-shipment-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class BaseEditShipmentDialogComponent
  implements OnChanges, OnInit, AfterViewInit, OnDestroy
{
  @Input() bulkEdit: boolean;
  @Input() bulkNumber: number;
  @Input() disabled = false;
  @Input() shipment: Shipment;
  @Input() vehicles: Dictionary<Vehicle>;
  @Input() abbreviations: { [unit: string]: string };
  @Input() appearance: string;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
  @Input() scenarioShipmentTypes: Set<string>;
  /**
   * Ids used to map vehicle to index
   * @remarks
   * For pre-solve and post-solve, this should always be fromVehicles.selectIds;
   * indexes aren't adjusted until request/download time and not reflected in the
   * store.
   */
  @Input() vehicleIds: number[];
  @Input() visitRequests: VisitRequest[];
  @Input() pickup?: Visit;
  @Input() delivery?: Visit;
  @Input() visitTags?: string[];
  @Input() visitTypes?: string[];
  @Input() visitCategory?: VisitCategory;
  @Input() nextVisitRequestId = 0;
  @Input() timezoneOffset = 0;
  @Input() bounds?: google.maps.LatLngBounds;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    shipment: Shipment;
    visitRequests: VisitRequest[];
    visit?: Visit;
    unsetFields: string[];
  }>();

  activeVisitCategory = VisitCategory.Pickup;
  pickups: VisitRequest[] = [];
  deliveries: VisitRequest[] = [];
  private visitRequestsLimit = 4;

  private subscription: Subscription;
  unsetFields: string[] = [];
  formFields = ShipmentFormFields;

  @ViewChild(ShipmentFormComponent) shipmentForm: ShipmentFormComponent;
  @ViewChildren(VisitRequestFormComponent) visitRequestForms: QueryList<VisitRequestFormComponent>;

  get VisitCategory(): typeof VisitCategory {
    return VisitCategory;
  }

  get mapPortal(): DomPortal<any> {
    return this.formMapService.domPortal;
  }

  get isShowingPickups(): boolean {
    return this.activeVisitCategory !== VisitCategory.Delivery;
  }

  get addVisitRequestsDisabled(): boolean {
    return (
      (this.isShowingPickups ? this.pickups.length : this.deliveries.length) >=
      this.visitRequestsLimit
    );
  }

  get invalid(): boolean {
    return (
      this.shipmentForm?.invalid ||
      this.pickupsInvalid ||
      this.deliveriesInvalid ||
      (this.visitRequestsMissing && !this.bulkEdit)
    );
  }

  get pickupsInvalid(): boolean {
    return (
      this.pickups.length > 0 &&
      this.visitRequestForms?.toArray().some((form) => form.visitRequest.pickup && form.invalid)
    );
  }

  get deliveriesInvalid(): boolean {
    return (
      this.deliveries.length > 0 &&
      this.visitRequestForms?.toArray().some((form) => !form.visitRequest.pickup && form.invalid)
    );
  }

  get visitRequestsMissing(): boolean {
    return this.pickups.length === 0 && this.deliveries.length === 0;
  }

  constructor(
    public overwriteDialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
    private formMapService: FormMapService,
    private formVisitRequestInfoWindow: FormVisitRequestInfoWindowService,
    private formVisitRequestLayer: FormVisitRequestLayer
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.visitRequests) {
      const visitRequests = (changes.visitRequests.currentValue as VisitRequest[]) || [];

      // Reset form sources which are separated into pickups and deliveries
      this.pickups = visitRequests.filter((vr) => vr.pickup);
      this.deliveries = visitRequests.filter((vr) => !vr.pickup);

      // Reset map
      this.formVisitRequestLayer.load(visitRequests);
      this.updateLayerFocus();
    }
    if (changes.bounds) {
      this.formMapService.setBounds(changes.bounds.currentValue);
    }
    if (changes.disabled) {
      this.formVisitRequestLayer.draggable = !changes.disabled.currentValue;
    }
  }

  ngOnInit(): void {
    this.activeVisitCategory = this.visitCategory ?? this.activeVisitCategory;

    this.subscription = this.formVisitRequestLayer.click$.subscribe(({ id, pos }) => {
      id = (id as string).includes('-') ? (id as string).split('-')[0] : id;
      const visitRequest = this.visitRequestForms
        ?.toArray()
        .find((form) => form.visitRequest?.id === +id)
        .getVisitRequest();
      this.formVisitRequestInfoWindow.open(this.shipmentForm?.getShipment(), visitRequest, pos);
    });

    // Initialize the map
    this.formVisitRequestLayer.setStrokeColor('#B00200');
    this.formVisitRequestLayer.draggable = !this.disabled;
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.formVisitRequestLayer.reset();
    this.formVisitRequestInfoWindow.clear();
  }

  ngAfterViewInit(): void {
    this.formVisitRequestLayer.show();
    this.initializeMapBounds();

    // Ensure invalid getter re-evaulation after forms are added/removed
    this.visitRequestForms.changes
      .pipe(delay(0))
      .subscribe(() => this.changeDetector.markForCheck());
  }

  addPickup(): void {
    const visitRequest = this.createVisitRequest(true);
    const visitRequests = this.pickups.slice();
    visitRequests.push(visitRequest);
    this.formVisitRequestLayer.add([visitRequest]);
    this.pickups = visitRequests;
  }

  addDelivery(): void {
    const visitRequest = this.createVisitRequest(false);
    const visitRequests = this.deliveries.slice();
    visitRequests.push(visitRequest);
    this.formVisitRequestLayer.add([visitRequest]);
    this.deliveries = visitRequests;
  }

  removeVisitRequest(visitRequest: VisitRequest): void {
    // Update map
    this.formVisitRequestLayer.remove(visitRequest);

    // Update form source
    if (this.isShowingPickups) {
      this.pickups = this.pickups.filter((vr) => vr !== visitRequest);
    } else {
      this.deliveries = this.deliveries.filter((vr) => vr !== visitRequest);
    }
  }

  getPickupsStartAt(): { startAt: Date } {
    const pickupStartTime = durationSeconds(this.pickups[0]?.timeWindows?.[0]?.startTime, null);
    const deliveryStartTime = durationSeconds(
      this.deliveries[0]?.timeWindows?.[0]?.startTime,
      null
    );
    const startTime = pickupStartTime || deliveryStartTime;
    return {
      startAt:
        startTime !== null ? new Date((startTime.toNumber() + this.timezoneOffset) * 1000) : null,
    };
  }

  getDeliveriesStartAt(): { startAt: Date } {
    const pickupStartTime = durationSeconds(this.pickups[0]?.timeWindows?.[0]?.startTime, null);
    const deliveryStartTime = durationSeconds(
      this.deliveries[0]?.timeWindows?.[0]?.startTime,
      null
    );
    const startTime = deliveryStartTime || pickupStartTime;
    return {
      startAt:
        startTime !== null ? new Date((startTime.toNumber() + this.timezoneOffset) * 1000) : null,
    };
  }

  onVisitCategoryChange(visitCategory: VisitCategory): void {
    this.activeVisitCategory = visitCategory;
    this.updateLayerFocus();
  }

  onSave(): void {
    const shipment = this.shipmentForm.getShipment();
    const visitRequests =
      this.visitRequestForms?.toArray().map((form) => form.getVisitRequest()) || [];
    this.save.emit({
      shipment,
      visitRequests,
      unsetFields: this.unsetFields,
    });
  }

  isUnset(field: string): boolean {
    return this.bulkEdit && this.unsetFields.includes(field);
  }

  private createVisitRequest(pickup: boolean): {
    id: number;
    shipmentId: number;
    pickup: boolean;
    timeWindows: ITimeWindow[];
  } {
    return {
      id: this.nextVisitRequestId++,
      shipmentId: this.shipment.id,
      pickup,
      timeWindows: [{}],
    };
  }

  private initializeMapBounds(): void {
    this.formMapService.updateBounds(this.bounds, () => {
      if (!this.bounds || this.bounds.isEmpty()) {
        this.formMapService.zoomToHome();
      }
    });
  }

  private updateLayerFocus(): void {
    const visitRequests = this.pickups.concat(this.deliveries);

    // Make sure priority is given to the markers associated with the active visit category
    this.formVisitRequestLayer.setZIndexFn(visitRequests, (visitRequest, zIndex) => {
      return visitRequest.pickup === this.isShowingPickups ? zIndex + 1 : zIndex;
    });
  }

  onUnsetChange(result: { field: string }): void {
    const index = this.unsetFields.indexOf(result.field);
    if (index !== -1) {
      this.unsetFields.splice(index, 1);
    } else {
      this.unsetFields.push(result.field);
    }
  }
}
