/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { parse, unparse } from 'papaparse';
import { concat, from, Observable, of } from 'rxjs';
import { concatMap, map, take, toArray, withLatestFrom } from 'rxjs/operators';
import { omit } from 'lodash';
import {
  EXPERIMENTAL_API_FIELDS_VEHICLES,
  GeocodeErrorResponse,
  ILatLng,
  IShipment,
  IVehicle,
  IVehicleOperator,
} from '../models';
import { FileService } from './file.service';
import { GeocodingService } from './geocoding.service';

import * as fromConfig from 'src/app/core/selectors/config.selectors';
import { isLatLngString, stringToLatLng } from 'src/app/util';

@Injectable({ providedIn: 'root' })
export class CsvService {
  constructor(
    private fileService: FileService,
    private geocodingService: GeocodingService,
    private http: HttpClient,
    private store: Store
  ) {}

  /**
   * Geocode the start/end locations of each vehicle
   */
  geocodeVehicles(vehicles: any[]): Observable<(ILatLng | GeocodeErrorResponse)[]> {
    return from(vehicles).pipe(
      concatMap((vehicle) => {
        const index = vehicles.indexOf(vehicle);
        return concat(
          // start location
          this.geocodeLocation(vehicle.startWaypoint).pipe(
            map((g) => {
              if ((g as GeocodeErrorResponse).error) {
                g = <GeocodeErrorResponse>{
                  ...g,
                  source: vehicle,
                  field: 'startWaypoint',
                  vehicle,
                  index,
                };
              }

              return g;
            })
          ),

          // end location
          this.geocodeLocation(vehicle.endWaypoint).pipe(
            map((g) => {
              if ((g as GeocodeErrorResponse)?.error) {
                return <GeocodeErrorResponse>{
                  ...g,
                  source: vehicle,
                  field: 'endWaypoint',
                  vehicle,
                  index,
                };
              }

              return g;
            })
          )
        ).pipe(toArray());
      }),
      toArray(),
      map((g) => g.flat())
    );
  }

  /**
   * Geocode the pickup/delivery arrival locations of each shipment
   */
  geocodeShipments(shipments: any[]): Observable<(ILatLng | GeocodeErrorResponse)[]> {
    return from(shipments).pipe(
      concatMap((shipment) => {
        const index = shipments.indexOf(shipment);
        return concat(
          // pickup
          this.geocodeLocation(shipment.pickups?.[0].arrivalWaypoint).pipe(
            map((g) => {
              if ((g as GeocodeErrorResponse)?.error) {
                return <GeocodeErrorResponse>{
                  ...g,
                  source: shipment.pickups?.[0],
                  field: 'arrivalWaypoint',
                  shipment,
                  index,
                };
              }

              return g;
            })
          ),

          // delivery
          this.geocodeLocation(shipment.deliveries?.[0].arrivalWaypoint).pipe(
            map((g) => {
              if ((g as GeocodeErrorResponse)?.error) {
                return <GeocodeErrorResponse>{
                  ...g,
                  source: shipment.deliveries?.[0],
                  field: 'arrivalWaypoint',
                  shipment,
                  index,
                };
              }

              return g;
            })
          )
        ).pipe(toArray());
      }),
      toArray(),
      map((g) => g.flat())
    );
  }

  downloadShipmentsSample(): void {
    this.http
      .get('./assets/shipmentsSample.csv', { responseType: 'text' })
      .subscribe((content) =>
        this.fileService.download('shipmentsSample.csv', [content], 'text/csv')
      );
  }

  downloadVehiclesSample(): void {
    this.http
      .get('./assets/vehiclesSample.csv', { responseType: 'text' })
      .pipe(
        withLatestFrom(this.store.select(fromConfig.selectAllowExperimentalFeatures)),
        take(1),
        map(([vehiclesCsv, allowExperimentalFeatures]) =>
          this.filterExperimentalFieldsFromCsv(
            vehiclesCsv,
            allowExperimentalFeatures,
            EXPERIMENTAL_API_FIELDS_VEHICLES
          )
        )
      )
      .subscribe((content) =>
        this.fileService.download('vehiclesSample.csv', [content], 'text/csv')
      );
  }

