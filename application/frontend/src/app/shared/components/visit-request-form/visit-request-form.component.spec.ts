/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
