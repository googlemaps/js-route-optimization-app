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

/// <reference types="node" />
import type * as gax from 'google-gax';
import type { Callback, CallOptions, Descriptors, ClientOptions, LROperation, PaginationCallback } from 'google-gax';
import { Transform } from 'stream';
import * as protos from '../../protos/protos';
/**
 *  A service for managing fleet routing-related data and running optimizations
 *  of vehicle tours.
 * @class
 * @memberof v1
 */
export declare class StatefulFleetRoutingClient {
    private _terminated;
    private _opts;
    private _providedCustomServicePath;
    private _gaxModule;
    private _gaxGrpc;
    private _protos;
    private _defaults;
    auth: gax.GoogleAuth;
    descriptors: Descriptors;
    warn: (code: string, message: string, warnType?: string) => void;
    innerApiCalls: {
        [name: string]: Function;
    };
    pathTemplates: {
        [name: string]: gax.PathTemplate;
    };
    operationsClient: gax.OperationsClient;
    statefulFleetRoutingStub?: Promise<{
        [name: string]: Function;
    }>;
    /**
     * Construct an instance of StatefulFleetRoutingClient.
     *
     * @param {object} [options] - The configuration object.
     * The options accepted by the constructor are described in detail
     * in [this document](https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#creating-the-client-instance).
     * The common options are:
     * @param {object} [options.credentials] - Credentials object.
     * @param {string} [options.credentials.client_email]
     * @param {string} [options.credentials.private_key]
     * @param {string} [options.email] - Account email address. Required when
     *     using a .pem or .p12 keyFilename.
     * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
     *     .p12 key downloaded from the Google Developers Console. If you provide
     *     a path to a JSON file, the projectId option below is not necessary.
     *     NOTE: .pem and .p12 require you to specify options.email as well.
     * @param {number} [options.port] - The port on which to connect to
     *     the remote host.
     * @param {string} [options.projectId] - The project ID from the Google
     *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
     *     the environment variable GCLOUD_PROJECT for your project ID. If your
     *     app is running in an environment which supports
     *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
     *     your project ID will be detected automatically.
     * @param {string} [options.apiEndpoint] - The domain name of the
     *     API remote host.
     * @param {gax.ClientConfig} [options.clientConfig] - Client configuration override.
     *     Follows the structure of {@link gapicConfig}.
     * @param {boolean | "rest"} [options.fallback] - Use HTTP fallback mode.
     *     Pass "rest" to use HTTP/1.1 REST API instead of gRPC.
     *     For more information, please check the
     *     {@link https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#http11-rest-api-mode documentation}.
     * @param {gax} [gaxInstance]: loaded instance of `google-gax`. Useful if you
     *     need to avoid loading the default gRPC version and want to use the fallback
     *     HTTP implementation. Load only fallback version and pass it to the constructor:
     *     ```
     *     const gax = require('google-gax/build/src/fallback'); // avoids loading google-gax with gRPC
     *     const client = new StatefulFleetRoutingClient({fallback: 'rest'}, gax);
     *     ```
     */
    constructor(opts?: ClientOptions, gaxInstance?: typeof gax | typeof gax.fallback);
    /**
     * Initialize the client.
     * Performs asynchronous operations (such as authentication) and prepares the client.
     * This function will be called automatically when any class method is called for the
     * first time, but if you need to initialize it before calling an actual method,
     * feel free to call initialize() directly.
     *
     * You can await on this method if you want to make sure the client is initialized.
     *
     * @returns {Promise} A promise that resolves to an authenticated service stub.
     */
    initialize(): Promise<{
        [name: string]: Function;
    }>;
    /**
     * The DNS address for this API service.
     * @returns {string} The DNS address for this service.
     */
    static get servicePath(): string;
    /**
     * The DNS address for this API service - same as servicePath(),
     * exists for compatibility reasons.
     * @returns {string} The DNS address for this service.
     */
    static get apiEndpoint(): string;
    /**
     * The port for this API service.
     * @returns {number} The default port for this service.
     */
    static get port(): number;
    /**
     * The scopes needed to make gRPC calls for every method defined
     * in this service.
     * @returns {string[]} List of default scopes.
     */
    static get scopes(): string[];
    getProjectId(): Promise<string>;
    getProjectId(callback: Callback<string, undefined, undefined>): void;
    /**
     * Creates a workspace to manage a group of resources.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent resource where this workspace will be created.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {google.cloud.optimization.v1.Workspace} request.workspace
     *   Required. The workspace to create.
     * @param {string} request.workspaceId
     *   The ID to use for the workspace, which will become the final component of
     *   the workspace's resource name. If not provided, an auto generated ID will
     *   be used.
     *
     *   This value should be 4-63 characters, and valid characters
     *   are /{@link 0-9|a-z}-/.
     *   If this field is empty, a unique id will be generated by the server.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Workspace]{@link google.cloud.optimization.v1.Workspace}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.create_workspace.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_CreateWorkspace_async
     */
    createWorkspace(request?: protos.google.cloud.optimization.v1.ICreateWorkspaceRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IWorkspace,
        protos.google.cloud.optimization.v1.ICreateWorkspaceRequest | undefined,
        {} | undefined
    ]>;
    createWorkspace(request: protos.google.cloud.optimization.v1.ICreateWorkspaceRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IWorkspace, protos.google.cloud.optimization.v1.ICreateWorkspaceRequest | null | undefined, {} | null | undefined>): void;
    createWorkspace(request: protos.google.cloud.optimization.v1.ICreateWorkspaceRequest, callback: Callback<protos.google.cloud.optimization.v1.IWorkspace, protos.google.cloud.optimization.v1.ICreateWorkspaceRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Updates a workspace.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {google.cloud.optimization.v1.Workspace} request.workspace
     *   Required. The workspace to update.
     *
     *   The workspace's `name` field is used to identify the workspace to update.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {google.protobuf.FieldMask} request.updateMask
     *   The list of fields to update.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Workspace]{@link google.cloud.optimization.v1.Workspace}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.update_workspace.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_UpdateWorkspace_async
     */
    updateWorkspace(request?: protos.google.cloud.optimization.v1.IUpdateWorkspaceRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IWorkspace,
        protos.google.cloud.optimization.v1.IUpdateWorkspaceRequest | undefined,
        {} | undefined
    ]>;
    updateWorkspace(request: protos.google.cloud.optimization.v1.IUpdateWorkspaceRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IWorkspace, protos.google.cloud.optimization.v1.IUpdateWorkspaceRequest | null | undefined, {} | null | undefined>): void;
    updateWorkspace(request: protos.google.cloud.optimization.v1.IUpdateWorkspaceRequest, callback: Callback<protos.google.cloud.optimization.v1.IWorkspace, protos.google.cloud.optimization.v1.IUpdateWorkspaceRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Deletes a workspace.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the workspace to delete.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Empty]{@link google.protobuf.Empty}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.delete_workspace.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_DeleteWorkspace_async
     */
    deleteWorkspace(request?: protos.google.cloud.optimization.v1.IDeleteWorkspaceRequest, options?: CallOptions): Promise<[
        protos.google.protobuf.IEmpty,
        protos.google.cloud.optimization.v1.IDeleteWorkspaceRequest | undefined,
        {} | undefined
    ]>;
    deleteWorkspace(request: protos.google.cloud.optimization.v1.IDeleteWorkspaceRequest, options: CallOptions, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteWorkspaceRequest | null | undefined, {} | null | undefined>): void;
    deleteWorkspace(request: protos.google.cloud.optimization.v1.IDeleteWorkspaceRequest, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteWorkspaceRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Creates a vehicle.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent resource where this vehicle will be created.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {google.cloud.optimization.v1.Vehicle} request.vehicle
     *   Required. The vehicle to create.
     *
     *   The following fields are ignored:
     *     * label
     * @param {string} request.vehicleId
     *   The ID to use for the vehicle, which will become the final component of
     *   the vehicle's resource name. If not provided, an auto generated ID will
     *   be used.
     *
     *   This value should be 4-63 characters, and valid characters
     *   are /{@link 0-9|a-z}-/.
     *   If this field is empty, a unique id will be generated by the server.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Vehicle]{@link google.cloud.optimization.v1.Vehicle}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.create_vehicle.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_CreateVehicle_async
     */
    createVehicle(request?: protos.google.cloud.optimization.v1.ICreateVehicleRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IVehicle,
        protos.google.cloud.optimization.v1.ICreateVehicleRequest | undefined,
        {} | undefined
    ]>;
    createVehicle(request: protos.google.cloud.optimization.v1.ICreateVehicleRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IVehicle, protos.google.cloud.optimization.v1.ICreateVehicleRequest | null | undefined, {} | null | undefined>): void;
    createVehicle(request: protos.google.cloud.optimization.v1.ICreateVehicleRequest, callback: Callback<protos.google.cloud.optimization.v1.IVehicle, protos.google.cloud.optimization.v1.ICreateVehicleRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Gets a vehicle.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the vehicle to retrieve.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/vehicles/{vehicle}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Vehicle]{@link google.cloud.optimization.v1.Vehicle}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.get_vehicle.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_GetVehicle_async
     */
    getVehicle(request?: protos.google.cloud.optimization.v1.IGetVehicleRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IVehicle,
        protos.google.cloud.optimization.v1.IGetVehicleRequest | undefined,
        {} | undefined
    ]>;
    getVehicle(request: protos.google.cloud.optimization.v1.IGetVehicleRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IVehicle, protos.google.cloud.optimization.v1.IGetVehicleRequest | null | undefined, {} | null | undefined>): void;
    getVehicle(request: protos.google.cloud.optimization.v1.IGetVehicleRequest, callback: Callback<protos.google.cloud.optimization.v1.IVehicle, protos.google.cloud.optimization.v1.IGetVehicleRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Updates a vehicle.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {google.cloud.optimization.v1.Vehicle} request.vehicle
     *   Required. The vehicle to update.
     *
     *   The vehicle's `name` field is used to identify the vehicle to update.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/vehicles/{vehicle}"
     *
     *   The following fields are ignored:
     *     * label
     * @param {google.protobuf.FieldMask} request.updateMask
     *   The list of fields to update.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Vehicle]{@link google.cloud.optimization.v1.Vehicle}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.update_vehicle.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_UpdateVehicle_async
     */
    updateVehicle(request?: protos.google.cloud.optimization.v1.IUpdateVehicleRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IVehicle,
        protos.google.cloud.optimization.v1.IUpdateVehicleRequest | undefined,
        {} | undefined
    ]>;
    updateVehicle(request: protos.google.cloud.optimization.v1.IUpdateVehicleRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IVehicle, protos.google.cloud.optimization.v1.IUpdateVehicleRequest | null | undefined, {} | null | undefined>): void;
    updateVehicle(request: protos.google.cloud.optimization.v1.IUpdateVehicleRequest, callback: Callback<protos.google.cloud.optimization.v1.IVehicle, protos.google.cloud.optimization.v1.IUpdateVehicleRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Deletes a vehicle.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the vehicle to delete.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/vehicles/{vehicle}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Empty]{@link google.protobuf.Empty}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.delete_vehicle.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_DeleteVehicle_async
     */
    deleteVehicle(request?: protos.google.cloud.optimization.v1.IDeleteVehicleRequest, options?: CallOptions): Promise<[
        protos.google.protobuf.IEmpty,
        protos.google.cloud.optimization.v1.IDeleteVehicleRequest | undefined,
        {} | undefined
    ]>;
    deleteVehicle(request: protos.google.cloud.optimization.v1.IDeleteVehicleRequest, options: CallOptions, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteVehicleRequest | null | undefined, {} | null | undefined>): void;
    deleteVehicle(request: protos.google.cloud.optimization.v1.IDeleteVehicleRequest, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteVehicleRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Creates a shipment.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent resource where this shipment will be created.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/shipments/{shipment}"
     * @param {google.cloud.optimization.v1.Shipment} request.shipment
     *   Required. The shipment to create.
     *
     *   The following fields are ignored:
     *     * label
     * @param {string} request.shipmentId
     *   The ID to use for the shipment, which will become the final
     *   component of the shipment's resource name. If not provided, an auto
     *   generated ID will be used.
     *
     *   This value should be 4-63 characters, and valid characters
     *   are /{@link 0-9|a-z}-/.
     *   If this field is empty, a unique id will be generated by the server.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Shipment]{@link google.cloud.optimization.v1.Shipment}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.create_shipment.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_CreateShipment_async
     */
    createShipment(request?: protos.google.cloud.optimization.v1.ICreateShipmentRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IShipment,
        protos.google.cloud.optimization.v1.ICreateShipmentRequest | undefined,
        {} | undefined
    ]>;
    createShipment(request: protos.google.cloud.optimization.v1.ICreateShipmentRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IShipment, protos.google.cloud.optimization.v1.ICreateShipmentRequest | null | undefined, {} | null | undefined>): void;
    createShipment(request: protos.google.cloud.optimization.v1.ICreateShipmentRequest, callback: Callback<protos.google.cloud.optimization.v1.IShipment, protos.google.cloud.optimization.v1.ICreateShipmentRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Gets a shipment.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the shipment to retrieve.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/shipments/{shipment}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Shipment]{@link google.cloud.optimization.v1.Shipment}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.get_shipment.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_GetShipment_async
     */
    getShipment(request?: protos.google.cloud.optimization.v1.IGetShipmentRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IShipment,
        protos.google.cloud.optimization.v1.IGetShipmentRequest | undefined,
        {} | undefined
    ]>;
    getShipment(request: protos.google.cloud.optimization.v1.IGetShipmentRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IShipment, protos.google.cloud.optimization.v1.IGetShipmentRequest | null | undefined, {} | null | undefined>): void;
    getShipment(request: protos.google.cloud.optimization.v1.IGetShipmentRequest, callback: Callback<protos.google.cloud.optimization.v1.IShipment, protos.google.cloud.optimization.v1.IGetShipmentRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Updates a shipment.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {google.cloud.optimization.v1.Shipment} request.shipment
     *   Required. The shipment to update.
     *
     *   The shipment's `name` field is used to identify the shipment to update.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/shipments/{shipment}"
     *
     *   The following fields are ignored:
     *     * label
     * @param {google.protobuf.FieldMask} request.updateMask
     *   The list of fields to update.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Shipment]{@link google.cloud.optimization.v1.Shipment}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.update_shipment.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_UpdateShipment_async
     */
    updateShipment(request?: protos.google.cloud.optimization.v1.IUpdateShipmentRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IShipment,
        protos.google.cloud.optimization.v1.IUpdateShipmentRequest | undefined,
        {} | undefined
    ]>;
    updateShipment(request: protos.google.cloud.optimization.v1.IUpdateShipmentRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IShipment, protos.google.cloud.optimization.v1.IUpdateShipmentRequest | null | undefined, {} | null | undefined>): void;
    updateShipment(request: protos.google.cloud.optimization.v1.IUpdateShipmentRequest, callback: Callback<protos.google.cloud.optimization.v1.IShipment, protos.google.cloud.optimization.v1.IUpdateShipmentRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Deletes a shipment.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the shipment to delete.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/shipments/{shipment}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Empty]{@link google.protobuf.Empty}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.delete_shipment.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_DeleteShipment_async
     */
    deleteShipment(request?: protos.google.cloud.optimization.v1.IDeleteShipmentRequest, options?: CallOptions): Promise<[
        protos.google.protobuf.IEmpty,
        protos.google.cloud.optimization.v1.IDeleteShipmentRequest | undefined,
        {} | undefined
    ]>;
    deleteShipment(request: protos.google.cloud.optimization.v1.IDeleteShipmentRequest, options: CallOptions, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteShipmentRequest | null | undefined, {} | null | undefined>): void;
    deleteShipment(request: protos.google.cloud.optimization.v1.IDeleteShipmentRequest, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteShipmentRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Gets a solution.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the solution to retrieve. Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/solutions/{solution}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Solution]{@link google.cloud.optimization.v1.Solution}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.get_solution.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_GetSolution_async
     */
    getSolution(request?: protos.google.cloud.optimization.v1.IGetSolutionRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.ISolution,
        protos.google.cloud.optimization.v1.IGetSolutionRequest | undefined,
        {} | undefined
    ]>;
    getSolution(request: protos.google.cloud.optimization.v1.IGetSolutionRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.ISolution, protos.google.cloud.optimization.v1.IGetSolutionRequest | null | undefined, {} | null | undefined>): void;
    getSolution(request: protos.google.cloud.optimization.v1.IGetSolutionRequest, callback: Callback<protos.google.cloud.optimization.v1.ISolution, protos.google.cloud.optimization.v1.IGetSolutionRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Deletes a solution.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the solution to delete. Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/solutions/{solution}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Empty]{@link google.protobuf.Empty}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.delete_solution.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_DeleteSolution_async
     */
    deleteSolution(request?: protos.google.cloud.optimization.v1.IDeleteSolutionRequest, options?: CallOptions): Promise<[
        protos.google.protobuf.IEmpty,
        protos.google.cloud.optimization.v1.IDeleteSolutionRequest | undefined,
        {} | undefined
    ]>;
    deleteSolution(request: protos.google.cloud.optimization.v1.IDeleteSolutionRequest, options: CallOptions, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteSolutionRequest | null | undefined, {} | null | undefined>): void;
    deleteSolution(request: protos.google.cloud.optimization.v1.IDeleteSolutionRequest, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteSolutionRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Retrieves the `OptimizeToursRequest` that corresponds to the solution.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the solution to retrieve the corresponding
     *   `OptimizeToursRequest`. Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/solutions/{solution}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [RetrieveInputResponse]{@link google.cloud.optimization.v1.RetrieveInputResponse}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.retrieve_input.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_RetrieveInput_async
     */
    retrieveInput(request?: protos.google.cloud.optimization.v1.IRetrieveInputRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IRetrieveInputResponse,
        protos.google.cloud.optimization.v1.IRetrieveInputRequest | undefined,
        {} | undefined
    ]>;
    retrieveInput(request: protos.google.cloud.optimization.v1.IRetrieveInputRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IRetrieveInputResponse, protos.google.cloud.optimization.v1.IRetrieveInputRequest | null | undefined, {} | null | undefined>): void;
    retrieveInput(request: protos.google.cloud.optimization.v1.IRetrieveInputRequest, callback: Callback<protos.google.cloud.optimization.v1.IRetrieveInputResponse, protos.google.cloud.optimization.v1.IRetrieveInputRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Creates an optimizer .
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent resource where this optimizer will be created.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/optimizers/{optimizer}"
     * @param {google.cloud.optimization.v1.Optimizer} request.optimizer
     *   Required. The optimizer to create.
     * @param {string} request.optimizerId
     *   The ID to use for the optimizer, which will become the final component of
     *   the optimizer's resource name. If not provided, an auto generated ID will
     *   be used.
     *
     *   This value should be 4-63 characters, and valid characters
     *   are /{@link 0-9|a-z}-/.
     *   If this field is empty, a unique id will be generated by the server.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Optimizer]{@link google.cloud.optimization.v1.Optimizer}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.create_optimizer.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_CreateOptimizer_async
     */
    createOptimizer(request?: protos.google.cloud.optimization.v1.ICreateOptimizerRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IOptimizer,
        protos.google.cloud.optimization.v1.ICreateOptimizerRequest | undefined,
        {} | undefined
    ]>;
    createOptimizer(request: protos.google.cloud.optimization.v1.ICreateOptimizerRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IOptimizer, protos.google.cloud.optimization.v1.ICreateOptimizerRequest | null | undefined, {} | null | undefined>): void;
    createOptimizer(request: protos.google.cloud.optimization.v1.ICreateOptimizerRequest, callback: Callback<protos.google.cloud.optimization.v1.IOptimizer, protos.google.cloud.optimization.v1.ICreateOptimizerRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Gets an optimizer.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the optimizer to retrieve.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/optimizers/{optimizer}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Optimizer]{@link google.cloud.optimization.v1.Optimizer}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.get_optimizer.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_GetOptimizer_async
     */
    getOptimizer(request?: protos.google.cloud.optimization.v1.IGetOptimizerRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IOptimizer,
        protos.google.cloud.optimization.v1.IGetOptimizerRequest | undefined,
        {} | undefined
    ]>;
    getOptimizer(request: protos.google.cloud.optimization.v1.IGetOptimizerRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IOptimizer, protos.google.cloud.optimization.v1.IGetOptimizerRequest | null | undefined, {} | null | undefined>): void;
    getOptimizer(request: protos.google.cloud.optimization.v1.IGetOptimizerRequest, callback: Callback<protos.google.cloud.optimization.v1.IOptimizer, protos.google.cloud.optimization.v1.IGetOptimizerRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Updates an optimizer.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {google.cloud.optimization.v1.Optimizer} request.optimizer
     *   Required. The optimizer to update.
     *
     *   The optimizer's `name` field is used to identify the optimizer to update.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/optimizers/{optimizer}"
     * @param {google.protobuf.FieldMask} request.updateMask
     *   The list of fields to update.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Optimizer]{@link google.cloud.optimization.v1.Optimizer}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.update_optimizer.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_UpdateOptimizer_async
     */
    updateOptimizer(request?: protos.google.cloud.optimization.v1.IUpdateOptimizerRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IOptimizer,
        protos.google.cloud.optimization.v1.IUpdateOptimizerRequest | undefined,
        {} | undefined
    ]>;
    updateOptimizer(request: protos.google.cloud.optimization.v1.IUpdateOptimizerRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IOptimizer, protos.google.cloud.optimization.v1.IUpdateOptimizerRequest | null | undefined, {} | null | undefined>): void;
    updateOptimizer(request: protos.google.cloud.optimization.v1.IUpdateOptimizerRequest, callback: Callback<protos.google.cloud.optimization.v1.IOptimizer, protos.google.cloud.optimization.v1.IUpdateOptimizerRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Deletes an optimizer.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the optimizer to delete.
     *   Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/optimizers/{optimizer}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [Empty]{@link google.protobuf.Empty}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.delete_optimizer.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_DeleteOptimizer_async
     */
    deleteOptimizer(request?: protos.google.cloud.optimization.v1.IDeleteOptimizerRequest, options?: CallOptions): Promise<[
        protos.google.protobuf.IEmpty,
        protos.google.cloud.optimization.v1.IDeleteOptimizerRequest | undefined,
        {} | undefined
    ]>;
    deleteOptimizer(request: protos.google.cloud.optimization.v1.IDeleteOptimizerRequest, options: CallOptions, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteOptimizerRequest | null | undefined, {} | null | undefined>): void;
    deleteOptimizer(request: protos.google.cloud.optimization.v1.IDeleteOptimizerRequest, callback: Callback<protos.google.protobuf.IEmpty, protos.google.cloud.optimization.v1.IDeleteOptimizerRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Run the optimizer to generate a solution based on updated entities (e.g.
     *  shipments and vehicles), the solution under execution, and other related
     *  constraints.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.name
     *   Required. The name of the optimizer to run an optimization. Format:
     *   "projects/{project}/locations/{location}/workspaces/{workspace}/optimizers/{optimizer}"
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing
     *   a long running operation. Its `promise()` method returns a promise
     *   you can `await` for.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.run_optimizer.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_RunOptimizer_async
     */
    runOptimizer(request?: protos.google.cloud.optimization.v1.IRunOptimizerRequest, options?: CallOptions): Promise<[
        LROperation<protos.google.cloud.optimization.v1.IRunOptimizerResponse, protos.google.cloud.optimization.v1.IRunOptimizerMetadata>,
        protos.google.longrunning.IOperation | undefined,
        {} | undefined
    ]>;
    runOptimizer(request: protos.google.cloud.optimization.v1.IRunOptimizerRequest, options: CallOptions, callback: Callback<LROperation<protos.google.cloud.optimization.v1.IRunOptimizerResponse, protos.google.cloud.optimization.v1.IRunOptimizerMetadata>, protos.google.longrunning.IOperation | null | undefined, {} | null | undefined>): void;
    runOptimizer(request: protos.google.cloud.optimization.v1.IRunOptimizerRequest, callback: Callback<LROperation<protos.google.cloud.optimization.v1.IRunOptimizerResponse, protos.google.cloud.optimization.v1.IRunOptimizerMetadata>, protos.google.longrunning.IOperation | null | undefined, {} | null | undefined>): void;
    /**
     * Check the status of the long running operation returned by `runOptimizer()`.
     * @param {String} name
     *   The operation name that will be passed.
     * @returns {Promise} - The promise which resolves to an object.
     *   The decoded operation object has result and metadata field to get information from.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.run_optimizer.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_RunOptimizer_async
     */
    checkRunOptimizerProgress(name: string): Promise<LROperation<protos.google.cloud.optimization.v1.RunOptimizerResponse, protos.google.cloud.optimization.v1.RunOptimizerMetadata>>;
    /**
    * Lists all the workspaces under the project within a cloud location.
    *
    * @param {Object} request
    *   The request object that will be sent.
    * @param {string} request.parent
    *   Required. The parent, which owns this collection of workspaces.
    *   Format: "projects/{project}/locations/{location}"
    * @param {number} request.pageSize
    *   The maximum number of workspaces to return. The service may return fewer
    *   than this value. If unspecified, at most 50 workspaces will be returned.
    *   The maximum value is 100; values above 100 will be coerced to 100.
    * @param {string} request.pageToken
    *   A page token, received from a previous `ListWorkspaces` call.
    *   Provide this to retrieve the subsequent page.
    *
    *   When paginating, all other parameters provided to `ListWorkspaces` must
    *   match the call that provided the page token.
    * @param {string} request.filter
    *   Filter expression that matches a subset of the Workspaces to show.
    *   https://google.aip.dev/160.
    * @param {object} [options]
    *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
    * @returns {Promise} - The promise which resolves to an array.
    *   The first element of the array is Array of [Workspace]{@link google.cloud.optimization.v1.Workspace}.
    *   The client library will perform auto-pagination by default: it will call the API as many
    *   times as needed and will merge results from all the pages into this array.
    *   Note that it can affect your quota.
    *   We recommend using `listWorkspacesAsync()`
    *   method described below for async iteration which you can stop as needed.
    *   Please see the
    *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
    *   for more details and examples.
    */
    listWorkspaces(request?: protos.google.cloud.optimization.v1.IListWorkspacesRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IWorkspace[],
        protos.google.cloud.optimization.v1.IListWorkspacesRequest | null,
        protos.google.cloud.optimization.v1.IListWorkspacesResponse
    ]>;
    listWorkspaces(request: protos.google.cloud.optimization.v1.IListWorkspacesRequest, options: CallOptions, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListWorkspacesRequest, protos.google.cloud.optimization.v1.IListWorkspacesResponse | null | undefined, protos.google.cloud.optimization.v1.IWorkspace>): void;
    listWorkspaces(request: protos.google.cloud.optimization.v1.IListWorkspacesRequest, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListWorkspacesRequest, protos.google.cloud.optimization.v1.IListWorkspacesResponse | null | undefined, protos.google.cloud.optimization.v1.IWorkspace>): void;
    /**
     * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of workspaces.
     *   Format: "projects/{project}/locations/{location}"
     * @param {number} request.pageSize
     *   The maximum number of workspaces to return. The service may return fewer
     *   than this value. If unspecified, at most 50 workspaces will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListWorkspaces` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListWorkspaces` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Workspaces to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing [Workspace]{@link google.cloud.optimization.v1.Workspace} on 'data' event.
     *   The client library will perform auto-pagination by default: it will call the API as many
     *   times as needed. Note that it can affect your quota.
     *   We recommend using `listWorkspacesAsync()`
     *   method described below for async iteration which you can stop as needed.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     */
    listWorkspacesStream(request?: protos.google.cloud.optimization.v1.IListWorkspacesRequest, options?: CallOptions): Transform;
    /**
     * Equivalent to `listWorkspaces`, but returns an iterable object.
     *
     * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of workspaces.
     *   Format: "projects/{project}/locations/{location}"
     * @param {number} request.pageSize
     *   The maximum number of workspaces to return. The service may return fewer
     *   than this value. If unspecified, at most 50 workspaces will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListWorkspaces` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListWorkspaces` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Workspaces to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Object}
     *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
     *   When you iterate the returned iterable, each element will be an object representing
     *   [Workspace]{@link google.cloud.optimization.v1.Workspace}. The API will be called under the hood as needed, once per the page,
     *   so you can stop the iteration when you don't need more results.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.list_workspaces.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_ListWorkspaces_async
     */
    listWorkspacesAsync(request?: protos.google.cloud.optimization.v1.IListWorkspacesRequest, options?: CallOptions): AsyncIterable<protos.google.cloud.optimization.v1.IWorkspace>;
    /**
    * Lists the vehicles within a workspace.
    *
    * @param {Object} request
    *   The request object that will be sent.
    * @param {string} request.parent
    *   Required. The parent, which owns this collection of vehicles.
    *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
    * @param {number} request.pageSize
    *   The maximum number of vehicles to return. The service may return fewer
    *   than this value. If unspecified, at most 50 vehicles will be returned.
    *   The maximum value is 100; values above 100 will be coerced to 100.
    * @param {string} request.pageToken
    *   A page token, received from a previous `ListVehicles` call.
    *   Provide this to retrieve the subsequent page.
    *
    *   When paginating, all other parameters provided to `ListVehicles` must
    *   match the call that provided the page token.
    * @param {string} request.filter
    *   Filter expression that matches a subset of the Vehicles to show.
    *   https://google.aip.dev/160.
    * @param {object} [options]
    *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
    * @returns {Promise} - The promise which resolves to an array.
    *   The first element of the array is Array of [Vehicle]{@link google.cloud.optimization.v1.Vehicle}.
    *   The client library will perform auto-pagination by default: it will call the API as many
    *   times as needed and will merge results from all the pages into this array.
    *   Note that it can affect your quota.
    *   We recommend using `listVehiclesAsync()`
    *   method described below for async iteration which you can stop as needed.
    *   Please see the
    *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
    *   for more details and examples.
    */
    listVehicles(request?: protos.google.cloud.optimization.v1.IListVehiclesRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IVehicle[],
        protos.google.cloud.optimization.v1.IListVehiclesRequest | null,
        protos.google.cloud.optimization.v1.IListVehiclesResponse
    ]>;
    listVehicles(request: protos.google.cloud.optimization.v1.IListVehiclesRequest, options: CallOptions, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListVehiclesRequest, protos.google.cloud.optimization.v1.IListVehiclesResponse | null | undefined, protos.google.cloud.optimization.v1.IVehicle>): void;
    listVehicles(request: protos.google.cloud.optimization.v1.IListVehiclesRequest, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListVehiclesRequest, protos.google.cloud.optimization.v1.IListVehiclesResponse | null | undefined, protos.google.cloud.optimization.v1.IVehicle>): void;
    /**
     * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of vehicles.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of vehicles to return. The service may return fewer
     *   than this value. If unspecified, at most 50 vehicles will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListVehicles` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListVehicles` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Vehicles to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing [Vehicle]{@link google.cloud.optimization.v1.Vehicle} on 'data' event.
     *   The client library will perform auto-pagination by default: it will call the API as many
     *   times as needed. Note that it can affect your quota.
     *   We recommend using `listVehiclesAsync()`
     *   method described below for async iteration which you can stop as needed.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     */
    listVehiclesStream(request?: protos.google.cloud.optimization.v1.IListVehiclesRequest, options?: CallOptions): Transform;
    /**
     * Equivalent to `listVehicles`, but returns an iterable object.
     *
     * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of vehicles.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of vehicles to return. The service may return fewer
     *   than this value. If unspecified, at most 50 vehicles will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListVehicles` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListVehicles` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Vehicles to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Object}
     *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
     *   When you iterate the returned iterable, each element will be an object representing
     *   [Vehicle]{@link google.cloud.optimization.v1.Vehicle}. The API will be called under the hood as needed, once per the page,
     *   so you can stop the iteration when you don't need more results.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.list_vehicles.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_ListVehicles_async
     */
    listVehiclesAsync(request?: protos.google.cloud.optimization.v1.IListVehiclesRequest, options?: CallOptions): AsyncIterable<protos.google.cloud.optimization.v1.IVehicle>;
    /**
    * Lists the shipments within a workspace.
    *
    * @param {Object} request
    *   The request object that will be sent.
    * @param {string} request.parent
    *   Required. The parent, which owns this collection of shipments.
    *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
    * @param {number} request.pageSize
    *   The maximum number of shipments to return. The service may return fewer
    *   than this value. If unspecified, at most 50 vehicles will be returned.
    *   The maximum value is 100; values above 100 will be coerced to 100.
    * @param {string} request.pageToken
    *   A page token, received from a previous `ListShipments` call.
    *   Provide this to retrieve the subsequent page.
    *
    *   When paginating, all other parameters provided to `ListShipments` must
    *   match the call that provided the page token.
    * @param {string} request.filter
    *   Filter expression that matches a subset of the Shipments to show.
    *   https://google.aip.dev/160.
    * @param {object} [options]
    *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
    * @returns {Promise} - The promise which resolves to an array.
    *   The first element of the array is Array of [Shipment]{@link google.cloud.optimization.v1.Shipment}.
    *   The client library will perform auto-pagination by default: it will call the API as many
    *   times as needed and will merge results from all the pages into this array.
    *   Note that it can affect your quota.
    *   We recommend using `listShipmentsAsync()`
    *   method described below for async iteration which you can stop as needed.
    *   Please see the
    *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
    *   for more details and examples.
    */
    listShipments(request?: protos.google.cloud.optimization.v1.IListShipmentsRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IShipment[],
        protos.google.cloud.optimization.v1.IListShipmentsRequest | null,
        protos.google.cloud.optimization.v1.IListShipmentsResponse
    ]>;
    listShipments(request: protos.google.cloud.optimization.v1.IListShipmentsRequest, options: CallOptions, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListShipmentsRequest, protos.google.cloud.optimization.v1.IListShipmentsResponse | null | undefined, protos.google.cloud.optimization.v1.IShipment>): void;
    listShipments(request: protos.google.cloud.optimization.v1.IListShipmentsRequest, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListShipmentsRequest, protos.google.cloud.optimization.v1.IListShipmentsResponse | null | undefined, protos.google.cloud.optimization.v1.IShipment>): void;
    /**
     * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of shipments.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of shipments to return. The service may return fewer
     *   than this value. If unspecified, at most 50 vehicles will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListShipments` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListShipments` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Shipments to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing [Shipment]{@link google.cloud.optimization.v1.Shipment} on 'data' event.
     *   The client library will perform auto-pagination by default: it will call the API as many
     *   times as needed. Note that it can affect your quota.
     *   We recommend using `listShipmentsAsync()`
     *   method described below for async iteration which you can stop as needed.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     */
    listShipmentsStream(request?: protos.google.cloud.optimization.v1.IListShipmentsRequest, options?: CallOptions): Transform;
    /**
     * Equivalent to `listShipments`, but returns an iterable object.
     *
     * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of shipments.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of shipments to return. The service may return fewer
     *   than this value. If unspecified, at most 50 vehicles will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListShipments` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListShipments` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Shipments to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Object}
     *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
     *   When you iterate the returned iterable, each element will be an object representing
     *   [Shipment]{@link google.cloud.optimization.v1.Shipment}. The API will be called under the hood as needed, once per the page,
     *   so you can stop the iteration when you don't need more results.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.list_shipments.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_ListShipments_async
     */
    listShipmentsAsync(request?: protos.google.cloud.optimization.v1.IListShipmentsRequest, options?: CallOptions): AsyncIterable<protos.google.cloud.optimization.v1.IShipment>;
    /**
    * List the solutions based on certain conditions.
    *
    * @param {Object} request
    *   The request object that will be sent.
    * @param {string} request.parent
    *   Required. The parent, which owns this collection of solutions.
    *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
    * @param {number} request.pageSize
    *   The maximum number of solutions to return. The service may return fewer
    *   than this value. If unspecified, at most 50 solutions will be returned.
    *   The maximum value is 100; values above 100 will be coerced to 100.
    * @param {string} request.pageToken
    *   A page token, received from a previous `ListSolutions` call.
    *   Provide this to retrieve the subsequent page.
    *
    *   When paginating, all other parameters provided to `ListSolutions` must
    *   match the call that provided the page token.
    * @param {string} request.filter
    *   Filter expression that matches a subset of the Solutions to show.
    *   https://google.aip.dev/160.
    * @param {object} [options]
    *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
    * @returns {Promise} - The promise which resolves to an array.
    *   The first element of the array is Array of [Solution]{@link google.cloud.optimization.v1.Solution}.
    *   The client library will perform auto-pagination by default: it will call the API as many
    *   times as needed and will merge results from all the pages into this array.
    *   Note that it can affect your quota.
    *   We recommend using `listSolutionsAsync()`
    *   method described below for async iteration which you can stop as needed.
    *   Please see the
    *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
    *   for more details and examples.
    */
    listSolutions(request?: protos.google.cloud.optimization.v1.IListSolutionsRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.ISolution[],
        protos.google.cloud.optimization.v1.IListSolutionsRequest | null,
        protos.google.cloud.optimization.v1.IListSolutionsResponse
    ]>;
    listSolutions(request: protos.google.cloud.optimization.v1.IListSolutionsRequest, options: CallOptions, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListSolutionsRequest, protos.google.cloud.optimization.v1.IListSolutionsResponse | null | undefined, protos.google.cloud.optimization.v1.ISolution>): void;
    listSolutions(request: protos.google.cloud.optimization.v1.IListSolutionsRequest, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListSolutionsRequest, protos.google.cloud.optimization.v1.IListSolutionsResponse | null | undefined, protos.google.cloud.optimization.v1.ISolution>): void;
    /**
     * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of solutions.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of solutions to return. The service may return fewer
     *   than this value. If unspecified, at most 50 solutions will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListSolutions` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListSolutions` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Solutions to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing [Solution]{@link google.cloud.optimization.v1.Solution} on 'data' event.
     *   The client library will perform auto-pagination by default: it will call the API as many
     *   times as needed. Note that it can affect your quota.
     *   We recommend using `listSolutionsAsync()`
     *   method described below for async iteration which you can stop as needed.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     */
    listSolutionsStream(request?: protos.google.cloud.optimization.v1.IListSolutionsRequest, options?: CallOptions): Transform;
    /**
     * Equivalent to `listSolutions`, but returns an iterable object.
     *
     * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of solutions.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of solutions to return. The service may return fewer
     *   than this value. If unspecified, at most 50 solutions will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListSolutions` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListSolutions` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Solutions to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Object}
     *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
     *   When you iterate the returned iterable, each element will be an object representing
     *   [Solution]{@link google.cloud.optimization.v1.Solution}. The API will be called under the hood as needed, once per the page,
     *   so you can stop the iteration when you don't need more results.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.list_solutions.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_ListSolutions_async
     */
    listSolutionsAsync(request?: protos.google.cloud.optimization.v1.IListSolutionsRequest, options?: CallOptions): AsyncIterable<protos.google.cloud.optimization.v1.ISolution>;
    /**
    * Lists the optimizers within a workspace.
    *
    * @param {Object} request
    *   The request object that will be sent.
    * @param {string} request.parent
    *   Required. The parent, which owns this collection of optimizers.
    *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
    * @param {number} request.pageSize
    *   The maximum number of optimizers to return. The service may return fewer
    *   than this value. If unspecified, at most 50 optimizers will be returned.
    *   The maximum value is 100; values above 100 will be coerced to 100.
    * @param {string} request.pageToken
    *   A page token, received from a previous `ListOptimizers` call.
    *   Provide this to retrieve the subsequent page.
    *
    *   When paginating, all other parameters provided to `ListOptimizers` must
    *   match the call that provided the page token.
    * @param {string} request.filter
    *   Filter expression that matches a subset of the Optimizers to show.
    *   https://google.aip.dev/160.
    * @param {object} [options]
    *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
    * @returns {Promise} - The promise which resolves to an array.
    *   The first element of the array is Array of [Optimizer]{@link google.cloud.optimization.v1.Optimizer}.
    *   The client library will perform auto-pagination by default: it will call the API as many
    *   times as needed and will merge results from all the pages into this array.
    *   Note that it can affect your quota.
    *   We recommend using `listOptimizersAsync()`
    *   method described below for async iteration which you can stop as needed.
    *   Please see the
    *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
    *   for more details and examples.
    */
    listOptimizers(request?: protos.google.cloud.optimization.v1.IListOptimizersRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IOptimizer[],
        protos.google.cloud.optimization.v1.IListOptimizersRequest | null,
        protos.google.cloud.optimization.v1.IListOptimizersResponse
    ]>;
    listOptimizers(request: protos.google.cloud.optimization.v1.IListOptimizersRequest, options: CallOptions, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListOptimizersRequest, protos.google.cloud.optimization.v1.IListOptimizersResponse | null | undefined, protos.google.cloud.optimization.v1.IOptimizer>): void;
    listOptimizers(request: protos.google.cloud.optimization.v1.IListOptimizersRequest, callback: PaginationCallback<protos.google.cloud.optimization.v1.IListOptimizersRequest, protos.google.cloud.optimization.v1.IListOptimizersResponse | null | undefined, protos.google.cloud.optimization.v1.IOptimizer>): void;
    /**
     * Equivalent to `method.name.toCamelCase()`, but returns a NodeJS Stream object.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of optimizers.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of optimizers to return. The service may return fewer
     *   than this value. If unspecified, at most 50 optimizers will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListOptimizers` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListOptimizers` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Optimizers to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Stream}
     *   An object stream which emits an object representing [Optimizer]{@link google.cloud.optimization.v1.Optimizer} on 'data' event.
     *   The client library will perform auto-pagination by default: it will call the API as many
     *   times as needed. Note that it can affect your quota.
     *   We recommend using `listOptimizersAsync()`
     *   method described below for async iteration which you can stop as needed.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     */
    listOptimizersStream(request?: protos.google.cloud.optimization.v1.IListOptimizersRequest, options?: CallOptions): Transform;
    /**
     * Equivalent to `listOptimizers`, but returns an iterable object.
     *
     * `for`-`await`-`of` syntax is used with the iterable to get response elements on-demand.
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. The parent, which owns this collection of optimizers.
     *   Format: "projects/{project}/locations/{location}/workspaces/{workspace}"
     * @param {number} request.pageSize
     *   The maximum number of optimizers to return. The service may return fewer
     *   than this value. If unspecified, at most 50 optimizers will be returned.
     *   The maximum value is 100; values above 100 will be coerced to 100.
     * @param {string} request.pageToken
     *   A page token, received from a previous `ListOptimizers` call.
     *   Provide this to retrieve the subsequent page.
     *
     *   When paginating, all other parameters provided to `ListOptimizers` must
     *   match the call that provided the page token.
     * @param {string} request.filter
     *   Filter expression that matches a subset of the Optimizers to show.
     *   https://google.aip.dev/160.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Object}
     *   An iterable Object that allows [async iteration](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols).
     *   When you iterate the returned iterable, each element will be an object representing
     *   [Optimizer]{@link google.cloud.optimization.v1.Optimizer}. The API will be called under the hood as needed, once per the page,
     *   so you can stop the iteration when you don't need more results.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#auto-pagination)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/stateful_fleet_routing.list_optimizers.js</caption>
     * region_tag:cloudoptimization_v1_generated_StatefulFleetRouting_ListOptimizers_async
     */
    listOptimizersAsync(request?: protos.google.cloud.optimization.v1.IListOptimizersRequest, options?: CallOptions): AsyncIterable<protos.google.cloud.optimization.v1.IOptimizer>;
    /**
       * Gets the latest state of a long-running operation.  Clients can use this
       * method to poll the operation result at intervals as recommended by the API
       * service.
       *
       * @param {Object} request - The request object that will be sent.
       * @param {string} request.name - The name of the operation resource.
       * @param {Object=} options
       *   Optional parameters. You can override the default settings for this call,
       *   e.g, timeout, retries, paginations, etc. See [gax.CallOptions]{@link
       *   https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the
       *   details.
       * @param {function(?Error, ?Object)=} callback
       *   The function which will be called with the result of the API call.
       *
       *   The second parameter to the callback is an object representing
       * [google.longrunning.Operation]{@link
       * external:"google.longrunning.Operation"}.
       * @return {Promise} - The promise which resolves to an array.
       *   The first element of the array is an object representing
       * [google.longrunning.Operation]{@link
       * external:"google.longrunning.Operation"}. The promise has a method named
       * "cancel" which cancels the ongoing API call.
       *
       * @example
       * ```
       * const client = longrunning.operationsClient();
       * const name = '';
       * const [response] = await client.getOperation({name});
       * // doThingsWith(response)
       * ```
       */
    getOperation(request: protos.google.longrunning.GetOperationRequest, options?: gax.CallOptions | Callback<protos.google.longrunning.Operation, protos.google.longrunning.GetOperationRequest, {} | null | undefined>, callback?: Callback<protos.google.longrunning.Operation, protos.google.longrunning.GetOperationRequest, {} | null | undefined>): Promise<[protos.google.longrunning.Operation]>;
    /**
     * Lists operations that match the specified filter in the request. If the
     * server doesn't support this method, it returns `UNIMPLEMENTED`. Returns an iterable object.
     *
     * For-await-of syntax is used with the iterable to recursively get response element on-demand.
     *
     * @param {Object} request - The request object that will be sent.
     * @param {string} request.name - The name of the operation collection.
     * @param {string} request.filter - The standard list filter.
     * @param {number=} request.pageSize -
     *   The maximum number of resources contained in the underlying API
     *   response. If page streaming is performed per-resource, this
     *   parameter does not affect the return value. If page streaming is
     *   performed per-page, this determines the maximum number of
     *   resources in a page.
     * @param {Object=} options
     *   Optional parameters. You can override the default settings for this call,
     *   e.g, timeout, retries, paginations, etc. See [gax.CallOptions]{@link
     *   https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the
     *   details.
     * @returns {Object}
     *   An iterable Object that conforms to @link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols.
     *
     * @example
     * ```
     * const client = longrunning.operationsClient();
     * for await (const response of client.listOperationsAsync(request));
     * // doThingsWith(response)
     * ```
     */
    listOperationsAsync(request: protos.google.longrunning.ListOperationsRequest, options?: gax.CallOptions): AsyncIterable<protos.google.longrunning.ListOperationsResponse>;
    /**
     * Starts asynchronous cancellation on a long-running operation.  The server
     * makes a best effort to cancel the operation, but success is not
     * guaranteed.  If the server doesn't support this method, it returns
     * `google.rpc.Code.UNIMPLEMENTED`.  Clients can use
     * {@link Operations.GetOperation} or
     * other methods to check whether the cancellation succeeded or whether the
     * operation completed despite cancellation. On successful cancellation,
     * the operation is not deleted; instead, it becomes an operation with
     * an {@link Operation.error} value with a {@link google.rpc.Status.code} of
     * 1, corresponding to `Code.CANCELLED`.
     *
     * @param {Object} request - The request object that will be sent.
     * @param {string} request.name - The name of the operation resource to be cancelled.
     * @param {Object=} options
     *   Optional parameters. You can override the default settings for this call,
     * e.g, timeout, retries, paginations, etc. See [gax.CallOptions]{@link
     * https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the
     * details.
     * @param {function(?Error)=} callback
     *   The function which will be called with the result of the API call.
     * @return {Promise} - The promise which resolves when API call finishes.
     *   The promise has a method named "cancel" which cancels the ongoing API
     * call.
     *
     * @example
     * ```
     * const client = longrunning.operationsClient();
     * await client.cancelOperation({name: ''});
     * ```
     */
    cancelOperation(request: protos.google.longrunning.CancelOperationRequest, options?: gax.CallOptions | Callback<protos.google.protobuf.Empty, protos.google.longrunning.CancelOperationRequest, {} | undefined | null>, callback?: Callback<protos.google.longrunning.CancelOperationRequest, protos.google.protobuf.Empty, {} | undefined | null>): Promise<protos.google.protobuf.Empty>;
    /**
     * Deletes a long-running operation. This method indicates that the client is
     * no longer interested in the operation result. It does not cancel the
     * operation. If the server doesn't support this method, it returns
     * `google.rpc.Code.UNIMPLEMENTED`.
     *
     * @param {Object} request - The request object that will be sent.
     * @param {string} request.name - The name of the operation resource to be deleted.
     * @param {Object=} options
     *   Optional parameters. You can override the default settings for this call,
     * e.g, timeout, retries, paginations, etc. See [gax.CallOptions]{@link
     * https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the
     * details.
     * @param {function(?Error)=} callback
     *   The function which will be called with the result of the API call.
     * @return {Promise} - The promise which resolves when API call finishes.
     *   The promise has a method named "cancel" which cancels the ongoing API
     * call.
     *
     * @example
     * ```
     * const client = longrunning.operationsClient();
     * await client.deleteOperation({name: ''});
     * ```
     */
    deleteOperation(request: protos.google.longrunning.DeleteOperationRequest, options?: gax.CallOptions | Callback<protos.google.protobuf.Empty, protos.google.longrunning.DeleteOperationRequest, {} | null | undefined>, callback?: Callback<protos.google.protobuf.Empty, protos.google.longrunning.DeleteOperationRequest, {} | null | undefined>): Promise<protos.google.protobuf.Empty>;
    /**
     * Return a fully-qualified location resource name string.
     *
     * @param {string} project
     * @param {string} location
     * @returns {string} Resource name string.
     */
    locationPath(project: string, location: string): string;
    /**
     * Parse the project from Location resource.
     *
     * @param {string} locationName
     *   A fully-qualified path representing Location resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromLocationName(locationName: string): string | number;
    /**
     * Parse the location from Location resource.
     *
     * @param {string} locationName
     *   A fully-qualified path representing Location resource.
     * @returns {string} A string representing the location.
     */
    matchLocationFromLocationName(locationName: string): string | number;
    /**
     * Return a fully-qualified optimizer resource name string.
     *
     * @param {string} project
     * @param {string} location
     * @param {string} workspace
     * @param {string} optimizer
     * @returns {string} Resource name string.
     */
    optimizerPath(project: string, location: string, workspace: string, optimizer: string): string;
    /**
     * Parse the project from Optimizer resource.
     *
     * @param {string} optimizerName
     *   A fully-qualified path representing Optimizer resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromOptimizerName(optimizerName: string): string | number;
    /**
     * Parse the location from Optimizer resource.
     *
     * @param {string} optimizerName
     *   A fully-qualified path representing Optimizer resource.
     * @returns {string} A string representing the location.
     */
    matchLocationFromOptimizerName(optimizerName: string): string | number;
    /**
     * Parse the workspace from Optimizer resource.
     *
     * @param {string} optimizerName
     *   A fully-qualified path representing Optimizer resource.
     * @returns {string} A string representing the workspace.
     */
    matchWorkspaceFromOptimizerName(optimizerName: string): string | number;
    /**
     * Parse the optimizer from Optimizer resource.
     *
     * @param {string} optimizerName
     *   A fully-qualified path representing Optimizer resource.
     * @returns {string} A string representing the optimizer.
     */
    matchOptimizerFromOptimizerName(optimizerName: string): string | number;
    /**
     * Return a fully-qualified project resource name string.
     *
     * @param {string} project
     * @returns {string} Resource name string.
     */
    projectPath(project: string): string;
    /**
     * Parse the project from Project resource.
     *
     * @param {string} projectName
     *   A fully-qualified path representing Project resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromProjectName(projectName: string): string | number;
    /**
     * Return a fully-qualified shipment resource name string.
     *
     * @param {string} project
     * @param {string} location
     * @param {string} workspace
     * @param {string} shipment
     * @returns {string} Resource name string.
     */
    shipmentPath(project: string, location: string, workspace: string, shipment: string): string;
    /**
     * Parse the project from Shipment resource.
     *
     * @param {string} shipmentName
     *   A fully-qualified path representing Shipment resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromShipmentName(shipmentName: string): string | number;
    /**
     * Parse the location from Shipment resource.
     *
     * @param {string} shipmentName
     *   A fully-qualified path representing Shipment resource.
     * @returns {string} A string representing the location.
     */
    matchLocationFromShipmentName(shipmentName: string): string | number;
    /**
     * Parse the workspace from Shipment resource.
     *
     * @param {string} shipmentName
     *   A fully-qualified path representing Shipment resource.
     * @returns {string} A string representing the workspace.
     */
    matchWorkspaceFromShipmentName(shipmentName: string): string | number;
    /**
     * Parse the shipment from Shipment resource.
     *
     * @param {string} shipmentName
     *   A fully-qualified path representing Shipment resource.
     * @returns {string} A string representing the shipment.
     */
    matchShipmentFromShipmentName(shipmentName: string): string | number;
    /**
     * Return a fully-qualified solution resource name string.
     *
     * @param {string} project
     * @param {string} location
     * @param {string} workspace
     * @param {string} solution
     * @returns {string} Resource name string.
     */
    solutionPath(project: string, location: string, workspace: string, solution: string): string;
    /**
     * Parse the project from Solution resource.
     *
     * @param {string} solutionName
     *   A fully-qualified path representing Solution resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromSolutionName(solutionName: string): string | number;
    /**
     * Parse the location from Solution resource.
     *
     * @param {string} solutionName
     *   A fully-qualified path representing Solution resource.
     * @returns {string} A string representing the location.
     */
    matchLocationFromSolutionName(solutionName: string): string | number;
    /**
     * Parse the workspace from Solution resource.
     *
     * @param {string} solutionName
     *   A fully-qualified path representing Solution resource.
     * @returns {string} A string representing the workspace.
     */
    matchWorkspaceFromSolutionName(solutionName: string): string | number;
    /**
     * Parse the solution from Solution resource.
     *
     * @param {string} solutionName
     *   A fully-qualified path representing Solution resource.
     * @returns {string} A string representing the solution.
     */
    matchSolutionFromSolutionName(solutionName: string): string | number;
    /**
     * Return a fully-qualified vehicle resource name string.
     *
     * @param {string} project
     * @param {string} location
     * @param {string} workspace
     * @param {string} vehicle
     * @returns {string} Resource name string.
     */
    vehiclePath(project: string, location: string, workspace: string, vehicle: string): string;
    /**
     * Parse the project from Vehicle resource.
     *
     * @param {string} vehicleName
     *   A fully-qualified path representing Vehicle resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromVehicleName(vehicleName: string): string | number;
    /**
     * Parse the location from Vehicle resource.
     *
     * @param {string} vehicleName
     *   A fully-qualified path representing Vehicle resource.
     * @returns {string} A string representing the location.
     */
    matchLocationFromVehicleName(vehicleName: string): string | number;
    /**
     * Parse the workspace from Vehicle resource.
     *
     * @param {string} vehicleName
     *   A fully-qualified path representing Vehicle resource.
     * @returns {string} A string representing the workspace.
     */
    matchWorkspaceFromVehicleName(vehicleName: string): string | number;
    /**
     * Parse the vehicle from Vehicle resource.
     *
     * @param {string} vehicleName
     *   A fully-qualified path representing Vehicle resource.
     * @returns {string} A string representing the vehicle.
     */
    matchVehicleFromVehicleName(vehicleName: string): string | number;
    /**
     * Return a fully-qualified workspace resource name string.
     *
     * @param {string} project
     * @param {string} location
     * @param {string} workspace
     * @returns {string} Resource name string.
     */
    workspacePath(project: string, location: string, workspace: string): string;
    /**
     * Parse the project from Workspace resource.
     *
     * @param {string} workspaceName
     *   A fully-qualified path representing Workspace resource.
     * @returns {string} A string representing the project.
     */
    matchProjectFromWorkspaceName(workspaceName: string): string | number;
    /**
     * Parse the location from Workspace resource.
     *
     * @param {string} workspaceName
     *   A fully-qualified path representing Workspace resource.
     * @returns {string} A string representing the location.
     */
    matchLocationFromWorkspaceName(workspaceName: string): string | number;
    /**
     * Parse the workspace from Workspace resource.
     *
     * @param {string} workspaceName
     *   A fully-qualified path representing Workspace resource.
     * @returns {string} A string representing the workspace.
     */
    matchWorkspaceFromWorkspaceName(workspaceName: string): string | number;
    /**
     * Terminate the gRPC channel and close the client.
     *
     * The client will no longer be usable and all future behavior is undefined.
     * @returns {Promise} A promise that resolves when the client is closed.
     */
    close(): Promise<void>;
}