  filterExperimentalFieldsFromCsv(
    csv: string,
    allowExperimentalFeatures: boolean,
    filterFields: string[]
  ): string {
    if (allowExperimentalFeatures) {
      return csv;
    }
    const { data } = parse(csv, { header: true });
    return unparse(data.map((row) => omit(row, filterFields)));
  }

  downloadVehicleOperatorsSample(): void {
    this.http
      .get('./assets/vehicleOperatorsSample.csv', { responseType: 'text' })
      .subscribe((content) =>
        this.fileService.download('vehicleOperatorsSample.csv', [content], 'text/csv')
      );
  }

  getCsvPreview(file: File, n: number): Observable<any> {
    return new Observable((observer) => {
      parse(file, {
        delimiter: ',',
        header: true,
        preview: n,
        complete: (results, _) => {
          observer.next(results);
          observer.complete();
        },
        error: (error) => observer.error(error),
      });
    });
  }

  loadCsv(file: File): Observable<any> {
    return new Observable((observer) => {
      parse(file, {
        delimiter: ',',
        header: true,
        skipEmptyLines: true,
        complete: (results, _) => {
          observer.next(results);
          observer.complete();
        },
        error: (error) => observer.error(error),
      });
    });
  }

  csvToShipments(csvShipments: any[], mapping: { [key: string]: string }): IShipment[] {
    return csvShipments.map((shipment) => {
      const timeWindows = this.mapToShipmentTimeWindows(shipment, mapping);
      const parsedShipment = {
        ...this.mapKeyToModelValue('label', 'Label', shipment, mapping),
        ...this.mapKeyToModelValue('penaltyCost', 'PenaltyCost', shipment, mapping, parseFloat),
        ...this.mapToLoadDemands(shipment, mapping),
        ...this.mapToPickup(shipment, mapping, timeWindows.pickup),
        ...this.mapToDelivery(shipment, mapping, timeWindows.delivery),
        ...this.mapKeyToModelValue(
          'allowedVehicleIndices',
          'AllowedVehicleIndices',
          shipment,
          mapping,
          this.commaSeparatedStringToIntArray
        ),
      };
      return parsedShipment;
    });
  }

  csvToVehicles(csvVehicles: any[], mapping: { [key: string]: string }): IVehicle[] {
    return csvVehicles.map((vehicle) => {
      // Conditionally add each field to the vehicle object, converting from csv strings as needed
      const parsedVehicle = {
        ...this.mapKeyToModelValue('label', 'Label', vehicle, mapping),
        ...this.mapKeyToModelValue('travelMode', 'TravelMode', vehicle, mapping),
        ...this.mapKeyToModelValue('unloadingPolicy', 'UnloadingPolicy', vehicle, mapping),
        ...this.mapKeyToModelValue('startWaypoint', 'StartWaypoint', vehicle, mapping),
        ...this.mapKeyToModelValue('endWaypoint', 'EndWaypoint', vehicle, mapping),
        ...this.mapKeyToModelValue('costPerHour', 'CostPerHour', vehicle, mapping, parseFloat),
        ...this.mapKeyToModelValue(
          'costPerTraveledHour',
          'CostPerTraveledHour',
          vehicle,
          mapping,
          parseFloat
        ),
        ...this.mapKeyToModelValue(
          'costPerKilometer',
          'CostPerKilometer',
          vehicle,
          mapping,
          parseFloat
        ),
        ...this.mapKeyToModelValue('fixedCost', 'FixedCost', vehicle, mapping, parseFloat),
        ...this.mapKeyToModelValue(
          'usedIfRouteIsEmpty',
          'UsedIfRouteIsEmpty',
          vehicle,
          mapping,
          this.toBool
        ),
        ...this.mapKeyToModelValue(
          'travelDurationMultiple',
          'TravelDurationMultiple',
          vehicle,
          mapping,
          parseFloat
        ),
        ...this.mapToVehicleOperatorTypes(vehicle, mapping),
        ...this.mapToLoadLimits(vehicle, mapping),
        ...this.mapToVehicleTimeWindows(vehicle, mapping),
      };
      return parsedVehicle;
    });
  }

