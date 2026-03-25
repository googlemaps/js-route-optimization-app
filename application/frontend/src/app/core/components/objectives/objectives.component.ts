import { ChangeDetectionStrategy, Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { IObjective } from '../../models';

@Component({
  selector: 'app-objectives',
  templateUrl: './objectives.component.html',
  styleUrl: './objectives.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ObjectivesComponent {
  form: UntypedFormGroup;

  objectives: IObjective[] = [];

  constructor(private store: Store, private fb: UntypedFormBuilder) {
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      objectives: this.fb.array([]),
    });
  }
}
