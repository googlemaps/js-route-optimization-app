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

import { IVehicleOperator } from './dispatcher.model';

export interface VehicleOperator extends IVehicleOperator {
  /** Equivalent to shipment route id */
  id: number;
  changeTime?: number;
}

export enum FormFields {
  Type = 'Type',
  Label = 'Label',
  StartTimeWindows = 'StartTimeWindows',
  EndTimeWindows = 'EndTimeWindows',
}
