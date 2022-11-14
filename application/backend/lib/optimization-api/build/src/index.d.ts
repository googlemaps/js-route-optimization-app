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
