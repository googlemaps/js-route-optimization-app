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
import type * as gax from 'google-gax';
import type { Callback, CallOptions, Descriptors, ClientOptions, LROperation } from 'google-gax';
import * as protos from '../../protos/protos';
/**
 *  A service for optimizing vehicle tours.
 *
 *  Validity of certain types of fields:
 *
 *    * `google.protobuf.Timestamp`
 *      * Times are in Unix time: seconds since 1970-01-01T00:00:00+00:00.
 *      * seconds must be in [0, 253402300799],
 *        i.e. in [1970-01-01T00:00:00+00:00, 9999-12-31T23:59:59+00:00].
 *      * nanos must be unset or set to 0.
 *    * `google.protobuf.Duration`
 *      * seconds must be in [0, 253402300799],
 *        i.e. in [1970-01-01T00:00:00+00:00, 9999-12-31T23:59:59+00:00].
 *      * nanos must be unset or set to 0.
 *    * `google.type.LatLng`
 *      * latitude must be in [-90.0, 90.0].
 *      * longitude must be in [-180.0, 180.0].
 *      * at least one of latitude and longitude must be non-zero.
 * @class
 * @memberof v1
 */
export declare class FleetRoutingClient {
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
    fleetRoutingStub?: Promise<{
        [name: string]: Function;
    }>;
    /**
     * Construct an instance of FleetRoutingClient.
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
     *     const client = new FleetRoutingClient({fallback: 'rest'}, gax);
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
     * Sends an `OptimizeToursRequest` containing a `ShipmentModel` and returns an
     * `OptimizeToursResponse` containing `ShipmentRoute`s, which are a set of
     * routes to be performed by vehicles minimizing the overall cost.
     *
     * A `ShipmentModel` model consists mainly of `Shipment`s that need to be
     * carried out and `Vehicle`s that can be used to transport the `Shipment`s.
     * The `ShipmentRoute`s assign `Shipment`s to `Vehicle`s. More specifically,
     * they assign a series of `Visit`s to each vehicle, where a `Visit`
     * corresponds to a `VisitRequest`, which is a pickup or delivery for a
     * `Shipment`.
     *
     * The goal is to provide an assignment of `ShipmentRoute`s to `Vehicle`s that
     * minimizes the total cost where cost has many components defined in the
     * `ShipmentModel`.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. Target project and location to make a call.
     *
     *   Format: `projects/{project-id}/locations/{location-id}`.
     *
     *   If no location is specified, a region will be chosen automatically.
     * @param {google.protobuf.Duration} request.timeout
     *   If this timeout is set, the server returns a response before the timeout
     *   period has elapsed or the server deadline for synchronous requests is
     *   reached, whichever is sooner.
     *
     *   For asynchronous requests, the server will generate a solution (if
     *   possible) before the timeout has elapsed.
     * @param {google.cloud.optimization.v1.ShipmentModel} request.model
     *   Shipment model to solve.
     * @param {google.cloud.optimization.v1.OptimizeToursRequest.SolvingMode} request.solvingMode
     *   By default, the solving mode is `DEFAULT_SOLVE` (0).
     * @param {number} request.maxValidationErrors
     *   Truncates the number of validation errors returned. These errors are
     *   typically attached to an INVALID_ARGUMENT error payload as a BadRequest
     *   error detail (https://cloud.google.com/apis/design/errors#error_details),
     *   unless solving_mode=VALIDATE_ONLY: see the
     *   {@link google.cloud.optimization.v1.OptimizeToursResponse.validation_errors|OptimizeToursResponse.validation_errors}
     *   field.
     *   This defaults to 100 and is capped at 10,000.
     * @param {google.cloud.optimization.v1.OptimizeToursRequest.SearchMode} request.searchMode
     *   Search mode used to solve the request.
     * @param {number[]} request.injectedFirstSolutionRoutes
     *   Guide the optimization algorithm in finding a first solution that is
     *   similar to a previous solution.
     *
     *   The model is constrained when the first solution is built.
     *   Any shipments not performed on a route are implicitly skipped in the first
     *   solution, but they may be performed in successive solutions.
     *
     *   The solution must satisfy some basic validity assumptions:
     *
     *     * for all routes, `vehicle_index` must be in range and not be duplicated.
     *     * for all visits, `shipment_index` and `visit_request_index` must be
     *       in range.
     *     * a shipment may only be referenced on one route.
     *     * the pickup of a pickup-delivery shipment must be performed before
     *       the delivery.
     *     * no more than one pickup alternative or delivery alternative of
     *       a shipment may be performed.
     *     * for all routes, times are increasing (i.e., `vehicle_start_time
     *       <= visits[0].start_time <= visits[1].start_time ...
     *       <= vehicle_end_time`).
     *     * a shipment may only be performed on a vehicle that is allowed. A
     *       vehicle is allowed if {@link google.cloud.optimization.v1.Shipment.allowed_vehicle_indices|Shipment.allowed_vehicle_indices} is empty or
     *       its `vehicle_index` is included in
     *       {@link google.cloud.optimization.v1.Shipment.allowed_vehicle_indices|Shipment.allowed_vehicle_indices}.
     *
     *   If the injected solution is not feasible, a validation error is not
     *   necessarily returned and an error indicating infeasibility may be returned
     *   instead.
     * @param {google.cloud.optimization.v1.InjectedSolutionConstraint} request.injectedSolutionConstraint
     *   Constrain the optimization algorithm to find a final solution that is
     *   similar to a previous solution. For example, this may be used to freeze
     *   portions of routes which have already been completed or which are to be
     *   completed but must not be modified.
     *
     *   If the injected solution is not feasible, a validation error is not
     *   necessarily returned and an error indicating infeasibility may be returned
     *   instead.
     * @param {number[]} request.refreshDetailsRoutes
     *   If non-empty, the given routes will be refreshed, without modifying their
     *   underlying sequence of visits or travel times: only other details will be
     *   updated. This does not solve the model.
     *
     *   As of 2020/11, this only populates the polylines of non-empty routes and
     *   requires that `populate_polylines` is true.
     *
     *   The `route_polyline` fields of the passed-in routes may be inconsistent
     *   with route `transitions`.
     *
     *   This field must not be used together with `injected_first_solution_routes`
     *   or `injected_solution_constraint`.
     *
     *   `Shipment.ignore` and `Vehicle.ignore` have no effect on the behavior.
     *   Polylines are still populated between all visits in all non-empty routes
     *   regardless of whether the related shipments or vehicles are ignored.
     * @param {boolean} request.interpretInjectedSolutionsUsingLabels
     *   If true:
     *
     *     * uses {@link google.cloud.optimization.v1.ShipmentRoute.vehicle_label|ShipmentRoute.vehicle_label} instead of `vehicle_index` to
     *       match routes in an injected solution with vehicles in the request;
     *       reuses the mapping of original {@link google.cloud.optimization.v1.ShipmentRoute.vehicle_index|ShipmentRoute.vehicle_index} to new
     *       {@link google.cloud.optimization.v1.ShipmentRoute.vehicle_index|ShipmentRoute.vehicle_index} to update
     *       {@link google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.vehicle_indices|ConstraintRelaxation.vehicle_indices}
     *       if non-empty, but the mapping must be unambiguous (i.e., multiple
     *       `ShipmentRoute`s must not share the same original `vehicle_index`).
     *     * uses {@link google.cloud.optimization.v1.ShipmentRoute.Visit.shipment_label|ShipmentRoute.Visit.shipment_label} instead of `shipment_index`
     *       to match visits in an injected solution with shipments in the request;
     *     * uses {@link google.cloud.optimization.v1.SkippedShipment.label|SkippedShipment.label} instead of {@link google.cloud.optimization.v1.SkippedShipment.index|SkippedShipment.index} to
     *       match skipped shipments in the injected solution with request
     *       shipments.
     *
     *   This interpretation applies to the `injected_first_solution_routes`,
     *   `injected_solution_constraint`, and `refresh_details_routes` fields.
     *   It can be used when shipment or vehicle indices in the request have
     *   changed since the solution was created, perhaps because shipments or
     *   vehicles have been removed from or added to the request.
     *
     *   If true, labels in the following categories must appear at most once in
     *   their category:
     *
     *     * {@link google.cloud.optimization.v1.Vehicle.label|Vehicle.label} in the request;
     *     * {@link google.cloud.optimization.v1.Shipment.label|Shipment.label} in the request;
     *     * {@link google.cloud.optimization.v1.ShipmentRoute.vehicle_label|ShipmentRoute.vehicle_label} in the injected solution;
     *     * {@link google.cloud.optimization.v1.SkippedShipment.label|SkippedShipment.label} and {@link google.cloud.optimization.v1.ShipmentRoute.Visit.shipment_label|ShipmentRoute.Visit.shipment_label} in
     *       the injected solution (except pickup/delivery visit pairs, whose
     *       `shipment_label` must appear twice).
     *
     *   If a `vehicle_label` in the injected solution does not correspond to a
     *   request vehicle, the corresponding route is removed from the solution
     *   along with its visits. If a `shipment_label` in the injected solution does
     *   not correspond to a request shipment, the corresponding visit is removed
     *   from the solution. If a {@link google.cloud.optimization.v1.SkippedShipment.label|SkippedShipment.label} in the injected solution
     *   does not correspond to a request shipment, the `SkippedShipment` is removed
     *   from the solution.
     *
     *   Removing route visits or entire routes from an injected solution may
     *   have an effect on the implied constraints, which may lead to change in
     *   solution, validation errors, or infeasibility.
     *
     *   NOTE: The caller must ensure that each {@link google.cloud.optimization.v1.Vehicle.label|Vehicle.label}
     *   (resp. {@link google.cloud.optimization.v1.Shipment.label|Shipment.label}) uniquely identifies a vehicle (resp. shipment)
     *   entity used across the two relevant requests: the past request that
     *   produced the `OptimizeToursResponse` used in the injected solution and the
     *   current request that includes the injected solution. The uniqueness checks
     *   described above are not enough to guarantee this requirement.
     * @param {boolean} request.considerRoadTraffic
     *   Consider traffic estimation in calculating `ShipmentRoute` fields
     *   {@link google.cloud.optimization.v1.ShipmentRoute.Transition.travel_duration|Transition.travel_duration},
     *   {@link google.cloud.optimization.v1.ShipmentRoute.Visit.start_time|Visit.start_time},
     *   and `vehicle_end_time`; in setting the
     *   {@link google.cloud.optimization.v1.ShipmentRoute.has_traffic_infeasibilities|ShipmentRoute.has_traffic_infeasibilities} field, and in calculating the
     *   {@link google.cloud.optimization.v1.OptimizeToursResponse.total_cost|OptimizeToursResponse.total_cost} field.
     * @param {boolean} request.populatePolylines
     *   If true, polylines will be populated in response `ShipmentRoute`s.
     * @param {boolean} request.populateTransitionPolylines
     *   If true, polylines will be populated in response
     *   {@link google.cloud.optimization.v1.ShipmentRoute.transitions|ShipmentRoute.transitions}.
     *   Note that in this case, the polylines will also be populated in the
     *   deprecated `travel_steps`.
     * @param {boolean} request.allowLargeDeadlineDespiteInterruptionRisk
     *   If this is set, then the request can have a deadline
     *   (see https://grpc.io/blog/deadlines) of up to 60 minutes.
     *   Otherwise, the maximum deadline is only 30 minutes.
     *   Note that long-lived requests have a significantly larger (but still small)
     *   risk of interruption.
     * @param {boolean} request.useGeodesicDistances
     *   If true, travel distances will be computed using geodesic distances instead
     *   of Google Maps distances, and travel times will be computed using geodesic
     *   distances with a speed defined by `geodesic_meters_per_second`.
     * @param {number} request.geodesicMetersPerSecond
     *   When `use_geodesic_distances` is true, this field must be set and defines
     *   the speed applied to compute travel times. Its value must be at least 1.0
     *   meters/seconds.
     * @param {string} request.label
     *   Label that may be used to identify this request, reported back in the
     *   {@link google.cloud.optimization.v1.OptimizeToursResponse.request_label|OptimizeToursResponse.request_label}.
     * @param {string} request.internalParameters
     *   Advanced internal parameters used to configure the behavior of the service.
     *   Please contact your Google representative for its usage.
     * @param {boolean} request.populateTravelStepPolylines
     *   Deprecated: Use {@link google.cloud.optimization.v1.OptimizeToursRequest.populate_transition_polylines|OptimizeToursRequest.populate_transition_polylines}
     *   instead. If true, polylines will be populated in response
     *   {@link google.cloud.optimization.v1.ShipmentRoute.transitions|ShipmentRoute.transitions}. Note that in this case, the polylines will
     *   also be populated in the deprecated `travel_steps`.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing [OptimizeToursResponse]{@link google.cloud.optimization.v1.OptimizeToursResponse}.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#regular-methods)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/fleet_routing.optimize_tours.js</caption>
     * region_tag:cloudoptimization_v1_generated_FleetRouting_OptimizeTours_async
     */
    optimizeTours(request?: protos.google.cloud.optimization.v1.IOptimizeToursRequest, options?: CallOptions): Promise<[
        protos.google.cloud.optimization.v1.IOptimizeToursResponse,
        protos.google.cloud.optimization.v1.IOptimizeToursRequest | undefined,
        {} | undefined
    ]>;
    optimizeTours(request: protos.google.cloud.optimization.v1.IOptimizeToursRequest, options: CallOptions, callback: Callback<protos.google.cloud.optimization.v1.IOptimizeToursResponse, protos.google.cloud.optimization.v1.IOptimizeToursRequest | null | undefined, {} | null | undefined>): void;
    optimizeTours(request: protos.google.cloud.optimization.v1.IOptimizeToursRequest, callback: Callback<protos.google.cloud.optimization.v1.IOptimizeToursResponse, protos.google.cloud.optimization.v1.IOptimizeToursRequest | null | undefined, {} | null | undefined>): void;
    /**
     * Optimizes vehicle tours for one or more `OptimizeToursRequest`
     * messages as a batch.
     *
     * This method is a Long Running Operation (LRO). The inputs for optimization
     * (`OptimizeToursRequest` messages) and outputs (`OptimizeToursResponse`
     * messages) are read/written from/to Cloud Storage in user-specified
     * format. Like the `OptimizeTours` method, each `OptimizeToursRequest`
     * contains a `ShipmentModel` and returns an `OptimizeToursResponse`
     * containing `ShipmentRoute`s, which are a set of routes to be performed by
     * vehicles minimizing the overall cost.
     *
     * @param {Object} request
     *   The request object that will be sent.
     * @param {string} request.parent
     *   Required. Target project and location to make a call.
     *
     *   Format: `projects/{project-id}/locations/{location-id}`.
     *
     *   If no location is specified, a region will be chosen automatically.
     * @param {number[]} request.modelConfigs
     *   Required. Input/Output information each purchase model, such as file paths and data
     *   formats.
     * @param {object} [options]
     *   Call options. See {@link https://googleapis.dev/nodejs/google-gax/latest/interfaces/CallOptions.html|CallOptions} for more details.
     * @returns {Promise} - The promise which resolves to an array.
     *   The first element of the array is an object representing
     *   a long running operation. Its `promise()` method returns a promise
     *   you can `await` for.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/fleet_routing.batch_optimize_tours.js</caption>
     * region_tag:cloudoptimization_v1_generated_FleetRouting_BatchOptimizeTours_async
     */
    batchOptimizeTours(request?: protos.google.cloud.optimization.v1.IBatchOptimizeToursRequest, options?: CallOptions): Promise<[
        LROperation<protos.google.cloud.optimization.v1.IBatchOptimizeToursResponse, protos.google.cloud.optimization.v1.IAsyncModelMetadata>,
        protos.google.longrunning.IOperation | undefined,
        {} | undefined
    ]>;
    batchOptimizeTours(request: protos.google.cloud.optimization.v1.IBatchOptimizeToursRequest, options: CallOptions, callback: Callback<LROperation<protos.google.cloud.optimization.v1.IBatchOptimizeToursResponse, protos.google.cloud.optimization.v1.IAsyncModelMetadata>, protos.google.longrunning.IOperation | null | undefined, {} | null | undefined>): void;
    batchOptimizeTours(request: protos.google.cloud.optimization.v1.IBatchOptimizeToursRequest, callback: Callback<LROperation<protos.google.cloud.optimization.v1.IBatchOptimizeToursResponse, protos.google.cloud.optimization.v1.IAsyncModelMetadata>, protos.google.longrunning.IOperation | null | undefined, {} | null | undefined>): void;
    /**
     * Check the status of the long running operation returned by `batchOptimizeTours()`.
     * @param {String} name
     *   The operation name that will be passed.
     * @returns {Promise} - The promise which resolves to an object.
     *   The decoded operation object has result and metadata field to get information from.
     *   Please see the
     *   [documentation](https://github.com/googleapis/gax-nodejs/blob/master/client-libraries.md#long-running-operations)
     *   for more details and examples.
     * @example <caption>include:samples/generated/v1/fleet_routing.batch_optimize_tours.js</caption>
     * region_tag:cloudoptimization_v1_generated_FleetRouting_BatchOptimizeTours_async
     */
    checkBatchOptimizeToursProgress(name: string): Promise<LROperation<protos.google.cloud.optimization.v1.BatchOptimizeToursResponse, protos.google.cloud.optimization.v1.AsyncModelMetadata>>;
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
