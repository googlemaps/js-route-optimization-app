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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideMockStore } from '@ngrx/store/testing';

import { ObjectivesComponent } from './objectives.component';
import { ObjectiveType, ModelObjective } from '../../models';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ObjectivesComponent', () => {
  let component: ObjectivesComponent;
  let fixture: ComponentFixture<ObjectivesComponent>;

  const defaultObjectives: ModelObjective[] = [
    { type: ObjectiveType.DEFAULT, weight: 1.0, selected: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        SharedModule,
        NoopAnimationsModule,
      ],
      declarations: [ObjectivesComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ShipmentModelSelectors.selectObjectives, value: defaultObjectives },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ObjectivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initForm', () => {
    it('should initialize form with all objective types', () => {
      expect(component.form.length).toBe(5);
    });

    it('should initialize all objectives with default weight of 1.0', () => {
      component.form.controls.forEach((control) => {
        expect(control.get('weight').value).toBe(1.0);
      });
    });

    it('should include all objective types in form', () => {
      const types = component.form.controls.map((c) => c.get('type').value);
      expect(types).toContain(ObjectiveType.DEFAULT);
      expect(types).toContain(ObjectiveType.MIN_DISTANCE);
      expect(types).toContain(ObjectiveType.MIN_WORKING_TIME);
      expect(types).toContain(ObjectiveType.MIN_TRAVEL_TIME);
      expect(types).toContain(ObjectiveType.MIN_NUM_VEHICLES);
    });
  });

  describe('selectedCount', () => {
    it('should return count of selected objectives', () => {
      component.form.controls[0].get('selected').setValue(true);
      component.form.controls[1].get('selected').setValue(true);
      component.form.controls[2].get('selected').setValue(false);

      expect(component.selectedCount).toBe(2);
    });

    it('should return 0 when no objectives are selected', () => {
      component.form.controls.forEach((control) => {
        control.get('selected').setValue(false);
      });

      expect(component.selectedCount).toBe(0);
    });
  });

  describe('objectives getter', () => {
    it('should return all form values as an array of ModelObjectives', () => {
      component.form.controls[0].get('selected').setValue(true);
      component.form.controls[0].get('weight').setValue(2.5);

      const objectives = component.objectives;

      expect(objectives.length).toBe(5);
      expect(objectives).toEqual([
        {
        selected: true,
        type: ObjectiveType.DEFAULT,
        weight: 2.5,
      },
      {
        selected: false,
        type: ObjectiveType.MIN_DISTANCE,
        weight: 1.0,
      },
      {
        selected: false,
        type: ObjectiveType.MIN_WORKING_TIME,
        weight: 1.0,
      },
      {
        selected: false,
        type: ObjectiveType.MIN_TRAVEL_TIME,
        weight: 1.0,
      },
      {
        selected: false,
        type: ObjectiveType.MIN_NUM_VEHICLES,
        weight: 1.0,
      }
      ]);
    });
  });

  describe('resetObjectives', () => {
    it('should load matched objectives and reset unmatched objectives', () => {
      component.form.controls.forEach((control) => {
        control.get('selected').setValue(true);
        control.get('weight').setValue(5.0);
      });

      const savedObjectives: ModelObjective[] = [
        { type: ObjectiveType.MIN_NUM_VEHICLES, weight: 2.0, selected: true },
      ];

      component.resetObjectives(savedObjectives);

      component.objectiveTypes.forEach(obj => {
        const control = component.form.controls.find(
          (c) => c.get('type').value === obj.type
        );
        expect(control.get('selected').value).toBe(obj.type === ObjectiveType.MIN_NUM_VEHICLES);
        expect(control.get('weight').value).toBe(obj.type === ObjectiveType.MIN_NUM_VEHICLES ? 2.0 : 1.0);
      });
    });

    it('should handle empty objectives array', () => {
      component.resetObjectives([]);

      component.form.controls.forEach((control) => {
        expect(control.get('selected').value).toBe(false);
        expect(control.get('weight').value).toBe(1.0);
      });
    });

    it('should use default weight when weight is undefined', () => {
      const savedObjectives: ModelObjective[] = [
        { type: ObjectiveType.DEFAULT, weight: undefined, selected: true },
      ];

      component.resetObjectives(savedObjectives);

      const defaultControl = component.form.controls.find(
        (c) => c.get('type').value === ObjectiveType.DEFAULT
      );
      expect(defaultControl.get('weight').value).toBe(1.0);
    });
  });
});