  csvToVehicleOperators(
    csvVehicleOperators: any[],
    mapping: { [key: string]: string }
  ): IVehicleOperator[] {
    return csvVehicleOperators.map((vehicleOperator) => {
      // Conditionally add each field to the vehicle object, converting from csv strings as needed
      const parsedVehicleOperator = {
        ...this.mapKeyToModelValue('label', 'Label', vehicleOperator, mapping),
        ...this.mapKeyToModelValue('type', 'Type', vehicleOperator, mapping),
        ...this.mapToVehicleOperatorTimeWindows(vehicleOperator, mapping),
      };
      return parsedVehicleOperator;
    });
  }

  private mapToPickup(shipment: any, mapping: { [key: string]: string }, timeWindow: any): any {
    const pickup = {
      ...this.mapKeyToModelValue('arrivalWaypoint', 'PickupArrivalWaypoint', shipment, mapping),
      ...this.mapKeyToModelValue('duration', 'PickupDuration', shipment, mapping, this.toDuration),
      ...this.mapKeyToModelValue('cost', 'PickupCost', shipment, mapping, parseFloat),
      ...(Object.keys(timeWindow).length && { timeWindows: [timeWindow] }),
    };

    return Object.keys(pickup).length ? { pickups: [pickup] } : null;
  }

  private mapToDelivery(shipment: any, mapping: { [key: string]: string }, timeWindow: any): any {
    const delivery = {
      ...this.mapKeyToModelValue('arrivalWaypoint', 'DeliveryArrivalWaypoint', shipment, mapping),
      ...this.mapKeyToModelValue(
        'duration',
        'DeliveryDuration',
        shipment,
        mapping,
        this.toDuration
      ),
      ...this.mapKeyToModelValue('cost', 'DeliveryCost', shipment, mapping, parseFloat),
      ...(Object.keys(timeWindow).length && { timeWindows: [timeWindow] }),
    };

    return Object.keys(delivery).length ? { deliveries: [delivery] } : null;
  }

  private mapToShipmentTimeWindows(shipment: any, mapping: { [key: string]: string }): any {
    const timeWindows = {
      pickup: {
        ...this.mapKeyToModelValue(
          'startTime',
          'PickupStartTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softStartTime',
          'PickupSoftStartTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'endTime',
          'PickupEndTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softEndTime',
          'PickupSoftEndTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'costPerHourBeforeSoftStartTime',
          'PickupCostPerHourBeforeSoftStartTime',
          shipment,
          mapping,
          parseFloat
        ),
        ...this.mapKeyToModelValue(
          'costPerHourAfterSoftEndTime',
          'PickupCostPerHourAfterSoftEndTime',
          shipment,
          mapping,
          parseFloat
        ),
      },
      delivery: {
        ...this.mapKeyToModelValue(
          'startTime',
          'DeliveryStartTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softStartTime',
          'DeliverySoftStartTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'endTime',
          'DeliveryEndTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softEndTime',
          'DeliverySoftEndTime',
          shipment,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'costPerHourBeforeSoftStartTime',
          'DeliveryCostPerHourBeforeSoftStartTime',
          shipment,
          mapping,
          parseFloat
        ),
        ...this.mapKeyToModelValue(
          'costPerHourAfterSoftEndTime',
          'DeliveryCostPerHourAfterSoftEndTime',
          shipment,
          mapping,
          parseFloat
        ),
      },
    };
    return timeWindows;
  }

