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

@Component({
  selector: 'app-base-pre-solve-message',
  templateUrl: './base-pre-solve-message.component.html',
  styleUrls: ['./base-pre-solve-message.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BasePreSolveMessageComponent {
  @Input() numberOfVehicles = 0;
  @Input() numberOfShipments = 0;
}
