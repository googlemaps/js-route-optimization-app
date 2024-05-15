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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormVisitRequestLayer, PlacesService } from 'src/app/core/services';
import { MaterialModule } from 'src/app/material';
import { FormatLatLngPipe } from 'src/app/shared/pipes';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { MockMarkersLayerService } from 'src/test/service-mocks';
import { PlaceAutocompleteComponent } from '../place-autocomplete/place-autocomplete.component';
import { TimeWindowComponent } from '../time-window/time-window.component';
import { VisitRequestFormComponent } from './visit-request-form.component';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-load-demands-form',
  template: '',
})
class MockCapacityQuantityFormComponent {
  @Input() abbreviations: { [unit: string]: string };
  @Input() appearance: string;
  @Input() disabled = false;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
}

describe('VisitRequestFormComponent', () => {
  let component: VisitRequestFormComponent;
  let fixture: ComponentFixture<VisitRequestFormComponent>;
  let placesService: jasmine.SpyObj<PlacesService>;
  let autocomplete: any;

  beforeEach(async () => {
    placesService = jasmine.createSpyObj('placesService', ['createAutocomplete']);
    autocomplete = jasmine.createSpyObj('Autocomplete', ['addListener', 'getPlace', 'setBounds']);
    placesService.createAutocomplete.and.returnValue(autocomplete);

    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [
        FormatLatLngPipe,
        PlaceAutocompleteComponent,
        TimeWindowComponent,
        VisitRequestFormComponent,
        MockCapacityQuantityFormComponent,
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .overrideProvider(FormVisitRequestLayer, { useFactory: () => new MockMarkersLayerService() })
      .overrideProvider(PlacesService, { useValue: placesService })
      .compileComponents();

    fixture = TestBed.createComponent(VisitRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
