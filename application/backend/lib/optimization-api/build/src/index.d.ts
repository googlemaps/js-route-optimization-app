/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as v1 from './v1';
declare const FleetRoutingClient: typeof v1.FleetRoutingClient;
declare type FleetRoutingClient = v1.FleetRoutingClient;
export { v1, FleetRoutingClient };
declare const _default: {
    v1: typeof v1;
    FleetRoutingClient: typeof v1.FleetRoutingClient;
};
export default _default;
import * as protos from '../protos/protos';
export { protos };