  private mapToVehicleTimeWindows(vehicle: any, mapping: { [key: string]: string }): any {
    const startTimeWindows = [
      {
        ...this.mapKeyToModelValue(
          'startTime',
          'StartTimeWindowStartTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softStartTime',
          'StartTimeWindowSoftStartTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'endTime',
          'StartTimeWindowEndTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softEndTime',
          'StartTimeWindowSoftEndTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'costPerHourBeforeSoftStartTime',
          'StartTimeWindowCostPerHourBeforeSoftStartTime',
          vehicle,
          mapping,
          parseFloat
        ),
        ...this.mapKeyToModelValue(
          'costPerHourAfterSoftEndTime',
          'StartTimeWindowCostPerHourAfterSoftEndTime',
          vehicle,
          mapping,
          parseFloat
        ),
      },
    ];
    const endTimeWindows = [
      {
        ...this.mapKeyToModelValue(
          'startTime',
          'EndTimeWindowStartTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softStartTime',
          'EndTimeWindowSoftStartTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'endTime',
          'EndTimeWindowEndTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'softEndTime',
          'EndTimeWindowSoftEndTime',
          vehicle,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'costPerHourBeforeSoftStartTime',
          'EndTimeWindowCostPerHourBeforeSoftStartTime',
          vehicle,
          mapping,
          parseFloat
        ),
        ...this.mapKeyToModelValue(
          'costPerHourAfterSoftEndTime',
          'EndTimeWindowCostPerHourAfterSoftEndTime',
          vehicle,
          mapping,
          parseFloat
        ),
      },
    ];
    const timeWindows: any = {};
    if (Object.keys(startTimeWindows).length > 0) {
      timeWindows.startTimeWindows = startTimeWindows;
    }
    if (Object.keys(endTimeWindows).length > 0) {
      timeWindows.endTimeWindows = endTimeWindows;
    }
    return timeWindows;
  }

  private mapToVehicleOperatorTimeWindows(
    vehicleOperator: any,
    mapping: { [key: string]: string }
  ): any {
    const startTimeWindows = [
      {
        ...this.mapKeyToModelValue(
          'startTime',
          'StartTimeWindowStartTime',
          vehicleOperator,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'endTime',
          'StartTimeWindowEndTime',
          vehicleOperator,
          mapping,
          this.timeStringToSeconds
        ),
      },
    ];
    const endTimeWindows = [
      {
        ...this.mapKeyToModelValue(
          'startTime',
          'EndTimeWindowStartTime',
          vehicleOperator,
          mapping,
          this.timeStringToSeconds
        ),
        ...this.mapKeyToModelValue(
          'endTime',
          'EndTimeWindowEndTime',
          vehicleOperator,
          mapping,
          this.timeStringToSeconds
        ),
      },
    ];
    const timeWindows: any = {};
    if (Object.keys(startTimeWindows).length > 0) {
      timeWindows.startTimeWindows = startTimeWindows;
    }
    if (Object.keys(endTimeWindows).length > 0) {
      timeWindows.endTimeWindows = endTimeWindows;
    }
    return timeWindows;
  }

  private timeStringToSeconds(timestring: string): { seconds: string } {
    try {
      const date = new Date(timestring);
      return { seconds: Math.floor(date.getTime() / 1000).toString() };
    } catch {
      return null;
    }
  }

  // Check map has the provided mapKey and if the model object has a value for the converted key
  // Optionally run the final value through a conversiion function to transform its type
  private mapKeyToModelValue(
    key: string,
    mapKey: string,
    obj: any,
    mapping: { [key: string]: string },
    conversionFunc: any = null
  ): any {
    if (mapping[mapKey] && obj[mapping[mapKey]]) {
      return {
        [key]: conversionFunc ? conversionFunc(obj[mapping[mapKey]]) : obj[mapping[mapKey]],
      };
    }
    return {};
  }

  private mapToLoadLimits(vehicle: any, mapping: { [key: string]: string }): any {
    const loadLimit = {};
    if (mapping.LoadLimit1Type && vehicle[mapping.LoadLimit1Type]) {
      loadLimit[vehicle[mapping.LoadLimit1Type]] = { maxLoad: vehicle[mapping.LoadLimit1Value] };
    }
    if (mapping.LoadLimit2Type && vehicle[mapping.LoadLimit2Type]) {
      loadLimit[vehicle[mapping.LoadLimit2Type]] = { maxLoad: vehicle[mapping.LoadLimit2Value] };
    }
    if (mapping.LoadLimit3Type && vehicle[mapping.LoadLimit3Type]) {
      loadLimit[vehicle[mapping.LoadLimit3Type]] = { maxLoad: vehicle[mapping.LoadLimit3Value] };
    }
    if (mapping.LoadLimit4Type && vehicle[mapping.LoadLimit4Type]) {
      loadLimit[vehicle[mapping.LoadLimit4Type]] = { maxLoad: vehicle[mapping.LoadLimit4Value] };
    }
    return { loadLimits: { ...loadLimit } };
  }

