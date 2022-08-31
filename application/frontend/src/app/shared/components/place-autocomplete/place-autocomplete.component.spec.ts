/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PlaceAutocompleteComponent } from './place-autocomplete.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material';
import { PlacesService } from '../../../core/services/places.service';

describe('PlaceAutocompleteComponent', () => {
  let component: PlaceAutocompleteComponent;
  let fixture: ComponentFixture<PlaceAutocompleteComponent>;
  let placesService: jasmine.SpyObj<PlacesService>;
  let autocomplete: any;

  beforeEach(async () => {
    // places service
    placesService = jasmine.createSpyObj('placesService', ['createAutocomplete']);
    autocomplete = jasmine.createSpyObj('Autocomplete', ['addListener', 'getPlace', 'setBounds']);
    placesService.createAutocomplete.and.returnValue(autocomplete);

    // place autocomplete component
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule],
      declarations: [PlaceAutocompleteComponent],
    })
      .overrideProvider(PlacesService, { useValue: placesService })
      .compileComponents();

    fixture = TestBed.createComponent(PlaceAutocompleteComponent);
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
