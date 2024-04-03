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

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers';
import { DispatcherApiActions, MainNavActions, ValidationResultActions } from '../../actions';
import { ValidationService } from '../../services';

@Component({
  selector: 'app-generate-button',
  templateUrl: './generate-button.component.html',
  styleUrls: ['./generate-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateButtonComponent {
  @Input() disabled = false;
  @Input() label = 'Generate';
  @Input() prompt = false;
  @Input() solving = false;

  constructor(private store: Store<fromRoot.State>, private validationService: ValidationService) {}

  onCancel(): void {
    this.store.dispatch(DispatcherApiActions.optimizeToursCancel());
  }

  onSolve(): void {
    const validationResult = this.validationService.validateRequest();
    if (validationResult.shipments || validationResult.vehicles) {
      this.store.dispatch(ValidationResultActions.showWarning({ validationResult }));
    } else if (this.prompt) {
      this.store.dispatch(MainNavActions.promptReSolve());
    } else {
      this.store.dispatch(MainNavActions.solve());
    }
  }
}