  private mapToVehicleOperatorTypes(vehicle: any, mapping: { [key: string]: string }): any {
    const vehicleOperatorType = [];
    if (mapping.RequiredOperatorType1 && vehicle[mapping.RequiredOperatorType1]) {
      vehicleOperatorType.push(vehicle[mapping.RequiredOperatorType1]);
    }
    if (mapping.RequiredOperatorType2 && vehicle[mapping.RequiredOperatorType2]) {
      vehicleOperatorType.push(vehicle[mapping.RequiredOperatorType2]);
    }
    if (mapping.RequiredOperatorType3 && vehicle[mapping.RequiredOperatorType3]) {
      vehicleOperatorType.push(vehicle[mapping.RequiredOperatorType3]);
    }
    return { requiredOperatorTypes: vehicleOperatorType };
  }

  private mapToLoadDemands(shipment: any, mapping: { [key: string]: string }): any {
    const loadDemands = {};
    if (mapping.LoadDemand1Type && shipment[mapping.LoadDemand1Type]) {
      loadDemands[shipment[mapping.LoadDemand1Type]] = {
        amount: shipment[mapping.LoadDemand1Value],
      };
    }
    if (mapping.LoadDemand2Type && shipment[mapping.LoadDemand2Type]) {
      loadDemands[shipment[mapping.LoadDemand2Type]] = {
        amount: shipment[mapping.LoadDemand2Value],
      };
    }
    if (mapping.LoadDemand3Type && shipment[mapping.LoadDemand3Type]) {
      loadDemands[shipment[mapping.LoadDemand3Type]] = {
        amount: shipment[mapping.LoadDemand3Value],
      };
    }
    if (mapping.LoadDemand4Type && shipment[mapping.LoadDemand4Type]) {
      loadDemands[shipment[mapping.LoadDemand4Type]] = {
        amount: shipment[mapping.LoadDemand4Value],
      };
    }
    return { loadDemands: { ...loadDemands } };
  }

  private toBool(value: string): boolean {
    return !!JSON.parse(value.toLowerCase());
  }

  private toDuration(value: any): any {
    return { seconds: value };
  }

  private commaSeparatedStringToIntArray(value: string): number[] {
    return value.split(',').map((entry) => parseInt(entry, 10));
  }

  geocodeLocation(location: string): Observable<ILatLng | GeocodeErrorResponse> {
    // First try to split the location as a Lat,Lng pair
    // Then geocode what the user provides if coordinates can't be parsed
    if (!location) {
      return of(<GeocodeErrorResponse>{
        error: true,
        location,
        message: 'Cannot geocode empty location',
      });
    }

    if (isLatLngString(location)) {
      const latLng = stringToLatLng(location);
      if (this.validRange(latLng.latitude, latLng.longitude)) {
        return of(latLng);
      }
    }

    return from(
      this.geocodingService
        .geocodeAddress(location)
        .then((results) => {
          if (!results?.length) {
            return <GeocodeErrorResponse>{
              error: true,
              location,
              message: 'No results found',
            };
          }
          if (
            !this.validRange(results[0].geometry.location.lat, results[0].geometry.location.lng)
          ) {
            return <GeocodeErrorResponse>{
              error: true,
              location,
              message: 'Invalid geocode location',
            };
          }

          return <ILatLng>{
            latitude: results[0].geometry.location.lat,
            longitude: results[0].geometry.location.lng,
          };
        })
        .catch((err) => {
          return <GeocodeErrorResponse>{
            error: true,
            location,
            message: err,
          };
        })
    );
  }

  private validRange(lat: number, lng: number): boolean {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }
}
