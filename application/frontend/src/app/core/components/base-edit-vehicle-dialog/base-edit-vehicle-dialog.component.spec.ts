/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { PlaceAutocompleteComponent } from 'src/app/shared/components/place-autocomplete/place-autocomplete.component';
import { TimeWindowComponent } from 'src/app/shared/components/time-window/time-window.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { MockMapService, MockMarkersLayerService } from 'src/test/service-mocks';
import { FormMapService, VehicleLayer } from '../../services';
import { PlacesService } from '../../services/places.service';
import { BaseEditVehicleDialogComponent } from './base-edit-vehicle-dialog.component';
import { provideMockStore } from '@ngrx/store/testing';
import { FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DurationMinSecFormComponent } from 'src/app/shared/components/duration-min-sec-form/duration-min-sec-form.component';

@Component({
  selector: 'app-form-map',
  template: '',
})
class MockFormMapComponent {}

@Component({
  selector: 'app-duration-min-sec-form',
  template: '',
})
class MockAppDurationMinSecFormComponent {
  @Input() appearance = 'legacy';
  @Input() parentFormGroup: FormGroup;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() labelName: string;
  @Input() showUnset: boolean;
  @Input() isUnset: boolean;
  @Input() fieldName: string;
  @Output() unsetEvent = new EventEmitter<{ field: string }>();
}

describe('BaseEditVehicleDialogComponent', () => {
  let component: BaseEditVehicleDialogComponent;
  let fixture: ComponentFixture<BaseEditVehicleDialogComponent>;
  let placesService: jasmine.SpyObj<PlacesService>;
  let autocomplete: any;

  beforeEach(async () => {
    placesService = jasmine.createSpyObj('placesService', ['createAutocomplete']);
    autocomplete = jasmine.createSpyObj('Autocomplete', ['addListener', 'getPlace', 'setBounds']);
    placesService.createAutocomplete.and.returnValue(autocomplete);

    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule, SharedModule],
      declarations: [
        MockFormMapComponent,
        PlaceAutocompleteComponent,
        TimeWindowComponent,
        BaseEditVehicleDialogComponent,
      ],
      providers: [provideMockStore({})],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .overrideProvider(FormMapService, { useValue: new MockMapService() })
      .overrideProvider(PlacesService, { useValue: placesService })
      .overrideProvider(VehicleLayer, { useValue: new MockMarkersLayerService() })
      .overrideProvider(DurationMinSecFormComponent, {
        useValue: MockAppDurationMinSecFormComponent,
      })
      .compileComponents();

    fixture = TestBed.createComponent(BaseEditVehicleDialogComponent);
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
