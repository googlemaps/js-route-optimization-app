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
