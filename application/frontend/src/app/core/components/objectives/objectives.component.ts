import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IObjective, ObjectiveType } from '../../models';

@Component({
  selector: 'app-objectives',
  templateUrl: './objectives.component.html',
  styleUrl: './objectives.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectivesComponent {
  form: UntypedFormArray;

  objectives: IObjective[] = [];

  readonly objectiveTypes = [
    { type: ObjectiveType.DEFAULT, label: 'Default' },
    { type: ObjectiveType.MIN_DISTANCE, label: 'Minimize Distance Traveled' },
    { type: ObjectiveType.MIN_WORKING_TIME, label: 'Minimize Working Time' },
    { type: ObjectiveType.MIN_TRAVEL_TIME, label: 'Minimize Travel Time' },
    { type: ObjectiveType.MIN_NUM_VEHICLES, label: 'Minimize Number of Vehicles' },
  ];

  constructor(private store: Store, private fb: UntypedFormBuilder) {
    this.initForm();
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
}
