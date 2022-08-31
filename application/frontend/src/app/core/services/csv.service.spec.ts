/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { selectMapApiKey } from '../selectors/config.selectors';
import { CsvService } from './csv.service';
import { parse, unparse } from 'papaparse';
import { EXPERIMENTAL_API_FIELDS_VEHICLES } from '../models';

describe('CsvService', () => {
  let service: CsvService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectMapApiKey, value: '' }],
        }),
      ],
    });

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
});
