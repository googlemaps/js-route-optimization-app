// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as v1 from './v1';
declare const FleetRoutingClient: typeof v1.FleetRoutingClient;
declare type FleetRoutingClient = v1.FleetRoutingClient;
declare const StatefulFleetRoutingClient: typeof v1.StatefulFleetRoutingClient;
declare type StatefulFleetRoutingClient = v1.StatefulFleetRoutingClient;
export { v1, FleetRoutingClient, StatefulFleetRoutingClient };
declare const _default: {
    v1: typeof v1;
    FleetRoutingClient: typeof v1.FleetRoutingClient;
    StatefulFleetRoutingClient: typeof v1.StatefulFleetRoutingClient;
};
export default _default;
import * as protos from '../protos/protos';
export { protos };
