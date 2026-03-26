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
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { ModelObjective, ObjectiveType } from '../../models';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-objectives',
  templateUrl: './objectives.component.html',
  styleUrl: './objectives.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectivesComponent {
  readonly objectiveTypes = [
    { type: ObjectiveType.DEFAULT, label: 'Default' },
    { type: ObjectiveType.MIN_DISTANCE, label: 'Minimize Distance Traveled' },
    { type: ObjectiveType.MIN_WORKING_TIME, label: 'Minimize Working Time' },
    { type: ObjectiveType.MIN_TRAVEL_TIME, label: 'Minimize Travel Time' },
    { type: ObjectiveType.MIN_NUM_VEHICLES, label: 'Minimize Number of Vehicles' },
  ];

  get selectedCount(): number {
    return this.form.controls.filter((control) => control.get('selected').value).length;
  }

  get objectives(): ModelObjective[] {
    return this.form.controls.map((control) => ({
      selected: control.get('selected').value,
      type: control.get('type').value,
      weight: control.get('weight').value,
    }));
  }

  form: UntypedFormArray;

  constructor(private store: Store, private fb: UntypedFormBuilder) {
    this.initForm();

    store.pipe(select(ShipmentModelSelectors.selectObjectives), take(1)).subscribe((objectives) => {
      this.resetObjectives(objectives || []);
    });
  }

  initForm(): void {
    this.form = this.fb.array(
      this.objectiveTypes.map((objective) =>
        this.fb.group({
          selected: false,
          type: [objective.type],
          weight: [1.0, [Validators.min(0)]],
        })
      )
    );
  }

  resetObjectives(objectives: ModelObjective[]): void {
    this.form.controls.forEach((control) => {
      const type = control.get('type').value;
      const obj = objectives.find((obj) => obj.type === type);
      if (obj) {
        control.get('selected').setValue(obj.selected);
        control.get('weight').setValue(obj.weight ?? 1.0);
      } else {
        control.get('selected').setValue(false);
        control.get('weight').setValue(1.0);
      }
    });
  }
}
