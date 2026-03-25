import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { IObjective, ObjectiveType } from '../../models';
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

  get objectives(): IObjective[] {
    return this.form.controls
      .filter((control) => control.get('selected').value)
      .map((control) => ({
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
          selected: objective.type === ObjectiveType.DEFAULT,
          type: [objective.type],
          weight: [1.0, [Validators.min(0)]],
        })
      )
    );
  }

  resetObjectives(objectives: IObjective[]): void {
    this.form.controls.forEach((control) => {
      const type = control.get('type').value;
      const matchingObjective = objectives.find((obj) => obj.type === type);
      if (matchingObjective) {
        control.get('selected').setValue(true);
        control.get('weight').setValue(matchingObjective.weight ?? 1.0);
      } else {
        control.get('selected').setValue(false);
        control.get('weight').setValue(1.0);
      }
    });
  }
}
