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
