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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { selectMapApiKey } from '../selectors/config.selectors';
import { CsvService } from './csv.service';
import { parse, unparse } from 'papaparse';
import { EXPERIMENTAL_API_FIELDS_VEHICLES } from '../models';
import { GeocodingService } from './geocoding.service';

describe('CsvService', () => {
  let service: CsvService;

  let mockGeocodingService: jasmine.SpyObj<GeocodingService>;

  beforeEach(() => {
    mockGeocodingService = jasmine.createSpyObj('geocodingService', ['geocodeAddress']);
    mockGeocodingService.geocodeAddress.and.resolveTo(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: GeocodingService, useValue: mockGeocodingService },
        provideMockStore({
          selectors: [{ selector: selectMapApiKey, value: '' }],
        }),
      ],
    })
      .overrideProvider(GeocodingService, { useValue: mockGeocodingService })
      .compileComponents();

    service = TestBed.inject(CsvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should filter experimental csv fields', () => {
    const data = [
      {
        column1: 'value1',
        column2: 'value2',
        column3: 'value3',
      },
    ];

    const dataCsv = unparse(data);
    const filteredCsv = service.filterExperimentalFieldsFromCsv(dataCsv, false, ['column1']);
    expect(filteredCsv).not.toEqual(dataCsv);

    const filteredJson = parse(filteredCsv, { header: true }).data;
    expect(filteredJson.length).toEqual(1);
    expect(filteredJson[0]).not.toEqual(jasmine.objectContaining({ column1: 'value1' }));
  });

  it('should not filter experimental csv fields', () => {
    const data = [
      {
        column1: 'value1',
        column2: 'value2',
        column3: 'value3',
      },
    ];

    const dataCsv = unparse(data);
    const filteredCsv = service.filterExperimentalFieldsFromCsv(dataCsv, true, ['column1']);
    expect(filteredCsv).toEqual(dataCsv);

    const filteredJson = parse(filteredCsv, { header: true }).data;
    expect(filteredJson.length).toEqual(1);
    expect(filteredJson[0]).toEqual(jasmine.objectContaining({ column1: 'value1' }));
  });

  it('should not filter experimental api fields from vehiclesSample.csv', async () => {
    const fullCsv = await fetch('./assets/vehiclesSample.csv').then((response) => response.text());
    const filteredCsv = service.filterExperimentalFieldsFromCsv(
      fullCsv,
      true,
      EXPERIMENTAL_API_FIELDS_VEHICLES
    );
    expect(filteredCsv).toEqual(fullCsv);
  });

  it('should filter experimental api fields from vehiclesSample.csv', async () => {
    const fullCsv = await fetch('./assets/vehiclesSample.csv').then((response) => response.text());
    const filteredCsv = service.filterExperimentalFieldsFromCsv(
      fullCsv,
      false,
      EXPERIMENTAL_API_FIELDS_VEHICLES
    );
    expect(filteredCsv).not.toEqual(fullCsv);

    const parsedCsv = parse(filteredCsv);
    EXPERIMENTAL_API_FIELDS_VEHICLES.forEach((key) => {
      expect(parsedCsv).not.toContain(key);
    });
  });

  describe('Validate shipments', () => {
    it('should not throw error on a valid shipment', () => {
      const shipments = [{ label: 'test shipment' }];
      const testMapping = { Label: 'label' };
      const result = service.csvToShipments(shipments, testMapping);
      expect(result.length).toBe(1);
      expect(result[0].errors.length).toBe(0);
    });

    it('should not throw error on shipment with a valid load demand', () => {
      const shipments = [
        {
          LoadDemand1Type: 'weight',
          LoadDemand1Value: 10,
        },
      ];
      const testMapping = {
        LoadDemand1Type: 'LoadDemand1Type',
        LoadDemand1Value: 'LoadDemand1Value',
      };
      const result = service.csvToShipments(shipments, testMapping);
      expect(result.length).toBe(1);
      expect(result[0].errors.length).toBe(0);
    });

    it('should throw an error on shipment with an invalid load demand', () => {
      const shipments = [
        {
          LoadDemand1Type: 'weight',
          LoadDemand1Value: 'invalid',
        },
        {
          LoadDemand1Type: 'weight',
          LoadDemand1Value: 10.5,
        },
      ];
      const testMapping = {
        LoadDemand1Type: 'LoadDemand1Type',
        LoadDemand1Value: 'LoadDemand1Value',
      };
      const result = service.csvToShipments(shipments, testMapping);
      expect(result.length).toBe(2);
      expect(result[0].errors.length).toBe(1);
      expect(result[1].errors.length).toBe(1);
    });
  });

  describe('Validate vehicles', () => {
    it('should throw no errors on a valid vehicle', () => {
      const vehicles = [{ label: 'test vehicle' }];
      const testVehicleMapping = { Label: 'label' };
      const result = service.csvToVehicles(vehicles, testVehicleMapping);
      expect(result.length).toBe(1);
      expect(result[0].errors.length).toBe(0);
    });

    it('should throw no errors on a vehicle with a valid load limit', () => {
      const vehicles = [
        {
          label: 'test vehicle',
          LoadLimit1Type: 'weight',
          LoadLimit1Value: 10,
        },
      ];
      const testVehicleMapping = {
        Label: 'label',
        LoadLimit1Type: 'LoadLimit1Type',
        LoadLimit1Value: 'LoadLimit1Value',
      };
      const result = service.csvToVehicles(vehicles, testVehicleMapping);
      expect(result.length).toBe(1);
      expect(result[0].errors.length).toBe(0);
    });

    it('should throw an error on a vehicle with a negative load limit', () => {
      const vehicles = [
        {
          label: 'test vehicle',
          LoadLimit1Type: 'weight',
          LoadLimit1Value: -10,
        },
      ];
      const testVehicleMapping = {
        Label: 'label',
        LoadLimit1Type: 'LoadLimit1Type',
        LoadLimit1Value: 'LoadLimit1Value',
      };
      const result = service.csvToVehicles(vehicles, testVehicleMapping);
      expect(result.length).toBe(1);
      expect(result[0].errors.length).toBe(1);
    });

    it('should throw an error on a vehicle with a zero load limit', () => {
      const vehicles = [
        {
          label: 'test vehicle',
          LoadLimit1Type: 'weight',
          LoadLimit1Value: 0,
        },
      ];
      const testVehicleMapping = {
        Label: 'label',
        LoadLimit1Type: 'LoadLimit1Type',
        LoadLimit1Value: 'LoadLimit1Value',
      };
      const result = service.csvToVehicles(vehicles, testVehicleMapping);
      expect(result.length).toBe(1);
      expect(result[0].errors.length).toBe(1);
    });

    it('should throw no errors on a vehicle with a valid travel mode', () => {
      const vehicles = [
        {
          label: 'test vehicle',
          TravelMode: 'DRIVING',
        },
        {
          label: 'test vehicle',
          TravelMode: 'walking',
        },
      ];
      const testVehicleMapping = {
        Label: 'label',
        TravelMode: 'TravelMode',
      };
      const result = service.csvToVehicles(vehicles, testVehicleMapping);
      expect(result.length).toBe(2);
      expect(result[0].errors.length).toBe(0);
      expect(result[1].errors.length).toBe(0);
    });

    it('should throw an error on vehicles with an invalid travel mode', () => {
      const vehicles = [
        {
          label: 'test vehicle',
          TravelMode: 'DRIVING',
        },
        {
          label: 'test vehicle',
          TravelMode: 'invalid',
        },
      ];
      const testVehicleMapping = {
        Label: 'label',
        TravelMode: 'TravelMode',
      };
      const result = service.csvToVehicles(vehicles, testVehicleMapping);
      expect(result.length).toBe(2);
      expect(result[0].errors.length).toBe(0);
      expect(result[1].errors.length).toBe(1);
    });
  });

  describe('Validate geocoding', () => {
    it('should return null if an empty coordinate is provided', (done) => {
      service.geocodeLocation('').subscribe((res) => {
        expect(res).toBeNull();
        done();
      });
    });

    it('should return null if a null coordinate is provided', (done) => {
      service.geocodeLocation(null).subscribe((res) => {
        expect(res).toBeNull();
        done();
      });
    });

    it('should return a valid ILatLng if a valid coordinate string is provided', (done) => {
      service.geocodeLocation('-10,30').subscribe((res) => {
        expect(res).toEqual({ latitude: -10, longitude: 30 });
        done();
      });
    });

    it('should geocode an invalid lat/lng string', (done) => {
      service.geocodeLocation('1000,300').subscribe(() => {
        expect(mockGeocodingService.geocodeAddress).toHaveBeenCalled();
        done();
      });
    });

    it('should return a geocoding error if no results are found', (done) => {
      mockGeocodingService.geocodeAddress.and.resolveTo([]);
      service.geocodeLocation('bad address').subscribe((result) => {
        expect(result).toEqual({
          error: true,
          location: 'bad address',
          message: 'No results found',
        });
        done();
      });
    });

    it('should return a geocoding error if geocode is out of range', (done) => {
      mockGeocodingService.geocodeAddress.and.resolveTo([
        {
          address_components: [],
          formatted_address: '',
          geometry: {
            location_type: 'test location',
            location: {
              lat: 1000,
              lng: 1000,
            },
            viewport: {
              northeast: { lat: 0, lng: 0 },
              southwest: { lat: 0, lng: 0 },
            },
          },
          place_id: '',
          plus_code: {
            compound_code: '',
            global_code: '',
          },
          types: [],
        },
      ]);
      service.geocodeLocation('bad address').subscribe((result) => {
        expect(result).toEqual({
          error: true,
          location: 'bad address',
          message: 'Invalid geocode location',
        });
        done();
      });
    });

    it('should return an ILatLng if geocode is valid range', (done) => {
      mockGeocodingService.geocodeAddress.and.resolveTo([
        {
          address_components: [],
          formatted_address: '',
          geometry: {
            location_type: 'test location',
            location: {
              lat: 10,
              lng: 10,
            },
            viewport: {
              northeast: { lat: 0, lng: 0 },
              southwest: { lat: 0, lng: 0 },
            },
          },
          place_id: '',
          plus_code: {
            compound_code: '',
            global_code: '',
          },
          types: [],
        },
      ]);
      service.geocodeLocation('valid address').subscribe((result) => {
        expect(result).toEqual({
          latitude: 10,
          longitude: 10,
        });
        done();
      });
    });
  });
});
