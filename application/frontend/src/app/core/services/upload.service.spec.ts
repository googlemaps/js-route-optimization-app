/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { DispatcherService } from './dispatcher.service';
import { UploadService } from './upload.service';

describe('util', () => {
  let service: UploadService;
  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = new UploadService(TestBed.inject(DispatcherService));
  });
  describe('validateSolutionFormat', () => {
    it('validateSolutionFormat should return error', () => {
      expect(service.validateSolutionFormat(null) instanceof Error).toEqual(true);
    });
    it('validateSolutionFormat should return null', () => {
      expect(service.validateSolutionFormat({})).toEqual(null);
    });
    it('validateSolutionFormat should return null test input', () => {
      expect(service.validateSolutionFormat({ test: 'sample' })).toEqual(null);
    });
  });
  describe('validateScenarioFormat', () => {
    it('validateScenarioFormat should return error', () => {
      expect(service.validateScenarioFormat(null) instanceof Error).toEqual(true);
    });
    it('validateScenarioFormat should return error not null input', () => {
      expect(service.validateScenarioFormat({}) instanceof Error).toEqual(true);
    });
    it('validateScenarioFormat should return error2', () => {
      expect(service.validateScenarioFormat({ shipments: [] }) instanceof Error).toEqual(true);
    });
  });
});
