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
import { ScenarioPlanningActions } from '../../actions';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers';

@Component({
  selector: 'app-scenario-planning',
  templateUrl: './scenario-planning.component.html',
  styleUrls: ['./scenario-planning.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarioPlanningComponent {
  constructor(private store: Store<fromRoot.State>) {
    store.dispatch(ScenarioPlanningActions.initialize());
  }
}
