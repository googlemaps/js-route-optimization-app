/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
