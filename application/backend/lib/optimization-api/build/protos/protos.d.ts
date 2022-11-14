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

import type {protobuf as $protobuf} from "google-gax";
import Long = require("long");
/** Namespace google. */
export namespace google {

    /** Namespace cloud. */
    namespace cloud {

        /** Namespace optimization. */
        namespace optimization {

            /** Namespace v1. */
            namespace v1 {

                /** Properties of an InputConfig. */
                interface IInputConfig {

                    /** InputConfig gcsSource */
                    gcsSource?: (google.cloud.optimization.v1.IGcsSource|null);

                    /** InputConfig dataFormat */
                    dataFormat?: (google.cloud.optimization.v1.DataFormat|keyof typeof google.cloud.optimization.v1.DataFormat|null);
                }

                /** Represents an InputConfig. */
                class InputConfig implements IInputConfig {

                    /**
                     * Constructs a new InputConfig.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IInputConfig);

                    /** InputConfig gcsSource. */
                    public gcsSource?: (google.cloud.optimization.v1.IGcsSource|null);

                    /** InputConfig dataFormat. */
                    public dataFormat: (google.cloud.optimization.v1.DataFormat|keyof typeof google.cloud.optimization.v1.DataFormat);

                    /** InputConfig source. */
                    public source?: "gcsSource";

                    /**
                     * Creates a new InputConfig instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns InputConfig instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IInputConfig): google.cloud.optimization.v1.InputConfig;

                    /**
                     * Encodes the specified InputConfig message. Does not implicitly {@link google.cloud.optimization.v1.InputConfig.verify|verify} messages.
                     * @param message InputConfig message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IInputConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified InputConfig message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.InputConfig.verify|verify} messages.
                     * @param message InputConfig message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IInputConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an InputConfig message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns InputConfig
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.InputConfig;

                    /**
                     * Decodes an InputConfig message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns InputConfig
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.InputConfig;

                    /**
                     * Verifies an InputConfig message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an InputConfig message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns InputConfig
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.InputConfig;

                    /**
                     * Creates a plain object from an InputConfig message. Also converts values to other types if specified.
                     * @param message InputConfig
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.InputConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this InputConfig to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for InputConfig
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an OutputConfig. */
                interface IOutputConfig {

                    /** OutputConfig gcsDestination */
                    gcsDestination?: (google.cloud.optimization.v1.IGcsDestination|null);

                    /** OutputConfig dataFormat */
                    dataFormat?: (google.cloud.optimization.v1.DataFormat|keyof typeof google.cloud.optimization.v1.DataFormat|null);
                }

                /** Represents an OutputConfig. */
                class OutputConfig implements IOutputConfig {

                    /**
                     * Constructs a new OutputConfig.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IOutputConfig);

                    /** OutputConfig gcsDestination. */
                    public gcsDestination?: (google.cloud.optimization.v1.IGcsDestination|null);

                    /** OutputConfig dataFormat. */
                    public dataFormat: (google.cloud.optimization.v1.DataFormat|keyof typeof google.cloud.optimization.v1.DataFormat);

                    /** OutputConfig destination. */
                    public destination?: "gcsDestination";

                    /**
                     * Creates a new OutputConfig instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns OutputConfig instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IOutputConfig): google.cloud.optimization.v1.OutputConfig;

                    /**
                     * Encodes the specified OutputConfig message. Does not implicitly {@link google.cloud.optimization.v1.OutputConfig.verify|verify} messages.
                     * @param message OutputConfig message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IOutputConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified OutputConfig message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.OutputConfig.verify|verify} messages.
                     * @param message OutputConfig message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IOutputConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an OutputConfig message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns OutputConfig
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.OutputConfig;

                    /**
                     * Decodes an OutputConfig message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns OutputConfig
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.OutputConfig;

                    /**
                     * Verifies an OutputConfig message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an OutputConfig message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns OutputConfig
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.OutputConfig;

                    /**
                     * Creates a plain object from an OutputConfig message. Also converts values to other types if specified.
                     * @param message OutputConfig
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.OutputConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this OutputConfig to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for OutputConfig
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GcsSource. */
                interface IGcsSource {

                    /** GcsSource uri */
                    uri?: (string|null);
                }

                /** Represents a GcsSource. */
                class GcsSource implements IGcsSource {

                    /**
                     * Constructs a new GcsSource.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IGcsSource);

                    /** GcsSource uri. */
                    public uri: string;

                    /**
                     * Creates a new GcsSource instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GcsSource instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IGcsSource): google.cloud.optimization.v1.GcsSource;

                    /**
                     * Encodes the specified GcsSource message. Does not implicitly {@link google.cloud.optimization.v1.GcsSource.verify|verify} messages.
                     * @param message GcsSource message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IGcsSource, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GcsSource message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.GcsSource.verify|verify} messages.
                     * @param message GcsSource message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IGcsSource, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GcsSource message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GcsSource
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.GcsSource;

                    /**
                     * Decodes a GcsSource message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GcsSource
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.GcsSource;

                    /**
                     * Verifies a GcsSource message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GcsSource message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GcsSource
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.GcsSource;

                    /**
                     * Creates a plain object from a GcsSource message. Also converts values to other types if specified.
                     * @param message GcsSource
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.GcsSource, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GcsSource to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GcsSource
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GcsDestination. */
                interface IGcsDestination {

                    /** GcsDestination uri */
                    uri?: (string|null);
                }

                /** Represents a GcsDestination. */
                class GcsDestination implements IGcsDestination {

                    /**
                     * Constructs a new GcsDestination.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IGcsDestination);

                    /** GcsDestination uri. */
                    public uri: string;

                    /**
                     * Creates a new GcsDestination instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GcsDestination instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IGcsDestination): google.cloud.optimization.v1.GcsDestination;

                    /**
                     * Encodes the specified GcsDestination message. Does not implicitly {@link google.cloud.optimization.v1.GcsDestination.verify|verify} messages.
                     * @param message GcsDestination message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IGcsDestination, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GcsDestination message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.GcsDestination.verify|verify} messages.
                     * @param message GcsDestination message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IGcsDestination, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GcsDestination message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GcsDestination
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.GcsDestination;

                    /**
                     * Decodes a GcsDestination message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GcsDestination
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.GcsDestination;

                    /**
                     * Verifies a GcsDestination message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GcsDestination message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GcsDestination
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.GcsDestination;

                    /**
                     * Creates a plain object from a GcsDestination message. Also converts values to other types if specified.
                     * @param message GcsDestination
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.GcsDestination, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GcsDestination to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GcsDestination
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an AsyncModelMetadata. */
                interface IAsyncModelMetadata {

                    /** AsyncModelMetadata state */
                    state?: (google.cloud.optimization.v1.AsyncModelMetadata.State|keyof typeof google.cloud.optimization.v1.AsyncModelMetadata.State|null);

                    /** AsyncModelMetadata stateMessage */
                    stateMessage?: (string|null);

                    /** AsyncModelMetadata createTime */
                    createTime?: (google.protobuf.ITimestamp|null);

                    /** AsyncModelMetadata updateTime */
                    updateTime?: (google.protobuf.ITimestamp|null);
                }

                /** Represents an AsyncModelMetadata. */
                class AsyncModelMetadata implements IAsyncModelMetadata {

                    /**
                     * Constructs a new AsyncModelMetadata.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IAsyncModelMetadata);

                    /** AsyncModelMetadata state. */
                    public state: (google.cloud.optimization.v1.AsyncModelMetadata.State|keyof typeof google.cloud.optimization.v1.AsyncModelMetadata.State);

                    /** AsyncModelMetadata stateMessage. */
                    public stateMessage: string;

                    /** AsyncModelMetadata createTime. */
                    public createTime?: (google.protobuf.ITimestamp|null);

                    /** AsyncModelMetadata updateTime. */
                    public updateTime?: (google.protobuf.ITimestamp|null);

                    /**
                     * Creates a new AsyncModelMetadata instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns AsyncModelMetadata instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IAsyncModelMetadata): google.cloud.optimization.v1.AsyncModelMetadata;

                    /**
                     * Encodes the specified AsyncModelMetadata message. Does not implicitly {@link google.cloud.optimization.v1.AsyncModelMetadata.verify|verify} messages.
                     * @param message AsyncModelMetadata message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IAsyncModelMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified AsyncModelMetadata message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.AsyncModelMetadata.verify|verify} messages.
                     * @param message AsyncModelMetadata message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IAsyncModelMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an AsyncModelMetadata message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns AsyncModelMetadata
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.AsyncModelMetadata;

                    /**
                     * Decodes an AsyncModelMetadata message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns AsyncModelMetadata
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.AsyncModelMetadata;

                    /**
                     * Verifies an AsyncModelMetadata message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an AsyncModelMetadata message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns AsyncModelMetadata
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.AsyncModelMetadata;

                    /**
                     * Creates a plain object from an AsyncModelMetadata message. Also converts values to other types if specified.
                     * @param message AsyncModelMetadata
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.AsyncModelMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this AsyncModelMetadata to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for AsyncModelMetadata
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace AsyncModelMetadata {

                    /** State enum. */
                    enum State {
                        STATE_UNSPECIFIED = 0,
                        RUNNING = 1,
                        SUCCEEDED = 2,
                        CANCELLED = 3,
                        FAILED = 4
                    }
                }

                /** DataFormat enum. */
                enum DataFormat {
                    DATA_FORMAT_UNSPECIFIED = 0,
                    JSON = 1,
                    STRING = 2
                }

                /** Represents a FleetRouting */
                class FleetRouting extends $protobuf.rpc.Service {

                    /**
                     * Constructs a new FleetRouting service.
                     * @param rpcImpl RPC implementation
                     * @param [requestDelimited=false] Whether requests are length-delimited
                     * @param [responseDelimited=false] Whether responses are length-delimited
                     */
                    constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                    /**
                     * Creates new FleetRouting service using the specified rpc implementation.
                     * @param rpcImpl RPC implementation
                     * @param [requestDelimited=false] Whether requests are length-delimited
                     * @param [responseDelimited=false] Whether responses are length-delimited
                     * @returns RPC service. Useful where requests and/or responses are streamed.
                     */
                    public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): FleetRouting;

                    /**
                     * Calls OptimizeTours.
                     * @param request OptimizeToursRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and OptimizeToursResponse
                     */
                    public optimizeTours(request: google.cloud.optimization.v1.IOptimizeToursRequest, callback: google.cloud.optimization.v1.FleetRouting.OptimizeToursCallback): void;

                    /**
                     * Calls OptimizeTours.
                     * @param request OptimizeToursRequest message or plain object
                     * @returns Promise
                     */
                    public optimizeTours(request: google.cloud.optimization.v1.IOptimizeToursRequest): Promise<google.cloud.optimization.v1.OptimizeToursResponse>;

                    /**
                     * Calls BatchOptimizeTours.
                     * @param request BatchOptimizeToursRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Operation
                     */
                    public batchOptimizeTours(request: google.cloud.optimization.v1.IBatchOptimizeToursRequest, callback: google.cloud.optimization.v1.FleetRouting.BatchOptimizeToursCallback): void;

                    /**
                     * Calls BatchOptimizeTours.
                     * @param request BatchOptimizeToursRequest message or plain object
                     * @returns Promise
                     */
                    public batchOptimizeTours(request: google.cloud.optimization.v1.IBatchOptimizeToursRequest): Promise<google.longrunning.Operation>;
                }

                namespace FleetRouting {

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.FleetRouting|optimizeTours}.
                     * @param error Error, if any
                     * @param [response] OptimizeToursResponse
                     */
                    type OptimizeToursCallback = (error: (Error|null), response?: google.cloud.optimization.v1.OptimizeToursResponse) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.FleetRouting|batchOptimizeTours}.
                     * @param error Error, if any
                     * @param [response] Operation
                     */
                    type BatchOptimizeToursCallback = (error: (Error|null), response?: google.longrunning.Operation) => void;
                }

                /** Properties of an OptimizeToursRequest. */
                interface IOptimizeToursRequest {

                    /** OptimizeToursRequest parent */
                    parent?: (string|null);

                    /** OptimizeToursRequest timeout */
                    timeout?: (google.protobuf.IDuration|null);

                    /** OptimizeToursRequest model */
                    model?: (google.cloud.optimization.v1.IShipmentModel|null);

                    /** OptimizeToursRequest solvingMode */
                    solvingMode?: (google.cloud.optimization.v1.OptimizeToursRequest.SolvingMode|keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SolvingMode|null);

                    /** OptimizeToursRequest maxValidationErrors */
                    maxValidationErrors?: (number|null);

                    /** OptimizeToursRequest searchMode */
                    searchMode?: (google.cloud.optimization.v1.OptimizeToursRequest.SearchMode|keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SearchMode|null);

                    /** OptimizeToursRequest injectedFirstSolutionRoutes */
                    injectedFirstSolutionRoutes?: (google.cloud.optimization.v1.IShipmentRoute[]|null);

                    /** OptimizeToursRequest injectedSolutionConstraint */
                    injectedSolutionConstraint?: (google.cloud.optimization.v1.IInjectedSolutionConstraint|null);

                    /** OptimizeToursRequest refreshDetailsRoutes */
                    refreshDetailsRoutes?: (google.cloud.optimization.v1.IShipmentRoute[]|null);

                    /** OptimizeToursRequest interpretInjectedSolutionsUsingLabels */
                    interpretInjectedSolutionsUsingLabels?: (boolean|null);

                    /** OptimizeToursRequest considerRoadTraffic */
                    considerRoadTraffic?: (boolean|null);

                    /** OptimizeToursRequest populatePolylines */
                    populatePolylines?: (boolean|null);

                    /** OptimizeToursRequest populateTransitionPolylines */
                    populateTransitionPolylines?: (boolean|null);

                    /** OptimizeToursRequest allowLargeDeadlineDespiteInterruptionRisk */
                    allowLargeDeadlineDespiteInterruptionRisk?: (boolean|null);

                    /** OptimizeToursRequest useGeodesicDistances */
                    useGeodesicDistances?: (boolean|null);

                    /** OptimizeToursRequest geodesicMetersPerSecond */
                    geodesicMetersPerSecond?: (number|null);

                    /** OptimizeToursRequest label */
                    label?: (string|null);

                    /** OptimizeToursRequest internalParameters */
                    internalParameters?: (string|null);

                    /** OptimizeToursRequest populateTravelStepPolylines */
                    populateTravelStepPolylines?: (boolean|null);
                }

                /** Represents an OptimizeToursRequest. */
                class OptimizeToursRequest implements IOptimizeToursRequest {

                    /**
                     * Constructs a new OptimizeToursRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IOptimizeToursRequest);

                    /** OptimizeToursRequest parent. */
                    public parent: string;

                    /** OptimizeToursRequest timeout. */
                    public timeout?: (google.protobuf.IDuration|null);

                    /** OptimizeToursRequest model. */
                    public model?: (google.cloud.optimization.v1.IShipmentModel|null);

                    /** OptimizeToursRequest solvingMode. */
                    public solvingMode: (google.cloud.optimization.v1.OptimizeToursRequest.SolvingMode|keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SolvingMode);

                    /** OptimizeToursRequest maxValidationErrors. */
                    public maxValidationErrors?: (number|null);

                    /** OptimizeToursRequest searchMode. */
                    public searchMode: (google.cloud.optimization.v1.OptimizeToursRequest.SearchMode|keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SearchMode);

                    /** OptimizeToursRequest injectedFirstSolutionRoutes. */
                    public injectedFirstSolutionRoutes: google.cloud.optimization.v1.IShipmentRoute[];

                    /** OptimizeToursRequest injectedSolutionConstraint. */
                    public injectedSolutionConstraint?: (google.cloud.optimization.v1.IInjectedSolutionConstraint|null);

                    /** OptimizeToursRequest refreshDetailsRoutes. */
                    public refreshDetailsRoutes: google.cloud.optimization.v1.IShipmentRoute[];

                    /** OptimizeToursRequest interpretInjectedSolutionsUsingLabels. */
                    public interpretInjectedSolutionsUsingLabels: boolean;

                    /** OptimizeToursRequest considerRoadTraffic. */
                    public considerRoadTraffic: boolean;

                    /** OptimizeToursRequest populatePolylines. */
                    public populatePolylines: boolean;

                    /** OptimizeToursRequest populateTransitionPolylines. */
                    public populateTransitionPolylines: boolean;

                    /** OptimizeToursRequest allowLargeDeadlineDespiteInterruptionRisk. */
                    public allowLargeDeadlineDespiteInterruptionRisk: boolean;

                    /** OptimizeToursRequest useGeodesicDistances. */
                    public useGeodesicDistances: boolean;

                    /** OptimizeToursRequest geodesicMetersPerSecond. */
                    public geodesicMetersPerSecond?: (number|null);

                    /** OptimizeToursRequest label. */
                    public label: string;

                    /** OptimizeToursRequest internalParameters. */
                    public internalParameters: string;

                    /** OptimizeToursRequest populateTravelStepPolylines. */
                    public populateTravelStepPolylines: boolean;

                    /** OptimizeToursRequest _maxValidationErrors. */
                    public _maxValidationErrors?: "maxValidationErrors";

                    /** OptimizeToursRequest _geodesicMetersPerSecond. */
                    public _geodesicMetersPerSecond?: "geodesicMetersPerSecond";

                    /**
                     * Creates a new OptimizeToursRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns OptimizeToursRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IOptimizeToursRequest): google.cloud.optimization.v1.OptimizeToursRequest;

                    /**
                     * Encodes the specified OptimizeToursRequest message. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursRequest.verify|verify} messages.
                     * @param message OptimizeToursRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IOptimizeToursRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified OptimizeToursRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursRequest.verify|verify} messages.
                     * @param message OptimizeToursRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IOptimizeToursRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an OptimizeToursRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns OptimizeToursRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.OptimizeToursRequest;

                    /**
                     * Decodes an OptimizeToursRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns OptimizeToursRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.OptimizeToursRequest;

                    /**
                     * Verifies an OptimizeToursRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an OptimizeToursRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns OptimizeToursRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.OptimizeToursRequest;

                    /**
                     * Creates a plain object from an OptimizeToursRequest message. Also converts values to other types if specified.
                     * @param message OptimizeToursRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.OptimizeToursRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this OptimizeToursRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for OptimizeToursRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace OptimizeToursRequest {

                    /** SolvingMode enum. */
                    enum SolvingMode {
                        DEFAULT_SOLVE = 0,
                        VALIDATE_ONLY = 1,
                        DETECT_SOME_INFEASIBLE_SHIPMENTS = 2
                    }

                    /** SearchMode enum. */
                    enum SearchMode {
                        SEARCH_MODE_UNSPECIFIED = 0,
                        RETURN_FAST = 1,
                        CONSUME_ALL_AVAILABLE_TIME = 2
                    }
                }

                /** Properties of an OptimizeToursResponse. */
                interface IOptimizeToursResponse {

                    /** OptimizeToursResponse routes */
                    routes?: (google.cloud.optimization.v1.IShipmentRoute[]|null);

                    /** OptimizeToursResponse requestLabel */
                    requestLabel?: (string|null);

                    /** OptimizeToursResponse skippedShipments */
                    skippedShipments?: (google.cloud.optimization.v1.ISkippedShipment[]|null);

                    /** OptimizeToursResponse validationErrors */
                    validationErrors?: (google.cloud.optimization.v1.IOptimizeToursValidationError[]|null);

                    /** OptimizeToursResponse metrics */
                    metrics?: (google.cloud.optimization.v1.OptimizeToursResponse.IMetrics|null);

                    /** OptimizeToursResponse totalCost */
                    totalCost?: (number|null);
                }

                /** Represents an OptimizeToursResponse. */
                class OptimizeToursResponse implements IOptimizeToursResponse {

                    /**
                     * Constructs a new OptimizeToursResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IOptimizeToursResponse);

                    /** OptimizeToursResponse routes. */
                    public routes: google.cloud.optimization.v1.IShipmentRoute[];

                    /** OptimizeToursResponse requestLabel. */
                    public requestLabel: string;

                    /** OptimizeToursResponse skippedShipments. */
                    public skippedShipments: google.cloud.optimization.v1.ISkippedShipment[];

                    /** OptimizeToursResponse validationErrors. */
                    public validationErrors: google.cloud.optimization.v1.IOptimizeToursValidationError[];

                    /** OptimizeToursResponse metrics. */
                    public metrics?: (google.cloud.optimization.v1.OptimizeToursResponse.IMetrics|null);

                    /** OptimizeToursResponse totalCost. */
                    public totalCost: number;

                    /**
                     * Creates a new OptimizeToursResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns OptimizeToursResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IOptimizeToursResponse): google.cloud.optimization.v1.OptimizeToursResponse;

                    /**
                     * Encodes the specified OptimizeToursResponse message. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursResponse.verify|verify} messages.
                     * @param message OptimizeToursResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IOptimizeToursResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified OptimizeToursResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursResponse.verify|verify} messages.
                     * @param message OptimizeToursResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IOptimizeToursResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an OptimizeToursResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns OptimizeToursResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.OptimizeToursResponse;

                    /**
                     * Decodes an OptimizeToursResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns OptimizeToursResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.OptimizeToursResponse;

                    /**
                     * Verifies an OptimizeToursResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an OptimizeToursResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns OptimizeToursResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.OptimizeToursResponse;

                    /**
                     * Creates a plain object from an OptimizeToursResponse message. Also converts values to other types if specified.
                     * @param message OptimizeToursResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.OptimizeToursResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this OptimizeToursResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for OptimizeToursResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace OptimizeToursResponse {

                    /** Properties of a Metrics. */
                    interface IMetrics {

                        /** Metrics aggregatedRouteMetrics */
                        aggregatedRouteMetrics?: (google.cloud.optimization.v1.IAggregatedMetrics|null);

                        /** Metrics skippedMandatoryShipmentCount */
                        skippedMandatoryShipmentCount?: (number|null);

                        /** Metrics usedVehicleCount */
                        usedVehicleCount?: (number|null);

                        /** Metrics earliestVehicleStartTime */
                        earliestVehicleStartTime?: (google.protobuf.ITimestamp|null);

                        /** Metrics latestVehicleEndTime */
                        latestVehicleEndTime?: (google.protobuf.ITimestamp|null);

                        /** Metrics costs */
                        costs?: ({ [k: string]: number }|null);

                        /** Metrics totalCost */
                        totalCost?: (number|null);

                        /** Metrics minVehicleFullness */
                        minVehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);

                        /** Metrics avgVehicleFullness */
                        avgVehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);

                        /** Metrics maxVehicleFullness */
                        maxVehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);
                    }

                    /** Represents a Metrics. */
                    class Metrics implements IMetrics {

                        /**
                         * Constructs a new Metrics.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.OptimizeToursResponse.IMetrics);

                        /** Metrics aggregatedRouteMetrics. */
                        public aggregatedRouteMetrics?: (google.cloud.optimization.v1.IAggregatedMetrics|null);

                        /** Metrics skippedMandatoryShipmentCount. */
                        public skippedMandatoryShipmentCount: number;

                        /** Metrics usedVehicleCount. */
                        public usedVehicleCount: number;

                        /** Metrics earliestVehicleStartTime. */
                        public earliestVehicleStartTime?: (google.protobuf.ITimestamp|null);

                        /** Metrics latestVehicleEndTime. */
                        public latestVehicleEndTime?: (google.protobuf.ITimestamp|null);

                        /** Metrics costs. */
                        public costs: { [k: string]: number };

                        /** Metrics totalCost. */
                        public totalCost: number;

                        /** Metrics minVehicleFullness. */
                        public minVehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);

                        /** Metrics avgVehicleFullness. */
                        public avgVehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);

                        /** Metrics maxVehicleFullness. */
                        public maxVehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);

                        /**
                         * Creates a new Metrics instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Metrics instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.OptimizeToursResponse.IMetrics): google.cloud.optimization.v1.OptimizeToursResponse.Metrics;

                        /**
                         * Encodes the specified Metrics message. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursResponse.Metrics.verify|verify} messages.
                         * @param message Metrics message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.OptimizeToursResponse.IMetrics, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Metrics message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursResponse.Metrics.verify|verify} messages.
                         * @param message Metrics message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.OptimizeToursResponse.IMetrics, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Metrics message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Metrics
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.OptimizeToursResponse.Metrics;

                        /**
                         * Decodes a Metrics message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Metrics
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.OptimizeToursResponse.Metrics;

                        /**
                         * Verifies a Metrics message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Metrics message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Metrics
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.OptimizeToursResponse.Metrics;

                        /**
                         * Creates a plain object from a Metrics message. Also converts values to other types if specified.
                         * @param message Metrics
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.OptimizeToursResponse.Metrics, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Metrics to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Metrics
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a BatchOptimizeToursRequest. */
                interface IBatchOptimizeToursRequest {

                    /** BatchOptimizeToursRequest parent */
                    parent?: (string|null);

                    /** BatchOptimizeToursRequest modelConfigs */
                    modelConfigs?: (google.cloud.optimization.v1.BatchOptimizeToursRequest.IAsyncModelConfig[]|null);
                }

                /** Represents a BatchOptimizeToursRequest. */
                class BatchOptimizeToursRequest implements IBatchOptimizeToursRequest {

                    /**
                     * Constructs a new BatchOptimizeToursRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IBatchOptimizeToursRequest);

                    /** BatchOptimizeToursRequest parent. */
                    public parent: string;

                    /** BatchOptimizeToursRequest modelConfigs. */
                    public modelConfigs: google.cloud.optimization.v1.BatchOptimizeToursRequest.IAsyncModelConfig[];

                    /**
                     * Creates a new BatchOptimizeToursRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns BatchOptimizeToursRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IBatchOptimizeToursRequest): google.cloud.optimization.v1.BatchOptimizeToursRequest;

                    /**
                     * Encodes the specified BatchOptimizeToursRequest message. Does not implicitly {@link google.cloud.optimization.v1.BatchOptimizeToursRequest.verify|verify} messages.
                     * @param message BatchOptimizeToursRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IBatchOptimizeToursRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified BatchOptimizeToursRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.BatchOptimizeToursRequest.verify|verify} messages.
                     * @param message BatchOptimizeToursRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IBatchOptimizeToursRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a BatchOptimizeToursRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns BatchOptimizeToursRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.BatchOptimizeToursRequest;

                    /**
                     * Decodes a BatchOptimizeToursRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns BatchOptimizeToursRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.BatchOptimizeToursRequest;

                    /**
                     * Verifies a BatchOptimizeToursRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a BatchOptimizeToursRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns BatchOptimizeToursRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.BatchOptimizeToursRequest;

                    /**
                     * Creates a plain object from a BatchOptimizeToursRequest message. Also converts values to other types if specified.
                     * @param message BatchOptimizeToursRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.BatchOptimizeToursRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this BatchOptimizeToursRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for BatchOptimizeToursRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace BatchOptimizeToursRequest {

                    /** Properties of an AsyncModelConfig. */
                    interface IAsyncModelConfig {

                        /** AsyncModelConfig displayName */
                        displayName?: (string|null);

                        /** AsyncModelConfig inputConfig */
                        inputConfig?: (google.cloud.optimization.v1.IInputConfig|null);

                        /** AsyncModelConfig outputConfig */
                        outputConfig?: (google.cloud.optimization.v1.IOutputConfig|null);

                        /** AsyncModelConfig enableCheckpoints */
                        enableCheckpoints?: (boolean|null);
                    }

                    /** Represents an AsyncModelConfig. */
                    class AsyncModelConfig implements IAsyncModelConfig {

                        /**
                         * Constructs a new AsyncModelConfig.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.BatchOptimizeToursRequest.IAsyncModelConfig);

                        /** AsyncModelConfig displayName. */
                        public displayName: string;

                        /** AsyncModelConfig inputConfig. */
                        public inputConfig?: (google.cloud.optimization.v1.IInputConfig|null);

                        /** AsyncModelConfig outputConfig. */
                        public outputConfig?: (google.cloud.optimization.v1.IOutputConfig|null);

                        /** AsyncModelConfig enableCheckpoints. */
                        public enableCheckpoints: boolean;

                        /**
                         * Creates a new AsyncModelConfig instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns AsyncModelConfig instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.BatchOptimizeToursRequest.IAsyncModelConfig): google.cloud.optimization.v1.BatchOptimizeToursRequest.AsyncModelConfig;

                        /**
                         * Encodes the specified AsyncModelConfig message. Does not implicitly {@link google.cloud.optimization.v1.BatchOptimizeToursRequest.AsyncModelConfig.verify|verify} messages.
                         * @param message AsyncModelConfig message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.BatchOptimizeToursRequest.IAsyncModelConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified AsyncModelConfig message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.BatchOptimizeToursRequest.AsyncModelConfig.verify|verify} messages.
                         * @param message AsyncModelConfig message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.BatchOptimizeToursRequest.IAsyncModelConfig, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an AsyncModelConfig message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns AsyncModelConfig
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.BatchOptimizeToursRequest.AsyncModelConfig;

                        /**
                         * Decodes an AsyncModelConfig message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns AsyncModelConfig
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.BatchOptimizeToursRequest.AsyncModelConfig;

                        /**
                         * Verifies an AsyncModelConfig message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an AsyncModelConfig message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns AsyncModelConfig
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.BatchOptimizeToursRequest.AsyncModelConfig;

                        /**
                         * Creates a plain object from an AsyncModelConfig message. Also converts values to other types if specified.
                         * @param message AsyncModelConfig
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.BatchOptimizeToursRequest.AsyncModelConfig, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this AsyncModelConfig to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for AsyncModelConfig
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a BatchOptimizeToursResponse. */
                interface IBatchOptimizeToursResponse {
                }

                /** Represents a BatchOptimizeToursResponse. */
                class BatchOptimizeToursResponse implements IBatchOptimizeToursResponse {

                    /**
                     * Constructs a new BatchOptimizeToursResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IBatchOptimizeToursResponse);

                    /**
                     * Creates a new BatchOptimizeToursResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns BatchOptimizeToursResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IBatchOptimizeToursResponse): google.cloud.optimization.v1.BatchOptimizeToursResponse;

                    /**
                     * Encodes the specified BatchOptimizeToursResponse message. Does not implicitly {@link google.cloud.optimization.v1.BatchOptimizeToursResponse.verify|verify} messages.
                     * @param message BatchOptimizeToursResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IBatchOptimizeToursResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified BatchOptimizeToursResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.BatchOptimizeToursResponse.verify|verify} messages.
                     * @param message BatchOptimizeToursResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IBatchOptimizeToursResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a BatchOptimizeToursResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns BatchOptimizeToursResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.BatchOptimizeToursResponse;

                    /**
                     * Decodes a BatchOptimizeToursResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns BatchOptimizeToursResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.BatchOptimizeToursResponse;

                    /**
                     * Verifies a BatchOptimizeToursResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a BatchOptimizeToursResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns BatchOptimizeToursResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.BatchOptimizeToursResponse;

                    /**
                     * Creates a plain object from a BatchOptimizeToursResponse message. Also converts values to other types if specified.
                     * @param message BatchOptimizeToursResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.BatchOptimizeToursResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this BatchOptimizeToursResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for BatchOptimizeToursResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ShipmentModel. */
                interface IShipmentModel {

                    /** ShipmentModel shipments */
                    shipments?: (google.cloud.optimization.v1.IShipment[]|null);

                    /** ShipmentModel vehicles */
                    vehicles?: (google.cloud.optimization.v1.IVehicle[]|null);

                    /** ShipmentModel vehicleOperators */
                    vehicleOperators?: (google.cloud.optimization.v1.IVehicleOperator[]|null);

                    /** ShipmentModel maxActiveVehicles */
                    maxActiveVehicles?: (number|null);

                    /** ShipmentModel globalStartTime */
                    globalStartTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentModel globalEndTime */
                    globalEndTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentModel globalDurationCostPerHour */
                    globalDurationCostPerHour?: (number|null);

                    /** ShipmentModel durationDistanceMatrices */
                    durationDistanceMatrices?: (google.cloud.optimization.v1.ShipmentModel.IDurationDistanceMatrix[]|null);

                    /** ShipmentModel durationDistanceMatrixSrcTags */
                    durationDistanceMatrixSrcTags?: (string[]|null);

                    /** ShipmentModel durationDistanceMatrixDstTags */
                    durationDistanceMatrixDstTags?: (string[]|null);

                    /** ShipmentModel transitionAttributes */
                    transitionAttributes?: (google.cloud.optimization.v1.ITransitionAttributes[]|null);

                    /** ShipmentModel shipmentTypeIncompatibilities */
                    shipmentTypeIncompatibilities?: (google.cloud.optimization.v1.IShipmentTypeIncompatibility[]|null);

                    /** ShipmentModel shipmentTypeRequirements */
                    shipmentTypeRequirements?: (google.cloud.optimization.v1.IShipmentTypeRequirement[]|null);

                    /** ShipmentModel precedenceRules */
                    precedenceRules?: (google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule[]|null);

                    /** ShipmentModel breakRules */
                    breakRules?: (google.cloud.optimization.v1.ShipmentModel.IBreakRule[]|null);
                }

                /** Represents a ShipmentModel. */
                class ShipmentModel implements IShipmentModel {

                    /**
                     * Constructs a new ShipmentModel.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IShipmentModel);

                    /** ShipmentModel shipments. */
                    public shipments: google.cloud.optimization.v1.IShipment[];

                    /** ShipmentModel vehicles. */
                    public vehicles: google.cloud.optimization.v1.IVehicle[];

                    /** ShipmentModel vehicleOperators. */
                    public vehicleOperators: google.cloud.optimization.v1.IVehicleOperator[];

                    /** ShipmentModel maxActiveVehicles. */
                    public maxActiveVehicles?: (number|null);

                    /** ShipmentModel globalStartTime. */
                    public globalStartTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentModel globalEndTime. */
                    public globalEndTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentModel globalDurationCostPerHour. */
                    public globalDurationCostPerHour: number;

                    /** ShipmentModel durationDistanceMatrices. */
                    public durationDistanceMatrices: google.cloud.optimization.v1.ShipmentModel.IDurationDistanceMatrix[];

                    /** ShipmentModel durationDistanceMatrixSrcTags. */
                    public durationDistanceMatrixSrcTags: string[];

                    /** ShipmentModel durationDistanceMatrixDstTags. */
                    public durationDistanceMatrixDstTags: string[];

                    /** ShipmentModel transitionAttributes. */
                    public transitionAttributes: google.cloud.optimization.v1.ITransitionAttributes[];

                    /** ShipmentModel shipmentTypeIncompatibilities. */
                    public shipmentTypeIncompatibilities: google.cloud.optimization.v1.IShipmentTypeIncompatibility[];

                    /** ShipmentModel shipmentTypeRequirements. */
                    public shipmentTypeRequirements: google.cloud.optimization.v1.IShipmentTypeRequirement[];

                    /** ShipmentModel precedenceRules. */
                    public precedenceRules: google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule[];

                    /** ShipmentModel breakRules. */
                    public breakRules: google.cloud.optimization.v1.ShipmentModel.IBreakRule[];

                    /** ShipmentModel _maxActiveVehicles. */
                    public _maxActiveVehicles?: "maxActiveVehicles";

                    /**
                     * Creates a new ShipmentModel instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ShipmentModel instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IShipmentModel): google.cloud.optimization.v1.ShipmentModel;

                    /**
                     * Encodes the specified ShipmentModel message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.verify|verify} messages.
                     * @param message ShipmentModel message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IShipmentModel, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ShipmentModel message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.verify|verify} messages.
                     * @param message ShipmentModel message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IShipmentModel, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ShipmentModel message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ShipmentModel
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentModel;

                    /**
                     * Decodes a ShipmentModel message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ShipmentModel
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentModel;

                    /**
                     * Verifies a ShipmentModel message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ShipmentModel message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ShipmentModel
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentModel;

                    /**
                     * Creates a plain object from a ShipmentModel message. Also converts values to other types if specified.
                     * @param message ShipmentModel
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ShipmentModel, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ShipmentModel to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ShipmentModel
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace ShipmentModel {

                    /** Properties of a DurationDistanceMatrix. */
                    interface IDurationDistanceMatrix {

                        /** DurationDistanceMatrix rows */
                        rows?: (google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.IRow[]|null);

                        /** DurationDistanceMatrix vehicleStartTag */
                        vehicleStartTag?: (string|null);
                    }

                    /** Represents a DurationDistanceMatrix. */
                    class DurationDistanceMatrix implements IDurationDistanceMatrix {

                        /**
                         * Constructs a new DurationDistanceMatrix.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentModel.IDurationDistanceMatrix);

                        /** DurationDistanceMatrix rows. */
                        public rows: google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.IRow[];

                        /** DurationDistanceMatrix vehicleStartTag. */
                        public vehicleStartTag: string;

                        /**
                         * Creates a new DurationDistanceMatrix instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns DurationDistanceMatrix instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentModel.IDurationDistanceMatrix): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix;

                        /**
                         * Encodes the specified DurationDistanceMatrix message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.verify|verify} messages.
                         * @param message DurationDistanceMatrix message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentModel.IDurationDistanceMatrix, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified DurationDistanceMatrix message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.verify|verify} messages.
                         * @param message DurationDistanceMatrix message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentModel.IDurationDistanceMatrix, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a DurationDistanceMatrix message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns DurationDistanceMatrix
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix;

                        /**
                         * Decodes a DurationDistanceMatrix message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns DurationDistanceMatrix
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix;

                        /**
                         * Verifies a DurationDistanceMatrix message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a DurationDistanceMatrix message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns DurationDistanceMatrix
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix;

                        /**
                         * Creates a plain object from a DurationDistanceMatrix message. Also converts values to other types if specified.
                         * @param message DurationDistanceMatrix
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this DurationDistanceMatrix to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for DurationDistanceMatrix
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    namespace DurationDistanceMatrix {

                        /** Properties of a Row. */
                        interface IRow {

                            /** Row durations */
                            durations?: (google.protobuf.IDuration[]|null);

                            /** Row meters */
                            meters?: (number[]|null);
                        }

                        /** Represents a Row. */
                        class Row implements IRow {

                            /**
                             * Constructs a new Row.
                             * @param [properties] Properties to set
                             */
                            constructor(properties?: google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.IRow);

                            /** Row durations. */
                            public durations: google.protobuf.IDuration[];

                            /** Row meters. */
                            public meters: number[];

                            /**
                             * Creates a new Row instance using the specified properties.
                             * @param [properties] Properties to set
                             * @returns Row instance
                             */
                            public static create(properties?: google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.IRow): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row;

                            /**
                             * Encodes the specified Row message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row.verify|verify} messages.
                             * @param message Row message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encode(message: google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.IRow, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Encodes the specified Row message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row.verify|verify} messages.
                             * @param message Row message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.IRow, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Decodes a Row message from the specified reader or buffer.
                             * @param reader Reader or buffer to decode from
                             * @param [length] Message length if known beforehand
                             * @returns Row
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row;

                            /**
                             * Decodes a Row message from the specified reader or buffer, length delimited.
                             * @param reader Reader or buffer to decode from
                             * @returns Row
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row;

                            /**
                             * Verifies a Row message.
                             * @param message Plain object to verify
                             * @returns `null` if valid, otherwise the reason why it is not
                             */
                            public static verify(message: { [k: string]: any }): (string|null);

                            /**
                             * Creates a Row message from a plain object. Also converts values to their respective internal types.
                             * @param object Plain object
                             * @returns Row
                             */
                            public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row;

                            /**
                             * Creates a plain object from a Row message. Also converts values to other types if specified.
                             * @param message Row
                             * @param [options] Conversion options
                             * @returns Plain object
                             */
                            public static toObject(message: google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row, options?: $protobuf.IConversionOptions): { [k: string]: any };

                            /**
                             * Converts this Row to JSON.
                             * @returns JSON object
                             */
                            public toJSON(): { [k: string]: any };

                            /**
                             * Gets the default type url for Row
                             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                             * @returns The default type url
                             */
                            public static getTypeUrl(typeUrlPrefix?: string): string;
                        }
                    }

                    /** Properties of a PrecedenceRule. */
                    interface IPrecedenceRule {

                        /** PrecedenceRule firstIndex */
                        firstIndex?: (number|null);

                        /** PrecedenceRule firstIsDelivery */
                        firstIsDelivery?: (boolean|null);

                        /** PrecedenceRule secondIndex */
                        secondIndex?: (number|null);

                        /** PrecedenceRule secondIsDelivery */
                        secondIsDelivery?: (boolean|null);

                        /** PrecedenceRule offsetDuration */
                        offsetDuration?: (google.protobuf.IDuration|null);
                    }

                    /** Represents a PrecedenceRule. */
                    class PrecedenceRule implements IPrecedenceRule {

                        /**
                         * Constructs a new PrecedenceRule.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule);

                        /** PrecedenceRule firstIndex. */
                        public firstIndex?: (number|null);

                        /** PrecedenceRule firstIsDelivery. */
                        public firstIsDelivery: boolean;

                        /** PrecedenceRule secondIndex. */
                        public secondIndex?: (number|null);

                        /** PrecedenceRule secondIsDelivery. */
                        public secondIsDelivery: boolean;

                        /** PrecedenceRule offsetDuration. */
                        public offsetDuration?: (google.protobuf.IDuration|null);

                        /** PrecedenceRule _firstIndex. */
                        public _firstIndex?: "firstIndex";

                        /** PrecedenceRule _secondIndex. */
                        public _secondIndex?: "secondIndex";

                        /**
                         * Creates a new PrecedenceRule instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns PrecedenceRule instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule): google.cloud.optimization.v1.ShipmentModel.PrecedenceRule;

                        /**
                         * Encodes the specified PrecedenceRule message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.PrecedenceRule.verify|verify} messages.
                         * @param message PrecedenceRule message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified PrecedenceRule message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.PrecedenceRule.verify|verify} messages.
                         * @param message PrecedenceRule message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a PrecedenceRule message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns PrecedenceRule
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentModel.PrecedenceRule;

                        /**
                         * Decodes a PrecedenceRule message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns PrecedenceRule
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentModel.PrecedenceRule;

                        /**
                         * Verifies a PrecedenceRule message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a PrecedenceRule message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns PrecedenceRule
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentModel.PrecedenceRule;

                        /**
                         * Creates a plain object from a PrecedenceRule message. Also converts values to other types if specified.
                         * @param message PrecedenceRule
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentModel.PrecedenceRule, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this PrecedenceRule to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for PrecedenceRule
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a BreakRule. */
                    interface IBreakRule {

                        /** BreakRule breakRequests */
                        breakRequests?: (google.cloud.optimization.v1.ShipmentModel.BreakRule.IBreakRequest[]|null);

                        /** BreakRule frequencyConstraints */
                        frequencyConstraints?: (google.cloud.optimization.v1.ShipmentModel.BreakRule.IFrequencyConstraint[]|null);
                    }

                    /** Represents a BreakRule. */
                    class BreakRule implements IBreakRule {

                        /**
                         * Constructs a new BreakRule.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentModel.IBreakRule);

                        /** BreakRule breakRequests. */
                        public breakRequests: google.cloud.optimization.v1.ShipmentModel.BreakRule.IBreakRequest[];

                        /** BreakRule frequencyConstraints. */
                        public frequencyConstraints: google.cloud.optimization.v1.ShipmentModel.BreakRule.IFrequencyConstraint[];

                        /**
                         * Creates a new BreakRule instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns BreakRule instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentModel.IBreakRule): google.cloud.optimization.v1.ShipmentModel.BreakRule;

                        /**
                         * Encodes the specified BreakRule message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.BreakRule.verify|verify} messages.
                         * @param message BreakRule message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentModel.IBreakRule, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified BreakRule message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.BreakRule.verify|verify} messages.
                         * @param message BreakRule message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentModel.IBreakRule, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a BreakRule message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns BreakRule
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentModel.BreakRule;

                        /**
                         * Decodes a BreakRule message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns BreakRule
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentModel.BreakRule;

                        /**
                         * Verifies a BreakRule message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a BreakRule message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns BreakRule
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentModel.BreakRule;

                        /**
                         * Creates a plain object from a BreakRule message. Also converts values to other types if specified.
                         * @param message BreakRule
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentModel.BreakRule, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this BreakRule to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for BreakRule
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    namespace BreakRule {

                        /** Properties of a BreakRequest. */
                        interface IBreakRequest {

                            /** BreakRequest earliestStartTime */
                            earliestStartTime?: (google.protobuf.ITimestamp|null);

                            /** BreakRequest latestStartTime */
                            latestStartTime?: (google.protobuf.ITimestamp|null);

                            /** BreakRequest minDuration */
                            minDuration?: (google.protobuf.IDuration|null);
                        }

                        /** Represents a BreakRequest. */
                        class BreakRequest implements IBreakRequest {

                            /**
                             * Constructs a new BreakRequest.
                             * @param [properties] Properties to set
                             */
                            constructor(properties?: google.cloud.optimization.v1.ShipmentModel.BreakRule.IBreakRequest);

                            /** BreakRequest earliestStartTime. */
                            public earliestStartTime?: (google.protobuf.ITimestamp|null);

                            /** BreakRequest latestStartTime. */
                            public latestStartTime?: (google.protobuf.ITimestamp|null);

                            /** BreakRequest minDuration. */
                            public minDuration?: (google.protobuf.IDuration|null);

                            /**
                             * Creates a new BreakRequest instance using the specified properties.
                             * @param [properties] Properties to set
                             * @returns BreakRequest instance
                             */
                            public static create(properties?: google.cloud.optimization.v1.ShipmentModel.BreakRule.IBreakRequest): google.cloud.optimization.v1.ShipmentModel.BreakRule.BreakRequest;

                            /**
                             * Encodes the specified BreakRequest message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.BreakRule.BreakRequest.verify|verify} messages.
                             * @param message BreakRequest message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encode(message: google.cloud.optimization.v1.ShipmentModel.BreakRule.IBreakRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Encodes the specified BreakRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.BreakRule.BreakRequest.verify|verify} messages.
                             * @param message BreakRequest message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentModel.BreakRule.IBreakRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Decodes a BreakRequest message from the specified reader or buffer.
                             * @param reader Reader or buffer to decode from
                             * @param [length] Message length if known beforehand
                             * @returns BreakRequest
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentModel.BreakRule.BreakRequest;

                            /**
                             * Decodes a BreakRequest message from the specified reader or buffer, length delimited.
                             * @param reader Reader or buffer to decode from
                             * @returns BreakRequest
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentModel.BreakRule.BreakRequest;

                            /**
                             * Verifies a BreakRequest message.
                             * @param message Plain object to verify
                             * @returns `null` if valid, otherwise the reason why it is not
                             */
                            public static verify(message: { [k: string]: any }): (string|null);

                            /**
                             * Creates a BreakRequest message from a plain object. Also converts values to their respective internal types.
                             * @param object Plain object
                             * @returns BreakRequest
                             */
                            public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentModel.BreakRule.BreakRequest;

                            /**
                             * Creates a plain object from a BreakRequest message. Also converts values to other types if specified.
                             * @param message BreakRequest
                             * @param [options] Conversion options
                             * @returns Plain object
                             */
                            public static toObject(message: google.cloud.optimization.v1.ShipmentModel.BreakRule.BreakRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                            /**
                             * Converts this BreakRequest to JSON.
                             * @returns JSON object
                             */
                            public toJSON(): { [k: string]: any };

                            /**
                             * Gets the default type url for BreakRequest
                             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                             * @returns The default type url
                             */
                            public static getTypeUrl(typeUrlPrefix?: string): string;
                        }

                        /** Properties of a FrequencyConstraint. */
                        interface IFrequencyConstraint {

                            /** FrequencyConstraint minBreakDuration */
                            minBreakDuration?: (google.protobuf.IDuration|null);

                            /** FrequencyConstraint maxInterBreakDuration */
                            maxInterBreakDuration?: (google.protobuf.IDuration|null);
                        }

                        /** Represents a FrequencyConstraint. */
                        class FrequencyConstraint implements IFrequencyConstraint {

                            /**
                             * Constructs a new FrequencyConstraint.
                             * @param [properties] Properties to set
                             */
                            constructor(properties?: google.cloud.optimization.v1.ShipmentModel.BreakRule.IFrequencyConstraint);

                            /** FrequencyConstraint minBreakDuration. */
                            public minBreakDuration?: (google.protobuf.IDuration|null);

                            /** FrequencyConstraint maxInterBreakDuration. */
                            public maxInterBreakDuration?: (google.protobuf.IDuration|null);

                            /**
                             * Creates a new FrequencyConstraint instance using the specified properties.
                             * @param [properties] Properties to set
                             * @returns FrequencyConstraint instance
                             */
                            public static create(properties?: google.cloud.optimization.v1.ShipmentModel.BreakRule.IFrequencyConstraint): google.cloud.optimization.v1.ShipmentModel.BreakRule.FrequencyConstraint;

                            /**
                             * Encodes the specified FrequencyConstraint message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.BreakRule.FrequencyConstraint.verify|verify} messages.
                             * @param message FrequencyConstraint message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encode(message: google.cloud.optimization.v1.ShipmentModel.BreakRule.IFrequencyConstraint, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Encodes the specified FrequencyConstraint message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentModel.BreakRule.FrequencyConstraint.verify|verify} messages.
                             * @param message FrequencyConstraint message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentModel.BreakRule.IFrequencyConstraint, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Decodes a FrequencyConstraint message from the specified reader or buffer.
                             * @param reader Reader or buffer to decode from
                             * @param [length] Message length if known beforehand
                             * @returns FrequencyConstraint
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentModel.BreakRule.FrequencyConstraint;

                            /**
                             * Decodes a FrequencyConstraint message from the specified reader or buffer, length delimited.
                             * @param reader Reader or buffer to decode from
                             * @returns FrequencyConstraint
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentModel.BreakRule.FrequencyConstraint;

                            /**
                             * Verifies a FrequencyConstraint message.
                             * @param message Plain object to verify
                             * @returns `null` if valid, otherwise the reason why it is not
                             */
                            public static verify(message: { [k: string]: any }): (string|null);

                            /**
                             * Creates a FrequencyConstraint message from a plain object. Also converts values to their respective internal types.
                             * @param object Plain object
                             * @returns FrequencyConstraint
                             */
                            public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentModel.BreakRule.FrequencyConstraint;

                            /**
                             * Creates a plain object from a FrequencyConstraint message. Also converts values to other types if specified.
                             * @param message FrequencyConstraint
                             * @param [options] Conversion options
                             * @returns Plain object
                             */
                            public static toObject(message: google.cloud.optimization.v1.ShipmentModel.BreakRule.FrequencyConstraint, options?: $protobuf.IConversionOptions): { [k: string]: any };

                            /**
                             * Converts this FrequencyConstraint to JSON.
                             * @returns JSON object
                             */
                            public toJSON(): { [k: string]: any };

                            /**
                             * Gets the default type url for FrequencyConstraint
                             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                             * @returns The default type url
                             */
                            public static getTypeUrl(typeUrlPrefix?: string): string;
                        }
                    }
                }

                /** Properties of a Shipment. */
                interface IShipment {

                    /** Shipment name */
                    name?: (string|null);

                    /** Shipment displayName */
                    displayName?: (string|null);

                    /** Shipment pickups */
                    pickups?: (google.cloud.optimization.v1.Shipment.IVisitRequest[]|null);

                    /** Shipment deliveries */
                    deliveries?: (google.cloud.optimization.v1.Shipment.IVisitRequest[]|null);

                    /** Shipment loadDemands */
                    loadDemands?: ({ [k: string]: google.cloud.optimization.v1.Shipment.ILoad }|null);

                    /** Shipment penaltyCost */
                    penaltyCost?: (number|null);

                    /** Shipment allowedVehicleIndices */
                    allowedVehicleIndices?: (number[]|null);

                    /** Shipment costsPerVehicle */
                    costsPerVehicle?: (number[]|null);

                    /** Shipment costsPerVehicleIndices */
                    costsPerVehicleIndices?: (number[]|null);

                    /** Shipment pickupToDeliveryRelativeDetourLimit */
                    pickupToDeliveryRelativeDetourLimit?: (number|null);

                    /** Shipment pickupToDeliveryAbsoluteDetourLimit */
                    pickupToDeliveryAbsoluteDetourLimit?: (google.protobuf.IDuration|null);

                    /** Shipment pickupToDeliveryTimeLimit */
                    pickupToDeliveryTimeLimit?: (google.protobuf.IDuration|null);

                    /** Shipment shipmentType */
                    shipmentType?: (string|null);

                    /** Shipment label */
                    label?: (string|null);

                    /** Shipment ignore */
                    ignore?: (boolean|null);

                    /** Shipment demands */
                    demands?: (google.cloud.optimization.v1.ICapacityQuantity[]|null);
                }

                /** Represents a Shipment. */
                class Shipment implements IShipment {

                    /**
                     * Constructs a new Shipment.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IShipment);

                    /** Shipment name. */
                    public name: string;

                    /** Shipment displayName. */
                    public displayName: string;

                    /** Shipment pickups. */
                    public pickups: google.cloud.optimization.v1.Shipment.IVisitRequest[];

                    /** Shipment deliveries. */
                    public deliveries: google.cloud.optimization.v1.Shipment.IVisitRequest[];

                    /** Shipment loadDemands. */
                    public loadDemands: { [k: string]: google.cloud.optimization.v1.Shipment.ILoad };

                    /** Shipment penaltyCost. */
                    public penaltyCost?: (number|null);

                    /** Shipment allowedVehicleIndices. */
                    public allowedVehicleIndices: number[];

                    /** Shipment costsPerVehicle. */
                    public costsPerVehicle: number[];

                    /** Shipment costsPerVehicleIndices. */
                    public costsPerVehicleIndices: number[];

                    /** Shipment pickupToDeliveryRelativeDetourLimit. */
                    public pickupToDeliveryRelativeDetourLimit?: (number|null);

                    /** Shipment pickupToDeliveryAbsoluteDetourLimit. */
                    public pickupToDeliveryAbsoluteDetourLimit?: (google.protobuf.IDuration|null);

                    /** Shipment pickupToDeliveryTimeLimit. */
                    public pickupToDeliveryTimeLimit?: (google.protobuf.IDuration|null);

                    /** Shipment shipmentType. */
                    public shipmentType: string;

                    /** Shipment label. */
                    public label: string;

                    /** Shipment ignore. */
                    public ignore: boolean;

                    /** Shipment demands. */
                    public demands: google.cloud.optimization.v1.ICapacityQuantity[];

                    /** Shipment _penaltyCost. */
                    public _penaltyCost?: "penaltyCost";

                    /** Shipment _pickupToDeliveryRelativeDetourLimit. */
                    public _pickupToDeliveryRelativeDetourLimit?: "pickupToDeliveryRelativeDetourLimit";

                    /**
                     * Creates a new Shipment instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Shipment instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IShipment): google.cloud.optimization.v1.Shipment;

                    /**
                     * Encodes the specified Shipment message. Does not implicitly {@link google.cloud.optimization.v1.Shipment.verify|verify} messages.
                     * @param message Shipment message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IShipment, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Shipment message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Shipment.verify|verify} messages.
                     * @param message Shipment message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IShipment, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Shipment message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Shipment
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Shipment;

                    /**
                     * Decodes a Shipment message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Shipment
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Shipment;

                    /**
                     * Verifies a Shipment message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Shipment message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Shipment
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Shipment;

                    /**
                     * Creates a plain object from a Shipment message. Also converts values to other types if specified.
                     * @param message Shipment
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.Shipment, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Shipment to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Shipment
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace Shipment {

                    /** Properties of a VisitRequest. */
                    interface IVisitRequest {

                        /** VisitRequest arrivalLocation */
                        arrivalLocation?: (google.type.ILatLng|null);

                        /** VisitRequest arrivalWaypoint */
                        arrivalWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                        /** VisitRequest departureLocation */
                        departureLocation?: (google.type.ILatLng|null);

                        /** VisitRequest departureWaypoint */
                        departureWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                        /** VisitRequest tags */
                        tags?: (string[]|null);

                        /** VisitRequest timeWindows */
                        timeWindows?: (google.cloud.optimization.v1.ITimeWindow[]|null);

                        /** VisitRequest duration */
                        duration?: (google.protobuf.IDuration|null);

                        /** VisitRequest cost */
                        cost?: (number|null);

                        /** VisitRequest loadDemands */
                        loadDemands?: ({ [k: string]: google.cloud.optimization.v1.Shipment.ILoad }|null);

                        /** VisitRequest visitTypes */
                        visitTypes?: (string[]|null);

                        /** VisitRequest label */
                        label?: (string|null);

                        /** VisitRequest demands */
                        demands?: (google.cloud.optimization.v1.ICapacityQuantity[]|null);
                    }

                    /** Represents a VisitRequest. */
                    class VisitRequest implements IVisitRequest {

                        /**
                         * Constructs a new VisitRequest.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Shipment.IVisitRequest);

                        /** VisitRequest arrivalLocation. */
                        public arrivalLocation?: (google.type.ILatLng|null);

                        /** VisitRequest arrivalWaypoint. */
                        public arrivalWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                        /** VisitRequest departureLocation. */
                        public departureLocation?: (google.type.ILatLng|null);

                        /** VisitRequest departureWaypoint. */
                        public departureWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                        /** VisitRequest tags. */
                        public tags: string[];

                        /** VisitRequest timeWindows. */
                        public timeWindows: google.cloud.optimization.v1.ITimeWindow[];

                        /** VisitRequest duration. */
                        public duration?: (google.protobuf.IDuration|null);

                        /** VisitRequest cost. */
                        public cost: number;

                        /** VisitRequest loadDemands. */
                        public loadDemands: { [k: string]: google.cloud.optimization.v1.Shipment.ILoad };

                        /** VisitRequest visitTypes. */
                        public visitTypes: string[];

                        /** VisitRequest label. */
                        public label: string;

                        /** VisitRequest demands. */
                        public demands: google.cloud.optimization.v1.ICapacityQuantity[];

                        /**
                         * Creates a new VisitRequest instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns VisitRequest instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Shipment.IVisitRequest): google.cloud.optimization.v1.Shipment.VisitRequest;

                        /**
                         * Encodes the specified VisitRequest message. Does not implicitly {@link google.cloud.optimization.v1.Shipment.VisitRequest.verify|verify} messages.
                         * @param message VisitRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Shipment.IVisitRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified VisitRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Shipment.VisitRequest.verify|verify} messages.
                         * @param message VisitRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Shipment.IVisitRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a VisitRequest message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns VisitRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Shipment.VisitRequest;

                        /**
                         * Decodes a VisitRequest message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns VisitRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Shipment.VisitRequest;

                        /**
                         * Verifies a VisitRequest message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a VisitRequest message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns VisitRequest
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Shipment.VisitRequest;

                        /**
                         * Creates a plain object from a VisitRequest message. Also converts values to other types if specified.
                         * @param message VisitRequest
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Shipment.VisitRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this VisitRequest to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for VisitRequest
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a Load. */
                    interface ILoad {

                        /** Load amount */
                        amount?: (number|Long|string|null);
                    }

                    /** Represents a Load. */
                    class Load implements ILoad {

                        /**
                         * Constructs a new Load.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Shipment.ILoad);

                        /** Load amount. */
                        public amount: (number|Long|string);

                        /**
                         * Creates a new Load instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Load instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Shipment.ILoad): google.cloud.optimization.v1.Shipment.Load;

                        /**
                         * Encodes the specified Load message. Does not implicitly {@link google.cloud.optimization.v1.Shipment.Load.verify|verify} messages.
                         * @param message Load message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Shipment.ILoad, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Load message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Shipment.Load.verify|verify} messages.
                         * @param message Load message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Shipment.ILoad, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Load message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Load
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Shipment.Load;

                        /**
                         * Decodes a Load message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Load
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Shipment.Load;

                        /**
                         * Verifies a Load message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Load message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Load
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Shipment.Load;

                        /**
                         * Creates a plain object from a Load message. Also converts values to other types if specified.
                         * @param message Load
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Shipment.Load, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Load to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Load
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a ShipmentTypeIncompatibility. */
                interface IShipmentTypeIncompatibility {

                    /** ShipmentTypeIncompatibility types */
                    types?: (string[]|null);

                    /** ShipmentTypeIncompatibility incompatibilityMode */
                    incompatibilityMode?: (google.cloud.optimization.v1.ShipmentTypeIncompatibility.IncompatibilityMode|keyof typeof google.cloud.optimization.v1.ShipmentTypeIncompatibility.IncompatibilityMode|null);
                }

                /** Represents a ShipmentTypeIncompatibility. */
                class ShipmentTypeIncompatibility implements IShipmentTypeIncompatibility {

                    /**
                     * Constructs a new ShipmentTypeIncompatibility.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IShipmentTypeIncompatibility);

                    /** ShipmentTypeIncompatibility types. */
                    public types: string[];

                    /** ShipmentTypeIncompatibility incompatibilityMode. */
                    public incompatibilityMode: (google.cloud.optimization.v1.ShipmentTypeIncompatibility.IncompatibilityMode|keyof typeof google.cloud.optimization.v1.ShipmentTypeIncompatibility.IncompatibilityMode);

                    /**
                     * Creates a new ShipmentTypeIncompatibility instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ShipmentTypeIncompatibility instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IShipmentTypeIncompatibility): google.cloud.optimization.v1.ShipmentTypeIncompatibility;

                    /**
                     * Encodes the specified ShipmentTypeIncompatibility message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentTypeIncompatibility.verify|verify} messages.
                     * @param message ShipmentTypeIncompatibility message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IShipmentTypeIncompatibility, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ShipmentTypeIncompatibility message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentTypeIncompatibility.verify|verify} messages.
                     * @param message ShipmentTypeIncompatibility message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IShipmentTypeIncompatibility, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ShipmentTypeIncompatibility message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ShipmentTypeIncompatibility
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentTypeIncompatibility;

                    /**
                     * Decodes a ShipmentTypeIncompatibility message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ShipmentTypeIncompatibility
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentTypeIncompatibility;

                    /**
                     * Verifies a ShipmentTypeIncompatibility message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ShipmentTypeIncompatibility message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ShipmentTypeIncompatibility
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentTypeIncompatibility;

                    /**
                     * Creates a plain object from a ShipmentTypeIncompatibility message. Also converts values to other types if specified.
                     * @param message ShipmentTypeIncompatibility
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ShipmentTypeIncompatibility, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ShipmentTypeIncompatibility to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ShipmentTypeIncompatibility
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace ShipmentTypeIncompatibility {

                    /** IncompatibilityMode enum. */
                    enum IncompatibilityMode {
                        INCOMPATIBILITY_MODE_UNSPECIFIED = 0,
                        NOT_PERFORMED_BY_SAME_VEHICLE = 1,
                        NOT_IN_SAME_VEHICLE_SIMULTANEOUSLY = 2
                    }
                }

                /** Properties of a ShipmentTypeRequirement. */
                interface IShipmentTypeRequirement {

                    /** ShipmentTypeRequirement requiredShipmentTypeAlternatives */
                    requiredShipmentTypeAlternatives?: (string[]|null);

                    /** ShipmentTypeRequirement dependentShipmentTypes */
                    dependentShipmentTypes?: (string[]|null);

                    /** ShipmentTypeRequirement requirementMode */
                    requirementMode?: (google.cloud.optimization.v1.ShipmentTypeRequirement.RequirementMode|keyof typeof google.cloud.optimization.v1.ShipmentTypeRequirement.RequirementMode|null);
                }

                /** Represents a ShipmentTypeRequirement. */
                class ShipmentTypeRequirement implements IShipmentTypeRequirement {

                    /**
                     * Constructs a new ShipmentTypeRequirement.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IShipmentTypeRequirement);

                    /** ShipmentTypeRequirement requiredShipmentTypeAlternatives. */
                    public requiredShipmentTypeAlternatives: string[];

                    /** ShipmentTypeRequirement dependentShipmentTypes. */
                    public dependentShipmentTypes: string[];

                    /** ShipmentTypeRequirement requirementMode. */
                    public requirementMode: (google.cloud.optimization.v1.ShipmentTypeRequirement.RequirementMode|keyof typeof google.cloud.optimization.v1.ShipmentTypeRequirement.RequirementMode);

                    /**
                     * Creates a new ShipmentTypeRequirement instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ShipmentTypeRequirement instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IShipmentTypeRequirement): google.cloud.optimization.v1.ShipmentTypeRequirement;

                    /**
                     * Encodes the specified ShipmentTypeRequirement message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentTypeRequirement.verify|verify} messages.
                     * @param message ShipmentTypeRequirement message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IShipmentTypeRequirement, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ShipmentTypeRequirement message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentTypeRequirement.verify|verify} messages.
                     * @param message ShipmentTypeRequirement message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IShipmentTypeRequirement, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ShipmentTypeRequirement message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ShipmentTypeRequirement
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentTypeRequirement;

                    /**
                     * Decodes a ShipmentTypeRequirement message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ShipmentTypeRequirement
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentTypeRequirement;

                    /**
                     * Verifies a ShipmentTypeRequirement message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ShipmentTypeRequirement message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ShipmentTypeRequirement
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentTypeRequirement;

                    /**
                     * Creates a plain object from a ShipmentTypeRequirement message. Also converts values to other types if specified.
                     * @param message ShipmentTypeRequirement
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ShipmentTypeRequirement, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ShipmentTypeRequirement to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ShipmentTypeRequirement
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace ShipmentTypeRequirement {

                    /** RequirementMode enum. */
                    enum RequirementMode {
                        REQUIREMENT_MODE_UNSPECIFIED = 0,
                        PERFORMED_BY_SAME_VEHICLE = 1,
                        IN_SAME_VEHICLE_AT_PICKUP_TIME = 2,
                        IN_SAME_VEHICLE_AT_DELIVERY_TIME = 3
                    }
                }

                /** Properties of a RouteModifiers. */
                interface IRouteModifiers {

                    /** RouteModifiers avoidTolls */
                    avoidTolls?: (boolean|null);

                    /** RouteModifiers avoidHighways */
                    avoidHighways?: (boolean|null);

                    /** RouteModifiers avoidFerries */
                    avoidFerries?: (boolean|null);
                }

                /** Represents a RouteModifiers. */
                class RouteModifiers implements IRouteModifiers {

                    /**
                     * Constructs a new RouteModifiers.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IRouteModifiers);

                    /** RouteModifiers avoidTolls. */
                    public avoidTolls: boolean;

                    /** RouteModifiers avoidHighways. */
                    public avoidHighways: boolean;

                    /** RouteModifiers avoidFerries. */
                    public avoidFerries: boolean;

                    /**
                     * Creates a new RouteModifiers instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RouteModifiers instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IRouteModifiers): google.cloud.optimization.v1.RouteModifiers;

                    /**
                     * Encodes the specified RouteModifiers message. Does not implicitly {@link google.cloud.optimization.v1.RouteModifiers.verify|verify} messages.
                     * @param message RouteModifiers message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IRouteModifiers, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RouteModifiers message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RouteModifiers.verify|verify} messages.
                     * @param message RouteModifiers message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IRouteModifiers, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RouteModifiers message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RouteModifiers
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RouteModifiers;

                    /**
                     * Decodes a RouteModifiers message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RouteModifiers
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RouteModifiers;

                    /**
                     * Verifies a RouteModifiers message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RouteModifiers message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RouteModifiers
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RouteModifiers;

                    /**
                     * Creates a plain object from a RouteModifiers message. Also converts values to other types if specified.
                     * @param message RouteModifiers
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.RouteModifiers, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RouteModifiers to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RouteModifiers
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RouteCommitments. */
                interface IRouteCommitments {

                    /** RouteCommitments routeStartTime */
                    routeStartTime?: (google.protobuf.ITimestamp|null);

                    /** RouteCommitments pastVisits */
                    pastVisits?: (google.cloud.optimization.v1.RouteCommitments.IVisit[]|null);

                    /** RouteCommitments nextVisits */
                    nextVisits?: (google.cloud.optimization.v1.RouteCommitments.IVisit[]|null);
                }

                /** Represents a RouteCommitments. */
                class RouteCommitments implements IRouteCommitments {

                    /**
                     * Constructs a new RouteCommitments.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IRouteCommitments);

                    /** RouteCommitments routeStartTime. */
                    public routeStartTime?: (google.protobuf.ITimestamp|null);

                    /** RouteCommitments pastVisits. */
                    public pastVisits: google.cloud.optimization.v1.RouteCommitments.IVisit[];

                    /** RouteCommitments nextVisits. */
                    public nextVisits: google.cloud.optimization.v1.RouteCommitments.IVisit[];

                    /** RouteCommitments _routeStartTime. */
                    public _routeStartTime?: "routeStartTime";

                    /**
                     * Creates a new RouteCommitments instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RouteCommitments instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IRouteCommitments): google.cloud.optimization.v1.RouteCommitments;

                    /**
                     * Encodes the specified RouteCommitments message. Does not implicitly {@link google.cloud.optimization.v1.RouteCommitments.verify|verify} messages.
                     * @param message RouteCommitments message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IRouteCommitments, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RouteCommitments message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RouteCommitments.verify|verify} messages.
                     * @param message RouteCommitments message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IRouteCommitments, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RouteCommitments message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RouteCommitments
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RouteCommitments;

                    /**
                     * Decodes a RouteCommitments message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RouteCommitments
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RouteCommitments;

                    /**
                     * Verifies a RouteCommitments message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RouteCommitments message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RouteCommitments
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RouteCommitments;

                    /**
                     * Creates a plain object from a RouteCommitments message. Also converts values to other types if specified.
                     * @param message RouteCommitments
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.RouteCommitments, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RouteCommitments to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RouteCommitments
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace RouteCommitments {

                    /** Properties of a Visit. */
                    interface IVisit {

                        /** Visit shipmentName */
                        shipmentName?: (string|null);

                        /** Visit isPickup */
                        isPickup?: (boolean|null);

                        /** Visit visitRequestIndex */
                        visitRequestIndex?: (number|null);

                        /** Visit startTime */
                        startTime?: (google.protobuf.ITimestamp|null);
                    }

                    /** Represents a Visit. */
                    class Visit implements IVisit {

                        /**
                         * Constructs a new Visit.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.RouteCommitments.IVisit);

                        /** Visit shipmentName. */
                        public shipmentName: string;

                        /** Visit isPickup. */
                        public isPickup: boolean;

                        /** Visit visitRequestIndex. */
                        public visitRequestIndex: number;

                        /** Visit startTime. */
                        public startTime?: (google.protobuf.ITimestamp|null);

                        /** Visit _startTime. */
                        public _startTime?: "startTime";

                        /**
                         * Creates a new Visit instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Visit instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.RouteCommitments.IVisit): google.cloud.optimization.v1.RouteCommitments.Visit;

                        /**
                         * Encodes the specified Visit message. Does not implicitly {@link google.cloud.optimization.v1.RouteCommitments.Visit.verify|verify} messages.
                         * @param message Visit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.RouteCommitments.IVisit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Visit message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RouteCommitments.Visit.verify|verify} messages.
                         * @param message Visit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.RouteCommitments.IVisit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Visit message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Visit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RouteCommitments.Visit;

                        /**
                         * Decodes a Visit message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Visit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RouteCommitments.Visit;

                        /**
                         * Verifies a Visit message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Visit message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Visit
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RouteCommitments.Visit;

                        /**
                         * Creates a plain object from a Visit message. Also converts values to other types if specified.
                         * @param message Visit
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.RouteCommitments.Visit, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Visit to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Visit
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a Vehicle. */
                interface IVehicle {

                    /** Vehicle name */
                    name?: (string|null);

                    /** Vehicle displayName */
                    displayName?: (string|null);

                    /** Vehicle travelMode */
                    travelMode?: (google.cloud.optimization.v1.Vehicle.TravelMode|keyof typeof google.cloud.optimization.v1.Vehicle.TravelMode|null);

                    /** Vehicle routeModifiers */
                    routeModifiers?: (google.cloud.optimization.v1.IRouteModifiers|null);

                    /** Vehicle startLocation */
                    startLocation?: (google.type.ILatLng|null);

                    /** Vehicle startWaypoint */
                    startWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                    /** Vehicle endLocation */
                    endLocation?: (google.type.ILatLng|null);

                    /** Vehicle endWaypoint */
                    endWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                    /** Vehicle startTags */
                    startTags?: (string[]|null);

                    /** Vehicle endTags */
                    endTags?: (string[]|null);

                    /** Vehicle startTimeWindows */
                    startTimeWindows?: (google.cloud.optimization.v1.ITimeWindow[]|null);

                    /** Vehicle endTimeWindows */
                    endTimeWindows?: (google.cloud.optimization.v1.ITimeWindow[]|null);

                    /** Vehicle travelDurationMultiple */
                    travelDurationMultiple?: (number|null);

                    /** Vehicle unloadingPolicy */
                    unloadingPolicy?: (google.cloud.optimization.v1.Vehicle.UnloadingPolicy|keyof typeof google.cloud.optimization.v1.Vehicle.UnloadingPolicy|null);

                    /** Vehicle loadLimits */
                    loadLimits?: ({ [k: string]: google.cloud.optimization.v1.Vehicle.ILoadLimit }|null);

                    /** Vehicle costPerHour */
                    costPerHour?: (number|null);

                    /** Vehicle costPerTraveledHour */
                    costPerTraveledHour?: (number|null);

                    /** Vehicle costPerKilometer */
                    costPerKilometer?: (number|null);

                    /** Vehicle fixedCost */
                    fixedCost?: (number|null);

                    /** Vehicle usedIfRouteIsEmpty */
                    usedIfRouteIsEmpty?: (boolean|null);

                    /** Vehicle routeDurationLimit */
                    routeDurationLimit?: (google.cloud.optimization.v1.Vehicle.IDurationLimit|null);

                    /** Vehicle travelDurationLimit */
                    travelDurationLimit?: (google.cloud.optimization.v1.Vehicle.IDurationLimit|null);

                    /** Vehicle routeDistanceLimit */
                    routeDistanceLimit?: (google.cloud.optimization.v1.IDistanceLimit|null);

                    /** Vehicle extraVisitDurationForVisitType */
                    extraVisitDurationForVisitType?: ({ [k: string]: google.protobuf.IDuration }|null);

                    /** Vehicle breakRule */
                    breakRule?: (google.cloud.optimization.v1.IBreakRule|null);

                    /** Vehicle requiredOperatorTypes */
                    requiredOperatorTypes?: (string[]|null);

                    /** Vehicle label */
                    label?: (string|null);

                    /** Vehicle ignore */
                    ignore?: (boolean|null);

                    /** Vehicle routeCommitments */
                    routeCommitments?: (google.cloud.optimization.v1.IRouteCommitments|null);

                    /** Vehicle breakRuleIndices */
                    breakRuleIndices?: (number[]|null);

                    /** Vehicle capacities */
                    capacities?: (google.cloud.optimization.v1.ICapacityQuantity[]|null);

                    /** Vehicle startLoadIntervals */
                    startLoadIntervals?: (google.cloud.optimization.v1.ICapacityQuantityInterval[]|null);

                    /** Vehicle endLoadIntervals */
                    endLoadIntervals?: (google.cloud.optimization.v1.ICapacityQuantityInterval[]|null);
                }

                /** Represents a Vehicle. */
                class Vehicle implements IVehicle {

                    /**
                     * Constructs a new Vehicle.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IVehicle);

                    /** Vehicle name. */
                    public name: string;

                    /** Vehicle displayName. */
                    public displayName: string;

                    /** Vehicle travelMode. */
                    public travelMode: (google.cloud.optimization.v1.Vehicle.TravelMode|keyof typeof google.cloud.optimization.v1.Vehicle.TravelMode);

                    /** Vehicle routeModifiers. */
                    public routeModifiers?: (google.cloud.optimization.v1.IRouteModifiers|null);

                    /** Vehicle startLocation. */
                    public startLocation?: (google.type.ILatLng|null);

                    /** Vehicle startWaypoint. */
                    public startWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                    /** Vehicle endLocation. */
                    public endLocation?: (google.type.ILatLng|null);

                    /** Vehicle endWaypoint. */
                    public endWaypoint?: (google.cloud.optimization.v1.IWaypoint|null);

                    /** Vehicle startTags. */
                    public startTags: string[];

                    /** Vehicle endTags. */
                    public endTags: string[];

                    /** Vehicle startTimeWindows. */
                    public startTimeWindows: google.cloud.optimization.v1.ITimeWindow[];

                    /** Vehicle endTimeWindows. */
                    public endTimeWindows: google.cloud.optimization.v1.ITimeWindow[];

                    /** Vehicle travelDurationMultiple. */
                    public travelDurationMultiple?: (number|null);

                    /** Vehicle unloadingPolicy. */
                    public unloadingPolicy: (google.cloud.optimization.v1.Vehicle.UnloadingPolicy|keyof typeof google.cloud.optimization.v1.Vehicle.UnloadingPolicy);

                    /** Vehicle loadLimits. */
                    public loadLimits: { [k: string]: google.cloud.optimization.v1.Vehicle.ILoadLimit };

                    /** Vehicle costPerHour. */
                    public costPerHour: number;

                    /** Vehicle costPerTraveledHour. */
                    public costPerTraveledHour: number;

                    /** Vehicle costPerKilometer. */
                    public costPerKilometer: number;

                    /** Vehicle fixedCost. */
                    public fixedCost: number;

                    /** Vehicle usedIfRouteIsEmpty. */
                    public usedIfRouteIsEmpty: boolean;

                    /** Vehicle routeDurationLimit. */
                    public routeDurationLimit?: (google.cloud.optimization.v1.Vehicle.IDurationLimit|null);

                    /** Vehicle travelDurationLimit. */
                    public travelDurationLimit?: (google.cloud.optimization.v1.Vehicle.IDurationLimit|null);

                    /** Vehicle routeDistanceLimit. */
                    public routeDistanceLimit?: (google.cloud.optimization.v1.IDistanceLimit|null);

                    /** Vehicle extraVisitDurationForVisitType. */
                    public extraVisitDurationForVisitType: { [k: string]: google.protobuf.IDuration };

                    /** Vehicle breakRule. */
                    public breakRule?: (google.cloud.optimization.v1.IBreakRule|null);

                    /** Vehicle requiredOperatorTypes. */
                    public requiredOperatorTypes: string[];

                    /** Vehicle label. */
                    public label: string;

                    /** Vehicle ignore. */
                    public ignore: boolean;

                    /** Vehicle routeCommitments. */
                    public routeCommitments?: (google.cloud.optimization.v1.IRouteCommitments|null);

                    /** Vehicle breakRuleIndices. */
                    public breakRuleIndices: number[];

                    /** Vehicle capacities. */
                    public capacities: google.cloud.optimization.v1.ICapacityQuantity[];

                    /** Vehicle startLoadIntervals. */
                    public startLoadIntervals: google.cloud.optimization.v1.ICapacityQuantityInterval[];

                    /** Vehicle endLoadIntervals. */
                    public endLoadIntervals: google.cloud.optimization.v1.ICapacityQuantityInterval[];

                    /** Vehicle _travelDurationMultiple. */
                    public _travelDurationMultiple?: "travelDurationMultiple";

                    /**
                     * Creates a new Vehicle instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Vehicle instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IVehicle): google.cloud.optimization.v1.Vehicle;

                    /**
                     * Encodes the specified Vehicle message. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.verify|verify} messages.
                     * @param message Vehicle message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IVehicle, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Vehicle message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.verify|verify} messages.
                     * @param message Vehicle message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IVehicle, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Vehicle message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Vehicle
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Vehicle;

                    /**
                     * Decodes a Vehicle message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Vehicle
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Vehicle;

                    /**
                     * Verifies a Vehicle message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Vehicle message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Vehicle
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Vehicle;

                    /**
                     * Creates a plain object from a Vehicle message. Also converts values to other types if specified.
                     * @param message Vehicle
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.Vehicle, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Vehicle to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Vehicle
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace Vehicle {

                    /** TravelMode enum. */
                    enum TravelMode {
                        TRAVEL_MODE_UNSPECIFIED = 0,
                        DRIVING = 1,
                        TWO_WHEELER = 5
                    }

                    /** UnloadingPolicy enum. */
                    enum UnloadingPolicy {
                        UNLOADING_POLICY_UNSPECIFIED = 0,
                        LAST_IN_FIRST_OUT = 1,
                        FIRST_IN_FIRST_OUT = 2
                    }

                    /** Properties of a LoadLimit. */
                    interface ILoadLimit {

                        /** LoadLimit maxLoad */
                        maxLoad?: (number|Long|string|null);

                        /** LoadLimit softMaxLoad */
                        softMaxLoad?: (number|Long|string|null);

                        /** LoadLimit costPerUnitAboveSoftMax */
                        costPerUnitAboveSoftMax?: (number|null);

                        /** LoadLimit startLoadInterval */
                        startLoadInterval?: (google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval|null);

                        /** LoadLimit endLoadInterval */
                        endLoadInterval?: (google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval|null);
                    }

                    /** Represents a LoadLimit. */
                    class LoadLimit implements ILoadLimit {

                        /**
                         * Constructs a new LoadLimit.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Vehicle.ILoadLimit);

                        /** LoadLimit maxLoad. */
                        public maxLoad?: (number|Long|string|null);

                        /** LoadLimit softMaxLoad. */
                        public softMaxLoad: (number|Long|string);

                        /** LoadLimit costPerUnitAboveSoftMax. */
                        public costPerUnitAboveSoftMax: number;

                        /** LoadLimit startLoadInterval. */
                        public startLoadInterval?: (google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval|null);

                        /** LoadLimit endLoadInterval. */
                        public endLoadInterval?: (google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval|null);

                        /** LoadLimit _maxLoad. */
                        public _maxLoad?: "maxLoad";

                        /**
                         * Creates a new LoadLimit instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns LoadLimit instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Vehicle.ILoadLimit): google.cloud.optimization.v1.Vehicle.LoadLimit;

                        /**
                         * Encodes the specified LoadLimit message. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.LoadLimit.verify|verify} messages.
                         * @param message LoadLimit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Vehicle.ILoadLimit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified LoadLimit message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.LoadLimit.verify|verify} messages.
                         * @param message LoadLimit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Vehicle.ILoadLimit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a LoadLimit message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns LoadLimit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Vehicle.LoadLimit;

                        /**
                         * Decodes a LoadLimit message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns LoadLimit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Vehicle.LoadLimit;

                        /**
                         * Verifies a LoadLimit message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a LoadLimit message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns LoadLimit
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Vehicle.LoadLimit;

                        /**
                         * Creates a plain object from a LoadLimit message. Also converts values to other types if specified.
                         * @param message LoadLimit
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Vehicle.LoadLimit, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this LoadLimit to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for LoadLimit
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    namespace LoadLimit {

                        /** Properties of an Interval. */
                        interface IInterval {

                            /** Interval min */
                            min?: (number|Long|string|null);

                            /** Interval max */
                            max?: (number|Long|string|null);
                        }

                        /** Represents an Interval. */
                        class Interval implements IInterval {

                            /**
                             * Constructs a new Interval.
                             * @param [properties] Properties to set
                             */
                            constructor(properties?: google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval);

                            /** Interval min. */
                            public min: (number|Long|string);

                            /** Interval max. */
                            public max?: (number|Long|string|null);

                            /** Interval _max. */
                            public _max?: "max";

                            /**
                             * Creates a new Interval instance using the specified properties.
                             * @param [properties] Properties to set
                             * @returns Interval instance
                             */
                            public static create(properties?: google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval): google.cloud.optimization.v1.Vehicle.LoadLimit.Interval;

                            /**
                             * Encodes the specified Interval message. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.LoadLimit.Interval.verify|verify} messages.
                             * @param message Interval message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encode(message: google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Encodes the specified Interval message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.LoadLimit.Interval.verify|verify} messages.
                             * @param message Interval message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encodeDelimited(message: google.cloud.optimization.v1.Vehicle.LoadLimit.IInterval, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Decodes an Interval message from the specified reader or buffer.
                             * @param reader Reader or buffer to decode from
                             * @param [length] Message length if known beforehand
                             * @returns Interval
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Vehicle.LoadLimit.Interval;

                            /**
                             * Decodes an Interval message from the specified reader or buffer, length delimited.
                             * @param reader Reader or buffer to decode from
                             * @returns Interval
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Vehicle.LoadLimit.Interval;

                            /**
                             * Verifies an Interval message.
                             * @param message Plain object to verify
                             * @returns `null` if valid, otherwise the reason why it is not
                             */
                            public static verify(message: { [k: string]: any }): (string|null);

                            /**
                             * Creates an Interval message from a plain object. Also converts values to their respective internal types.
                             * @param object Plain object
                             * @returns Interval
                             */
                            public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Vehicle.LoadLimit.Interval;

                            /**
                             * Creates a plain object from an Interval message. Also converts values to other types if specified.
                             * @param message Interval
                             * @param [options] Conversion options
                             * @returns Plain object
                             */
                            public static toObject(message: google.cloud.optimization.v1.Vehicle.LoadLimit.Interval, options?: $protobuf.IConversionOptions): { [k: string]: any };

                            /**
                             * Converts this Interval to JSON.
                             * @returns JSON object
                             */
                            public toJSON(): { [k: string]: any };

                            /**
                             * Gets the default type url for Interval
                             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                             * @returns The default type url
                             */
                            public static getTypeUrl(typeUrlPrefix?: string): string;
                        }
                    }

                    /** Properties of a DurationLimit. */
                    interface IDurationLimit {

                        /** DurationLimit maxDuration */
                        maxDuration?: (google.protobuf.IDuration|null);

                        /** DurationLimit softMaxDuration */
                        softMaxDuration?: (google.protobuf.IDuration|null);

                        /** DurationLimit costPerHourAfterSoftMax */
                        costPerHourAfterSoftMax?: (number|null);

                        /** DurationLimit quadraticSoftMaxDuration */
                        quadraticSoftMaxDuration?: (google.protobuf.IDuration|null);

                        /** DurationLimit costPerSquareHourAfterQuadraticSoftMax */
                        costPerSquareHourAfterQuadraticSoftMax?: (number|null);
                    }

                    /** Represents a DurationLimit. */
                    class DurationLimit implements IDurationLimit {

                        /**
                         * Constructs a new DurationLimit.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Vehicle.IDurationLimit);

                        /** DurationLimit maxDuration. */
                        public maxDuration?: (google.protobuf.IDuration|null);

                        /** DurationLimit softMaxDuration. */
                        public softMaxDuration?: (google.protobuf.IDuration|null);

                        /** DurationLimit costPerHourAfterSoftMax. */
                        public costPerHourAfterSoftMax?: (number|null);

                        /** DurationLimit quadraticSoftMaxDuration. */
                        public quadraticSoftMaxDuration?: (google.protobuf.IDuration|null);

                        /** DurationLimit costPerSquareHourAfterQuadraticSoftMax. */
                        public costPerSquareHourAfterQuadraticSoftMax?: (number|null);

                        /** DurationLimit _costPerHourAfterSoftMax. */
                        public _costPerHourAfterSoftMax?: "costPerHourAfterSoftMax";

                        /** DurationLimit _costPerSquareHourAfterQuadraticSoftMax. */
                        public _costPerSquareHourAfterQuadraticSoftMax?: "costPerSquareHourAfterQuadraticSoftMax";

                        /**
                         * Creates a new DurationLimit instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns DurationLimit instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Vehicle.IDurationLimit): google.cloud.optimization.v1.Vehicle.DurationLimit;

                        /**
                         * Encodes the specified DurationLimit message. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.DurationLimit.verify|verify} messages.
                         * @param message DurationLimit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Vehicle.IDurationLimit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified DurationLimit message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Vehicle.DurationLimit.verify|verify} messages.
                         * @param message DurationLimit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Vehicle.IDurationLimit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a DurationLimit message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns DurationLimit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Vehicle.DurationLimit;

                        /**
                         * Decodes a DurationLimit message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns DurationLimit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Vehicle.DurationLimit;

                        /**
                         * Verifies a DurationLimit message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a DurationLimit message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns DurationLimit
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Vehicle.DurationLimit;

                        /**
                         * Creates a plain object from a DurationLimit message. Also converts values to other types if specified.
                         * @param message DurationLimit
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Vehicle.DurationLimit, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this DurationLimit to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for DurationLimit
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a TimeWindow. */
                interface ITimeWindow {

                    /** TimeWindow startTime */
                    startTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow endTime */
                    endTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow softStartTime */
                    softStartTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow softEndTime */
                    softEndTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow costPerHourBeforeSoftStartTime */
                    costPerHourBeforeSoftStartTime?: (number|null);

                    /** TimeWindow costPerHourAfterSoftEndTime */
                    costPerHourAfterSoftEndTime?: (number|null);
                }

                /** Represents a TimeWindow. */
                class TimeWindow implements ITimeWindow {

                    /**
                     * Constructs a new TimeWindow.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ITimeWindow);

                    /** TimeWindow startTime. */
                    public startTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow endTime. */
                    public endTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow softStartTime. */
                    public softStartTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow softEndTime. */
                    public softEndTime?: (google.protobuf.ITimestamp|null);

                    /** TimeWindow costPerHourBeforeSoftStartTime. */
                    public costPerHourBeforeSoftStartTime?: (number|null);

                    /** TimeWindow costPerHourAfterSoftEndTime. */
                    public costPerHourAfterSoftEndTime?: (number|null);

                    /** TimeWindow _costPerHourBeforeSoftStartTime. */
                    public _costPerHourBeforeSoftStartTime?: "costPerHourBeforeSoftStartTime";

                    /** TimeWindow _costPerHourAfterSoftEndTime. */
                    public _costPerHourAfterSoftEndTime?: "costPerHourAfterSoftEndTime";

                    /**
                     * Creates a new TimeWindow instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns TimeWindow instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ITimeWindow): google.cloud.optimization.v1.TimeWindow;

                    /**
                     * Encodes the specified TimeWindow message. Does not implicitly {@link google.cloud.optimization.v1.TimeWindow.verify|verify} messages.
                     * @param message TimeWindow message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ITimeWindow, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified TimeWindow message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.TimeWindow.verify|verify} messages.
                     * @param message TimeWindow message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ITimeWindow, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a TimeWindow message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns TimeWindow
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.TimeWindow;

                    /**
                     * Decodes a TimeWindow message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns TimeWindow
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.TimeWindow;

                    /**
                     * Verifies a TimeWindow message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a TimeWindow message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns TimeWindow
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.TimeWindow;

                    /**
                     * Creates a plain object from a TimeWindow message. Also converts values to other types if specified.
                     * @param message TimeWindow
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.TimeWindow, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this TimeWindow to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for TimeWindow
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a CapacityQuantity. */
                interface ICapacityQuantity {

                    /** CapacityQuantity type */
                    type?: (string|null);

                    /** CapacityQuantity value */
                    value?: (number|Long|string|null);
                }

                /** Represents a CapacityQuantity. */
                class CapacityQuantity implements ICapacityQuantity {

                    /**
                     * Constructs a new CapacityQuantity.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ICapacityQuantity);

                    /** CapacityQuantity type. */
                    public type: string;

                    /** CapacityQuantity value. */
                    public value: (number|Long|string);

                    /**
                     * Creates a new CapacityQuantity instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CapacityQuantity instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ICapacityQuantity): google.cloud.optimization.v1.CapacityQuantity;

                    /**
                     * Encodes the specified CapacityQuantity message. Does not implicitly {@link google.cloud.optimization.v1.CapacityQuantity.verify|verify} messages.
                     * @param message CapacityQuantity message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ICapacityQuantity, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CapacityQuantity message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.CapacityQuantity.verify|verify} messages.
                     * @param message CapacityQuantity message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ICapacityQuantity, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CapacityQuantity message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CapacityQuantity
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.CapacityQuantity;

                    /**
                     * Decodes a CapacityQuantity message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CapacityQuantity
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.CapacityQuantity;

                    /**
                     * Verifies a CapacityQuantity message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CapacityQuantity message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CapacityQuantity
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.CapacityQuantity;

                    /**
                     * Creates a plain object from a CapacityQuantity message. Also converts values to other types if specified.
                     * @param message CapacityQuantity
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.CapacityQuantity, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CapacityQuantity to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CapacityQuantity
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a CapacityQuantityInterval. */
                interface ICapacityQuantityInterval {

                    /** CapacityQuantityInterval type */
                    type?: (string|null);

                    /** CapacityQuantityInterval minValue */
                    minValue?: (number|Long|string|null);

                    /** CapacityQuantityInterval maxValue */
                    maxValue?: (number|Long|string|null);
                }

                /** Represents a CapacityQuantityInterval. */
                class CapacityQuantityInterval implements ICapacityQuantityInterval {

                    /**
                     * Constructs a new CapacityQuantityInterval.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ICapacityQuantityInterval);

                    /** CapacityQuantityInterval type. */
                    public type: string;

                    /** CapacityQuantityInterval minValue. */
                    public minValue?: (number|Long|string|null);

                    /** CapacityQuantityInterval maxValue. */
                    public maxValue?: (number|Long|string|null);

                    /** CapacityQuantityInterval _minValue. */
                    public _minValue?: "minValue";

                    /** CapacityQuantityInterval _maxValue. */
                    public _maxValue?: "maxValue";

                    /**
                     * Creates a new CapacityQuantityInterval instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CapacityQuantityInterval instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ICapacityQuantityInterval): google.cloud.optimization.v1.CapacityQuantityInterval;

                    /**
                     * Encodes the specified CapacityQuantityInterval message. Does not implicitly {@link google.cloud.optimization.v1.CapacityQuantityInterval.verify|verify} messages.
                     * @param message CapacityQuantityInterval message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ICapacityQuantityInterval, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CapacityQuantityInterval message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.CapacityQuantityInterval.verify|verify} messages.
                     * @param message CapacityQuantityInterval message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ICapacityQuantityInterval, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CapacityQuantityInterval message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CapacityQuantityInterval
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.CapacityQuantityInterval;

                    /**
                     * Decodes a CapacityQuantityInterval message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CapacityQuantityInterval
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.CapacityQuantityInterval;

                    /**
                     * Verifies a CapacityQuantityInterval message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CapacityQuantityInterval message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CapacityQuantityInterval
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.CapacityQuantityInterval;

                    /**
                     * Creates a plain object from a CapacityQuantityInterval message. Also converts values to other types if specified.
                     * @param message CapacityQuantityInterval
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.CapacityQuantityInterval, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CapacityQuantityInterval to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CapacityQuantityInterval
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a DistanceLimit. */
                interface IDistanceLimit {

                    /** DistanceLimit maxMeters */
                    maxMeters?: (number|Long|string|null);

                    /** DistanceLimit softMaxMeters */
                    softMaxMeters?: (number|Long|string|null);

                    /** DistanceLimit costPerKilometerAboveSoftMax */
                    costPerKilometerAboveSoftMax?: (number|null);
                }

                /** Represents a DistanceLimit. */
                class DistanceLimit implements IDistanceLimit {

                    /**
                     * Constructs a new DistanceLimit.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IDistanceLimit);

                    /** DistanceLimit maxMeters. */
                    public maxMeters?: (number|Long|string|null);

                    /** DistanceLimit softMaxMeters. */
                    public softMaxMeters?: (number|Long|string|null);

                    /** DistanceLimit costPerKilometerAboveSoftMax. */
                    public costPerKilometerAboveSoftMax?: (number|null);

                    /** DistanceLimit _maxMeters. */
                    public _maxMeters?: "maxMeters";

                    /** DistanceLimit _softMaxMeters. */
                    public _softMaxMeters?: "softMaxMeters";

                    /** DistanceLimit _costPerKilometerAboveSoftMax. */
                    public _costPerKilometerAboveSoftMax?: "costPerKilometerAboveSoftMax";

                    /**
                     * Creates a new DistanceLimit instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DistanceLimit instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IDistanceLimit): google.cloud.optimization.v1.DistanceLimit;

                    /**
                     * Encodes the specified DistanceLimit message. Does not implicitly {@link google.cloud.optimization.v1.DistanceLimit.verify|verify} messages.
                     * @param message DistanceLimit message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IDistanceLimit, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DistanceLimit message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.DistanceLimit.verify|verify} messages.
                     * @param message DistanceLimit message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IDistanceLimit, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DistanceLimit message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DistanceLimit
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.DistanceLimit;

                    /**
                     * Decodes a DistanceLimit message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DistanceLimit
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.DistanceLimit;

                    /**
                     * Verifies a DistanceLimit message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DistanceLimit message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DistanceLimit
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.DistanceLimit;

                    /**
                     * Creates a plain object from a DistanceLimit message. Also converts values to other types if specified.
                     * @param message DistanceLimit
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.DistanceLimit, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DistanceLimit to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for DistanceLimit
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a TransitionAttributes. */
                interface ITransitionAttributes {

                    /** TransitionAttributes srcTag */
                    srcTag?: (string|null);

                    /** TransitionAttributes excludedSrcTag */
                    excludedSrcTag?: (string|null);

                    /** TransitionAttributes dstTag */
                    dstTag?: (string|null);

                    /** TransitionAttributes excludedDstTag */
                    excludedDstTag?: (string|null);

                    /** TransitionAttributes cost */
                    cost?: (number|null);

                    /** TransitionAttributes costPerKilometer */
                    costPerKilometer?: (number|null);

                    /** TransitionAttributes distanceLimit */
                    distanceLimit?: (google.cloud.optimization.v1.IDistanceLimit|null);

                    /** TransitionAttributes delay */
                    delay?: (google.protobuf.IDuration|null);
                }

                /** Represents a TransitionAttributes. */
                class TransitionAttributes implements ITransitionAttributes {

                    /**
                     * Constructs a new TransitionAttributes.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ITransitionAttributes);

                    /** TransitionAttributes srcTag. */
                    public srcTag: string;

                    /** TransitionAttributes excludedSrcTag. */
                    public excludedSrcTag: string;

                    /** TransitionAttributes dstTag. */
                    public dstTag: string;

                    /** TransitionAttributes excludedDstTag. */
                    public excludedDstTag: string;

                    /** TransitionAttributes cost. */
                    public cost: number;

                    /** TransitionAttributes costPerKilometer. */
                    public costPerKilometer: number;

                    /** TransitionAttributes distanceLimit. */
                    public distanceLimit?: (google.cloud.optimization.v1.IDistanceLimit|null);

                    /** TransitionAttributes delay. */
                    public delay?: (google.protobuf.IDuration|null);

                    /**
                     * Creates a new TransitionAttributes instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns TransitionAttributes instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ITransitionAttributes): google.cloud.optimization.v1.TransitionAttributes;

                    /**
                     * Encodes the specified TransitionAttributes message. Does not implicitly {@link google.cloud.optimization.v1.TransitionAttributes.verify|verify} messages.
                     * @param message TransitionAttributes message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ITransitionAttributes, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified TransitionAttributes message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.TransitionAttributes.verify|verify} messages.
                     * @param message TransitionAttributes message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ITransitionAttributes, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a TransitionAttributes message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns TransitionAttributes
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.TransitionAttributes;

                    /**
                     * Decodes a TransitionAttributes message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns TransitionAttributes
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.TransitionAttributes;

                    /**
                     * Verifies a TransitionAttributes message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a TransitionAttributes message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns TransitionAttributes
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.TransitionAttributes;

                    /**
                     * Creates a plain object from a TransitionAttributes message. Also converts values to other types if specified.
                     * @param message TransitionAttributes
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.TransitionAttributes, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this TransitionAttributes to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for TransitionAttributes
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a Waypoint. */
                interface IWaypoint {

                    /** Waypoint location */
                    location?: (google.cloud.optimization.v1.ILocation|null);

                    /** Waypoint placeId */
                    placeId?: (string|null);

                    /** Waypoint sideOfRoad */
                    sideOfRoad?: (boolean|null);
                }

                /** Represents a Waypoint. */
                class Waypoint implements IWaypoint {

                    /**
                     * Constructs a new Waypoint.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IWaypoint);

                    /** Waypoint location. */
                    public location?: (google.cloud.optimization.v1.ILocation|null);

                    /** Waypoint placeId. */
                    public placeId?: (string|null);

                    /** Waypoint sideOfRoad. */
                    public sideOfRoad: boolean;

                    /** Waypoint locationType. */
                    public locationType?: ("location"|"placeId");

                    /**
                     * Creates a new Waypoint instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Waypoint instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IWaypoint): google.cloud.optimization.v1.Waypoint;

                    /**
                     * Encodes the specified Waypoint message. Does not implicitly {@link google.cloud.optimization.v1.Waypoint.verify|verify} messages.
                     * @param message Waypoint message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IWaypoint, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Waypoint message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Waypoint.verify|verify} messages.
                     * @param message Waypoint message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IWaypoint, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Waypoint message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Waypoint
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Waypoint;

                    /**
                     * Decodes a Waypoint message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Waypoint
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Waypoint;

                    /**
                     * Verifies a Waypoint message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Waypoint message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Waypoint
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Waypoint;

                    /**
                     * Creates a plain object from a Waypoint message. Also converts values to other types if specified.
                     * @param message Waypoint
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.Waypoint, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Waypoint to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Waypoint
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a Location. */
                interface ILocation {

                    /** Location latLng */
                    latLng?: (google.type.ILatLng|null);

                    /** Location heading */
                    heading?: (number|null);
                }

                /** Represents a Location. */
                class Location implements ILocation {

                    /**
                     * Constructs a new Location.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ILocation);

                    /** Location latLng. */
                    public latLng?: (google.type.ILatLng|null);

                    /** Location heading. */
                    public heading?: (number|null);

                    /** Location _heading. */
                    public _heading?: "heading";

                    /**
                     * Creates a new Location instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Location instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ILocation): google.cloud.optimization.v1.Location;

                    /**
                     * Encodes the specified Location message. Does not implicitly {@link google.cloud.optimization.v1.Location.verify|verify} messages.
                     * @param message Location message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Location message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Location.verify|verify} messages.
                     * @param message Location message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Location message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Location
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Location;

                    /**
                     * Decodes a Location message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Location
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Location;

                    /**
                     * Verifies a Location message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Location message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Location
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Location;

                    /**
                     * Creates a plain object from a Location message. Also converts values to other types if specified.
                     * @param message Location
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Location to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Location
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a BreakRule. */
                interface IBreakRule {

                    /** BreakRule breakRequests */
                    breakRequests?: (google.cloud.optimization.v1.BreakRule.IBreakRequest[]|null);

                    /** BreakRule frequencyConstraints */
                    frequencyConstraints?: (google.cloud.optimization.v1.BreakRule.IFrequencyConstraint[]|null);
                }

                /** Represents a BreakRule. */
                class BreakRule implements IBreakRule {

                    /**
                     * Constructs a new BreakRule.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IBreakRule);

                    /** BreakRule breakRequests. */
                    public breakRequests: google.cloud.optimization.v1.BreakRule.IBreakRequest[];

                    /** BreakRule frequencyConstraints. */
                    public frequencyConstraints: google.cloud.optimization.v1.BreakRule.IFrequencyConstraint[];

                    /**
                     * Creates a new BreakRule instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns BreakRule instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IBreakRule): google.cloud.optimization.v1.BreakRule;

                    /**
                     * Encodes the specified BreakRule message. Does not implicitly {@link google.cloud.optimization.v1.BreakRule.verify|verify} messages.
                     * @param message BreakRule message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IBreakRule, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified BreakRule message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.BreakRule.verify|verify} messages.
                     * @param message BreakRule message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IBreakRule, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a BreakRule message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns BreakRule
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.BreakRule;

                    /**
                     * Decodes a BreakRule message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns BreakRule
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.BreakRule;

                    /**
                     * Verifies a BreakRule message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a BreakRule message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns BreakRule
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.BreakRule;

                    /**
                     * Creates a plain object from a BreakRule message. Also converts values to other types if specified.
                     * @param message BreakRule
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.BreakRule, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this BreakRule to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for BreakRule
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace BreakRule {

                    /** Properties of a BreakRequest. */
                    interface IBreakRequest {

                        /** BreakRequest earliestStartTime */
                        earliestStartTime?: (google.protobuf.ITimestamp|null);

                        /** BreakRequest latestStartTime */
                        latestStartTime?: (google.protobuf.ITimestamp|null);

                        /** BreakRequest minDuration */
                        minDuration?: (google.protobuf.IDuration|null);
                    }

                    /** Represents a BreakRequest. */
                    class BreakRequest implements IBreakRequest {

                        /**
                         * Constructs a new BreakRequest.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.BreakRule.IBreakRequest);

                        /** BreakRequest earliestStartTime. */
                        public earliestStartTime?: (google.protobuf.ITimestamp|null);

                        /** BreakRequest latestStartTime. */
                        public latestStartTime?: (google.protobuf.ITimestamp|null);

                        /** BreakRequest minDuration. */
                        public minDuration?: (google.protobuf.IDuration|null);

                        /**
                         * Creates a new BreakRequest instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns BreakRequest instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.BreakRule.IBreakRequest): google.cloud.optimization.v1.BreakRule.BreakRequest;

                        /**
                         * Encodes the specified BreakRequest message. Does not implicitly {@link google.cloud.optimization.v1.BreakRule.BreakRequest.verify|verify} messages.
                         * @param message BreakRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.BreakRule.IBreakRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified BreakRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.BreakRule.BreakRequest.verify|verify} messages.
                         * @param message BreakRequest message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.BreakRule.IBreakRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a BreakRequest message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns BreakRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.BreakRule.BreakRequest;

                        /**
                         * Decodes a BreakRequest message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns BreakRequest
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.BreakRule.BreakRequest;

                        /**
                         * Verifies a BreakRequest message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a BreakRequest message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns BreakRequest
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.BreakRule.BreakRequest;

                        /**
                         * Creates a plain object from a BreakRequest message. Also converts values to other types if specified.
                         * @param message BreakRequest
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.BreakRule.BreakRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this BreakRequest to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for BreakRequest
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a FrequencyConstraint. */
                    interface IFrequencyConstraint {

                        /** FrequencyConstraint minBreakDuration */
                        minBreakDuration?: (google.protobuf.IDuration|null);

                        /** FrequencyConstraint maxInterBreakDuration */
                        maxInterBreakDuration?: (google.protobuf.IDuration|null);
                    }

                    /** Represents a FrequencyConstraint. */
                    class FrequencyConstraint implements IFrequencyConstraint {

                        /**
                         * Constructs a new FrequencyConstraint.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.BreakRule.IFrequencyConstraint);

                        /** FrequencyConstraint minBreakDuration. */
                        public minBreakDuration?: (google.protobuf.IDuration|null);

                        /** FrequencyConstraint maxInterBreakDuration. */
                        public maxInterBreakDuration?: (google.protobuf.IDuration|null);

                        /**
                         * Creates a new FrequencyConstraint instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns FrequencyConstraint instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.BreakRule.IFrequencyConstraint): google.cloud.optimization.v1.BreakRule.FrequencyConstraint;

                        /**
                         * Encodes the specified FrequencyConstraint message. Does not implicitly {@link google.cloud.optimization.v1.BreakRule.FrequencyConstraint.verify|verify} messages.
                         * @param message FrequencyConstraint message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.BreakRule.IFrequencyConstraint, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified FrequencyConstraint message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.BreakRule.FrequencyConstraint.verify|verify} messages.
                         * @param message FrequencyConstraint message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.BreakRule.IFrequencyConstraint, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a FrequencyConstraint message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns FrequencyConstraint
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.BreakRule.FrequencyConstraint;

                        /**
                         * Decodes a FrequencyConstraint message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns FrequencyConstraint
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.BreakRule.FrequencyConstraint;

                        /**
                         * Verifies a FrequencyConstraint message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a FrequencyConstraint message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns FrequencyConstraint
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.BreakRule.FrequencyConstraint;

                        /**
                         * Creates a plain object from a FrequencyConstraint message. Also converts values to other types if specified.
                         * @param message FrequencyConstraint
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.BreakRule.FrequencyConstraint, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this FrequencyConstraint to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for FrequencyConstraint
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a VehicleOperator. */
                interface IVehicleOperator {

                    /** VehicleOperator startTimeWindows */
                    startTimeWindows?: (google.cloud.optimization.v1.ITimeWindow[]|null);

                    /** VehicleOperator endTimeWindows */
                    endTimeWindows?: (google.cloud.optimization.v1.ITimeWindow[]|null);

                    /** VehicleOperator type */
                    type?: (string|null);

                    /** VehicleOperator label */
                    label?: (string|null);
                }

                /** Represents a VehicleOperator. */
                class VehicleOperator implements IVehicleOperator {

                    /**
                     * Constructs a new VehicleOperator.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IVehicleOperator);

                    /** VehicleOperator startTimeWindows. */
                    public startTimeWindows: google.cloud.optimization.v1.ITimeWindow[];

                    /** VehicleOperator endTimeWindows. */
                    public endTimeWindows: google.cloud.optimization.v1.ITimeWindow[];

                    /** VehicleOperator type. */
                    public type: string;

                    /** VehicleOperator label. */
                    public label: string;

                    /**
                     * Creates a new VehicleOperator instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns VehicleOperator instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IVehicleOperator): google.cloud.optimization.v1.VehicleOperator;

                    /**
                     * Encodes the specified VehicleOperator message. Does not implicitly {@link google.cloud.optimization.v1.VehicleOperator.verify|verify} messages.
                     * @param message VehicleOperator message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IVehicleOperator, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified VehicleOperator message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.VehicleOperator.verify|verify} messages.
                     * @param message VehicleOperator message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IVehicleOperator, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a VehicleOperator message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns VehicleOperator
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.VehicleOperator;

                    /**
                     * Decodes a VehicleOperator message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns VehicleOperator
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.VehicleOperator;

                    /**
                     * Verifies a VehicleOperator message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a VehicleOperator message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns VehicleOperator
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.VehicleOperator;

                    /**
                     * Creates a plain object from a VehicleOperator message. Also converts values to other types if specified.
                     * @param message VehicleOperator
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.VehicleOperator, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this VehicleOperator to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for VehicleOperator
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ShipmentRoute. */
                interface IShipmentRoute {

                    /** ShipmentRoute vehicleIndex */
                    vehicleIndex?: (number|null);

                    /** ShipmentRoute vehicleLabel */
                    vehicleLabel?: (string|null);

                    /** ShipmentRoute vehicleName */
                    vehicleName?: (string|null);

                    /** ShipmentRoute vehicleOperatorIndices */
                    vehicleOperatorIndices?: (number[]|null);

                    /** ShipmentRoute vehicleOperatorLabels */
                    vehicleOperatorLabels?: (string[]|null);

                    /** ShipmentRoute vehicleStartTime */
                    vehicleStartTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentRoute vehicleEndTime */
                    vehicleEndTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentRoute visits */
                    visits?: (google.cloud.optimization.v1.ShipmentRoute.IVisit[]|null);

                    /** ShipmentRoute transitions */
                    transitions?: (google.cloud.optimization.v1.ShipmentRoute.ITransition[]|null);

                    /** ShipmentRoute hasTrafficInfeasibilities */
                    hasTrafficInfeasibilities?: (boolean|null);

                    /** ShipmentRoute routePolyline */
                    routePolyline?: (google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline|null);

                    /** ShipmentRoute breaks */
                    breaks?: (google.cloud.optimization.v1.ShipmentRoute.IBreak[]|null);

                    /** ShipmentRoute metrics */
                    metrics?: (google.cloud.optimization.v1.IAggregatedMetrics|null);

                    /** ShipmentRoute vehicleFullness */
                    vehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);

                    /** ShipmentRoute routeCosts */
                    routeCosts?: ({ [k: string]: number }|null);

                    /** ShipmentRoute routeTotalCost */
                    routeTotalCost?: (number|null);

                    /** ShipmentRoute endLoads */
                    endLoads?: (google.cloud.optimization.v1.ICapacityQuantity[]|null);

                    /** ShipmentRoute travelSteps */
                    travelSteps?: (google.cloud.optimization.v1.ShipmentRoute.ITravelStep[]|null);

                    /** ShipmentRoute vehicleDetour */
                    vehicleDetour?: (google.protobuf.IDuration|null);

                    /** ShipmentRoute delayBeforeVehicleEnd */
                    delayBeforeVehicleEnd?: (google.cloud.optimization.v1.ShipmentRoute.IDelay|null);
                }

                /** Represents a ShipmentRoute. */
                class ShipmentRoute implements IShipmentRoute {

                    /**
                     * Constructs a new ShipmentRoute.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IShipmentRoute);

                    /** ShipmentRoute vehicleIndex. */
                    public vehicleIndex: number;

                    /** ShipmentRoute vehicleLabel. */
                    public vehicleLabel: string;

                    /** ShipmentRoute vehicleName. */
                    public vehicleName: string;

                    /** ShipmentRoute vehicleOperatorIndices. */
                    public vehicleOperatorIndices: number[];

                    /** ShipmentRoute vehicleOperatorLabels. */
                    public vehicleOperatorLabels: string[];

                    /** ShipmentRoute vehicleStartTime. */
                    public vehicleStartTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentRoute vehicleEndTime. */
                    public vehicleEndTime?: (google.protobuf.ITimestamp|null);

                    /** ShipmentRoute visits. */
                    public visits: google.cloud.optimization.v1.ShipmentRoute.IVisit[];

                    /** ShipmentRoute transitions. */
                    public transitions: google.cloud.optimization.v1.ShipmentRoute.ITransition[];

                    /** ShipmentRoute hasTrafficInfeasibilities. */
                    public hasTrafficInfeasibilities: boolean;

                    /** ShipmentRoute routePolyline. */
                    public routePolyline?: (google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline|null);

                    /** ShipmentRoute breaks. */
                    public breaks: google.cloud.optimization.v1.ShipmentRoute.IBreak[];

                    /** ShipmentRoute metrics. */
                    public metrics?: (google.cloud.optimization.v1.IAggregatedMetrics|null);

                    /** ShipmentRoute vehicleFullness. */
                    public vehicleFullness?: (google.cloud.optimization.v1.IVehicleFullness|null);

                    /** ShipmentRoute routeCosts. */
                    public routeCosts: { [k: string]: number };

                    /** ShipmentRoute routeTotalCost. */
                    public routeTotalCost: number;

                    /** ShipmentRoute endLoads. */
                    public endLoads: google.cloud.optimization.v1.ICapacityQuantity[];

                    /** ShipmentRoute travelSteps. */
                    public travelSteps: google.cloud.optimization.v1.ShipmentRoute.ITravelStep[];

                    /** ShipmentRoute vehicleDetour. */
                    public vehicleDetour?: (google.protobuf.IDuration|null);

                    /** ShipmentRoute delayBeforeVehicleEnd. */
                    public delayBeforeVehicleEnd?: (google.cloud.optimization.v1.ShipmentRoute.IDelay|null);

                    /**
                     * Creates a new ShipmentRoute instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ShipmentRoute instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IShipmentRoute): google.cloud.optimization.v1.ShipmentRoute;

                    /**
                     * Encodes the specified ShipmentRoute message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.verify|verify} messages.
                     * @param message ShipmentRoute message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IShipmentRoute, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ShipmentRoute message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.verify|verify} messages.
                     * @param message ShipmentRoute message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IShipmentRoute, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ShipmentRoute message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ShipmentRoute
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute;

                    /**
                     * Decodes a ShipmentRoute message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ShipmentRoute
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute;

                    /**
                     * Verifies a ShipmentRoute message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ShipmentRoute message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ShipmentRoute
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute;

                    /**
                     * Creates a plain object from a ShipmentRoute message. Also converts values to other types if specified.
                     * @param message ShipmentRoute
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ShipmentRoute, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ShipmentRoute to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ShipmentRoute
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace ShipmentRoute {

                    /** Properties of a Delay. */
                    interface IDelay {

                        /** Delay startTime */
                        startTime?: (google.protobuf.ITimestamp|null);

                        /** Delay duration */
                        duration?: (google.protobuf.IDuration|null);
                    }

                    /** Represents a Delay. */
                    class Delay implements IDelay {

                        /**
                         * Constructs a new Delay.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentRoute.IDelay);

                        /** Delay startTime. */
                        public startTime?: (google.protobuf.ITimestamp|null);

                        /** Delay duration. */
                        public duration?: (google.protobuf.IDuration|null);

                        /**
                         * Creates a new Delay instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Delay instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentRoute.IDelay): google.cloud.optimization.v1.ShipmentRoute.Delay;

                        /**
                         * Encodes the specified Delay message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Delay.verify|verify} messages.
                         * @param message Delay message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentRoute.IDelay, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Delay message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Delay.verify|verify} messages.
                         * @param message Delay message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentRoute.IDelay, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Delay message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Delay
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute.Delay;

                        /**
                         * Decodes a Delay message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Delay
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute.Delay;

                        /**
                         * Verifies a Delay message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Delay message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Delay
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute.Delay;

                        /**
                         * Creates a plain object from a Delay message. Also converts values to other types if specified.
                         * @param message Delay
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentRoute.Delay, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Delay to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Delay
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a Visit. */
                    interface IVisit {

                        /** Visit shipmentIndex */
                        shipmentIndex?: (number|null);

                        /** Visit shipmentName */
                        shipmentName?: (string|null);

                        /** Visit isPickup */
                        isPickup?: (boolean|null);

                        /** Visit visitRequestIndex */
                        visitRequestIndex?: (number|null);

                        /** Visit startTime */
                        startTime?: (google.protobuf.ITimestamp|null);

                        /** Visit loadDemands */
                        loadDemands?: ({ [k: string]: google.cloud.optimization.v1.Shipment.ILoad }|null);

                        /** Visit detour */
                        detour?: (google.protobuf.IDuration|null);

                        /** Visit shipmentLabel */
                        shipmentLabel?: (string|null);

                        /** Visit visitLabel */
                        visitLabel?: (string|null);

                        /** Visit arrivalLoads */
                        arrivalLoads?: (google.cloud.optimization.v1.ICapacityQuantity[]|null);

                        /** Visit delayBeforeStart */
                        delayBeforeStart?: (google.cloud.optimization.v1.ShipmentRoute.IDelay|null);

                        /** Visit demands */
                        demands?: (google.cloud.optimization.v1.ICapacityQuantity[]|null);
                    }

                    /** Represents a Visit. */
                    class Visit implements IVisit {

                        /**
                         * Constructs a new Visit.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentRoute.IVisit);

                        /** Visit shipmentIndex. */
                        public shipmentIndex: number;

                        /** Visit shipmentName. */
                        public shipmentName: string;

                        /** Visit isPickup. */
                        public isPickup: boolean;

                        /** Visit visitRequestIndex. */
                        public visitRequestIndex: number;

                        /** Visit startTime. */
                        public startTime?: (google.protobuf.ITimestamp|null);

                        /** Visit loadDemands. */
                        public loadDemands: { [k: string]: google.cloud.optimization.v1.Shipment.ILoad };

                        /** Visit detour. */
                        public detour?: (google.protobuf.IDuration|null);

                        /** Visit shipmentLabel. */
                        public shipmentLabel: string;

                        /** Visit visitLabel. */
                        public visitLabel: string;

                        /** Visit arrivalLoads. */
                        public arrivalLoads: google.cloud.optimization.v1.ICapacityQuantity[];

                        /** Visit delayBeforeStart. */
                        public delayBeforeStart?: (google.cloud.optimization.v1.ShipmentRoute.IDelay|null);

                        /** Visit demands. */
                        public demands: google.cloud.optimization.v1.ICapacityQuantity[];

                        /**
                         * Creates a new Visit instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Visit instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentRoute.IVisit): google.cloud.optimization.v1.ShipmentRoute.Visit;

                        /**
                         * Encodes the specified Visit message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Visit.verify|verify} messages.
                         * @param message Visit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentRoute.IVisit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Visit message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Visit.verify|verify} messages.
                         * @param message Visit message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentRoute.IVisit, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Visit message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Visit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute.Visit;

                        /**
                         * Decodes a Visit message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Visit
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute.Visit;

                        /**
                         * Verifies a Visit message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Visit message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Visit
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute.Visit;

                        /**
                         * Creates a plain object from a Visit message. Also converts values to other types if specified.
                         * @param message Visit
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentRoute.Visit, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Visit to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Visit
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a Transition. */
                    interface ITransition {

                        /** Transition travelDuration */
                        travelDuration?: (google.protobuf.IDuration|null);

                        /** Transition travelDistanceMeters */
                        travelDistanceMeters?: (number|null);

                        /** Transition trafficInfoUnavailable */
                        trafficInfoUnavailable?: (boolean|null);

                        /** Transition delayDuration */
                        delayDuration?: (google.protobuf.IDuration|null);

                        /** Transition breakDuration */
                        breakDuration?: (google.protobuf.IDuration|null);

                        /** Transition waitDuration */
                        waitDuration?: (google.protobuf.IDuration|null);

                        /** Transition totalDuration */
                        totalDuration?: (google.protobuf.IDuration|null);

                        /** Transition startTime */
                        startTime?: (google.protobuf.ITimestamp|null);

                        /** Transition routePolyline */
                        routePolyline?: (google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline|null);

                        /** Transition vehicleLoads */
                        vehicleLoads?: ({ [k: string]: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad }|null);

                        /** Transition loads */
                        loads?: (google.cloud.optimization.v1.ICapacityQuantity[]|null);
                    }

                    /** Represents a Transition. */
                    class Transition implements ITransition {

                        /**
                         * Constructs a new Transition.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentRoute.ITransition);

                        /** Transition travelDuration. */
                        public travelDuration?: (google.protobuf.IDuration|null);

                        /** Transition travelDistanceMeters. */
                        public travelDistanceMeters: number;

                        /** Transition trafficInfoUnavailable. */
                        public trafficInfoUnavailable: boolean;

                        /** Transition delayDuration. */
                        public delayDuration?: (google.protobuf.IDuration|null);

                        /** Transition breakDuration. */
                        public breakDuration?: (google.protobuf.IDuration|null);

                        /** Transition waitDuration. */
                        public waitDuration?: (google.protobuf.IDuration|null);

                        /** Transition totalDuration. */
                        public totalDuration?: (google.protobuf.IDuration|null);

                        /** Transition startTime. */
                        public startTime?: (google.protobuf.ITimestamp|null);

                        /** Transition routePolyline. */
                        public routePolyline?: (google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline|null);

                        /** Transition vehicleLoads. */
                        public vehicleLoads: { [k: string]: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad };

                        /** Transition loads. */
                        public loads: google.cloud.optimization.v1.ICapacityQuantity[];

                        /**
                         * Creates a new Transition instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Transition instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentRoute.ITransition): google.cloud.optimization.v1.ShipmentRoute.Transition;

                        /**
                         * Encodes the specified Transition message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Transition.verify|verify} messages.
                         * @param message Transition message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentRoute.ITransition, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Transition message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Transition.verify|verify} messages.
                         * @param message Transition message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentRoute.ITransition, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Transition message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Transition
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute.Transition;

                        /**
                         * Decodes a Transition message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Transition
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute.Transition;

                        /**
                         * Verifies a Transition message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Transition message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Transition
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute.Transition;

                        /**
                         * Creates a plain object from a Transition message. Also converts values to other types if specified.
                         * @param message Transition
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentRoute.Transition, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Transition to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Transition
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a VehicleLoad. */
                    interface IVehicleLoad {

                        /** VehicleLoad amount */
                        amount?: (number|Long|string|null);
                    }

                    /** Represents a VehicleLoad. */
                    class VehicleLoad implements IVehicleLoad {

                        /**
                         * Constructs a new VehicleLoad.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad);

                        /** VehicleLoad amount. */
                        public amount: (number|Long|string);

                        /**
                         * Creates a new VehicleLoad instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns VehicleLoad instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad): google.cloud.optimization.v1.ShipmentRoute.VehicleLoad;

                        /**
                         * Encodes the specified VehicleLoad message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.VehicleLoad.verify|verify} messages.
                         * @param message VehicleLoad message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified VehicleLoad message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.VehicleLoad.verify|verify} messages.
                         * @param message VehicleLoad message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a VehicleLoad message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns VehicleLoad
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute.VehicleLoad;

                        /**
                         * Decodes a VehicleLoad message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns VehicleLoad
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute.VehicleLoad;

                        /**
                         * Verifies a VehicleLoad message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a VehicleLoad message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns VehicleLoad
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute.VehicleLoad;

                        /**
                         * Creates a plain object from a VehicleLoad message. Also converts values to other types if specified.
                         * @param message VehicleLoad
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentRoute.VehicleLoad, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this VehicleLoad to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for VehicleLoad
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of an EncodedPolyline. */
                    interface IEncodedPolyline {

                        /** EncodedPolyline points */
                        points?: (string|null);
                    }

                    /** Represents an EncodedPolyline. */
                    class EncodedPolyline implements IEncodedPolyline {

                        /**
                         * Constructs a new EncodedPolyline.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline);

                        /** EncodedPolyline points. */
                        public points: string;

                        /**
                         * Creates a new EncodedPolyline instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns EncodedPolyline instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline): google.cloud.optimization.v1.ShipmentRoute.EncodedPolyline;

                        /**
                         * Encodes the specified EncodedPolyline message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.EncodedPolyline.verify|verify} messages.
                         * @param message EncodedPolyline message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified EncodedPolyline message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.EncodedPolyline.verify|verify} messages.
                         * @param message EncodedPolyline message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an EncodedPolyline message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns EncodedPolyline
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute.EncodedPolyline;

                        /**
                         * Decodes an EncodedPolyline message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns EncodedPolyline
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute.EncodedPolyline;

                        /**
                         * Verifies an EncodedPolyline message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an EncodedPolyline message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns EncodedPolyline
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute.EncodedPolyline;

                        /**
                         * Creates a plain object from an EncodedPolyline message. Also converts values to other types if specified.
                         * @param message EncodedPolyline
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentRoute.EncodedPolyline, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this EncodedPolyline to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for EncodedPolyline
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a Break. */
                    interface IBreak {

                        /** Break startTime */
                        startTime?: (google.protobuf.ITimestamp|null);

                        /** Break duration */
                        duration?: (google.protobuf.IDuration|null);
                    }

                    /** Represents a Break. */
                    class Break implements IBreak {

                        /**
                         * Constructs a new Break.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentRoute.IBreak);

                        /** Break startTime. */
                        public startTime?: (google.protobuf.ITimestamp|null);

                        /** Break duration. */
                        public duration?: (google.protobuf.IDuration|null);

                        /**
                         * Creates a new Break instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Break instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentRoute.IBreak): google.cloud.optimization.v1.ShipmentRoute.Break;

                        /**
                         * Encodes the specified Break message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Break.verify|verify} messages.
                         * @param message Break message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentRoute.IBreak, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Break message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.Break.verify|verify} messages.
                         * @param message Break message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentRoute.IBreak, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Break message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Break
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute.Break;

                        /**
                         * Decodes a Break message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Break
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute.Break;

                        /**
                         * Verifies a Break message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Break message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Break
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute.Break;

                        /**
                         * Creates a plain object from a Break message. Also converts values to other types if specified.
                         * @param message Break
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentRoute.Break, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Break to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Break
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a TravelStep. */
                    interface ITravelStep {

                        /** TravelStep duration */
                        duration?: (google.protobuf.IDuration|null);

                        /** TravelStep distanceMeters */
                        distanceMeters?: (number|null);

                        /** TravelStep trafficInfoUnavailable */
                        trafficInfoUnavailable?: (boolean|null);

                        /** TravelStep routePolyline */
                        routePolyline?: (google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline|null);
                    }

                    /** Represents a TravelStep. */
                    class TravelStep implements ITravelStep {

                        /**
                         * Constructs a new TravelStep.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.ShipmentRoute.ITravelStep);

                        /** TravelStep duration. */
                        public duration?: (google.protobuf.IDuration|null);

                        /** TravelStep distanceMeters. */
                        public distanceMeters: number;

                        /** TravelStep trafficInfoUnavailable. */
                        public trafficInfoUnavailable: boolean;

                        /** TravelStep routePolyline. */
                        public routePolyline?: (google.cloud.optimization.v1.ShipmentRoute.IEncodedPolyline|null);

                        /**
                         * Creates a new TravelStep instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns TravelStep instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.ShipmentRoute.ITravelStep): google.cloud.optimization.v1.ShipmentRoute.TravelStep;

                        /**
                         * Encodes the specified TravelStep message. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.TravelStep.verify|verify} messages.
                         * @param message TravelStep message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.ShipmentRoute.ITravelStep, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified TravelStep message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ShipmentRoute.TravelStep.verify|verify} messages.
                         * @param message TravelStep message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.ShipmentRoute.ITravelStep, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a TravelStep message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns TravelStep
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ShipmentRoute.TravelStep;

                        /**
                         * Decodes a TravelStep message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns TravelStep
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ShipmentRoute.TravelStep;

                        /**
                         * Verifies a TravelStep message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a TravelStep message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns TravelStep
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ShipmentRoute.TravelStep;

                        /**
                         * Creates a plain object from a TravelStep message. Also converts values to other types if specified.
                         * @param message TravelStep
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.ShipmentRoute.TravelStep, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this TravelStep to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for TravelStep
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a SkippedShipment. */
                interface ISkippedShipment {

                    /** SkippedShipment index */
                    index?: (number|null);

                    /** SkippedShipment label */
                    label?: (string|null);

                    /** SkippedShipment shipmentName */
                    shipmentName?: (string|null);

                    /** SkippedShipment reasons */
                    reasons?: (google.cloud.optimization.v1.SkippedShipment.IReason[]|null);
                }

                /** Represents a SkippedShipment. */
                class SkippedShipment implements ISkippedShipment {

                    /**
                     * Constructs a new SkippedShipment.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ISkippedShipment);

                    /** SkippedShipment index. */
                    public index: number;

                    /** SkippedShipment label. */
                    public label: string;

                    /** SkippedShipment shipmentName. */
                    public shipmentName: string;

                    /** SkippedShipment reasons. */
                    public reasons: google.cloud.optimization.v1.SkippedShipment.IReason[];

                    /**
                     * Creates a new SkippedShipment instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns SkippedShipment instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ISkippedShipment): google.cloud.optimization.v1.SkippedShipment;

                    /**
                     * Encodes the specified SkippedShipment message. Does not implicitly {@link google.cloud.optimization.v1.SkippedShipment.verify|verify} messages.
                     * @param message SkippedShipment message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ISkippedShipment, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified SkippedShipment message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.SkippedShipment.verify|verify} messages.
                     * @param message SkippedShipment message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ISkippedShipment, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a SkippedShipment message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns SkippedShipment
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.SkippedShipment;

                    /**
                     * Decodes a SkippedShipment message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns SkippedShipment
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.SkippedShipment;

                    /**
                     * Verifies a SkippedShipment message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a SkippedShipment message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns SkippedShipment
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.SkippedShipment;

                    /**
                     * Creates a plain object from a SkippedShipment message. Also converts values to other types if specified.
                     * @param message SkippedShipment
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.SkippedShipment, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this SkippedShipment to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for SkippedShipment
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace SkippedShipment {

                    /** Properties of a Reason. */
                    interface IReason {

                        /** Reason code */
                        code?: (google.cloud.optimization.v1.SkippedShipment.Reason.Code|keyof typeof google.cloud.optimization.v1.SkippedShipment.Reason.Code|null);

                        /** Reason exampleVehicleIndex */
                        exampleVehicleIndex?: (number|null);

                        /** Reason exampleExceededCapacityType */
                        exampleExceededCapacityType?: (string|null);
                    }

                    /** Represents a Reason. */
                    class Reason implements IReason {

                        /**
                         * Constructs a new Reason.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.SkippedShipment.IReason);

                        /** Reason code. */
                        public code: (google.cloud.optimization.v1.SkippedShipment.Reason.Code|keyof typeof google.cloud.optimization.v1.SkippedShipment.Reason.Code);

                        /** Reason exampleVehicleIndex. */
                        public exampleVehicleIndex?: (number|null);

                        /** Reason exampleExceededCapacityType. */
                        public exampleExceededCapacityType: string;

                        /** Reason _exampleVehicleIndex. */
                        public _exampleVehicleIndex?: "exampleVehicleIndex";

                        /**
                         * Creates a new Reason instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Reason instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.SkippedShipment.IReason): google.cloud.optimization.v1.SkippedShipment.Reason;

                        /**
                         * Encodes the specified Reason message. Does not implicitly {@link google.cloud.optimization.v1.SkippedShipment.Reason.verify|verify} messages.
                         * @param message Reason message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.SkippedShipment.IReason, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Reason message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.SkippedShipment.Reason.verify|verify} messages.
                         * @param message Reason message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.SkippedShipment.IReason, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Reason message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Reason
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.SkippedShipment.Reason;

                        /**
                         * Decodes a Reason message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Reason
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.SkippedShipment.Reason;

                        /**
                         * Verifies a Reason message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Reason message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Reason
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.SkippedShipment.Reason;

                        /**
                         * Creates a plain object from a Reason message. Also converts values to other types if specified.
                         * @param message Reason
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.SkippedShipment.Reason, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Reason to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Reason
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    namespace Reason {

                        /** Code enum. */
                        enum Code {
                            CODE_UNSPECIFIED = 0,
                            NO_VEHICLE = 1,
                            DEMAND_EXCEEDS_VEHICLE_CAPACITY = 2,
                            CANNOT_BE_PERFORMED_WITHIN_VEHICLE_DISTANCE_LIMIT = 3,
                            CANNOT_BE_PERFORMED_WITHIN_VEHICLE_DURATION_LIMIT = 4,
                            CANNOT_BE_PERFORMED_WITHIN_VEHICLE_TRAVEL_DURATION_LIMIT = 5,
                            CANNOT_BE_PERFORMED_WITHIN_VEHICLE_TIME_WINDOWS = 6,
                            VEHICLE_NOT_ALLOWED = 7,
                            VEHICLE_IGNORED = 8,
                            SHIPMENT_IGNORED = 9,
                            SKIPPED_IN_INJECTED_SOLUTION_CONSTRAINT = 10,
                            VEHICLE_ROUTE_IS_FULLY_SEQUENCE_CONSTRAINED = 11,
                            VEHICLE_REQUIRED_OPERATOR_TYPE_NOT_FOUND = 12
                        }
                    }
                }

                /** Properties of an AggregatedMetrics. */
                interface IAggregatedMetrics {

                    /** AggregatedMetrics performedShipmentCount */
                    performedShipmentCount?: (number|null);

                    /** AggregatedMetrics performedMandatoryShipmentCount */
                    performedMandatoryShipmentCount?: (number|null);

                    /** AggregatedMetrics penaltyCostAvoided */
                    penaltyCostAvoided?: (number|null);

                    /** AggregatedMetrics travelDuration */
                    travelDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics waitDuration */
                    waitDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics delayDuration */
                    delayDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics breakDuration */
                    breakDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics visitDuration */
                    visitDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics totalDuration */
                    totalDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics travelDistanceMeters */
                    travelDistanceMeters?: (number|null);

                    /** AggregatedMetrics maxLoads */
                    maxLoads?: ({ [k: string]: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad }|null);

                    /** AggregatedMetrics costs */
                    costs?: ({ [k: string]: number }|null);

                    /** AggregatedMetrics totalCost */
                    totalCost?: (number|null);
                }

                /** Represents an AggregatedMetrics. */
                class AggregatedMetrics implements IAggregatedMetrics {

                    /**
                     * Constructs a new AggregatedMetrics.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IAggregatedMetrics);

                    /** AggregatedMetrics performedShipmentCount. */
                    public performedShipmentCount: number;

                    /** AggregatedMetrics performedMandatoryShipmentCount. */
                    public performedMandatoryShipmentCount?: (number|null);

                    /** AggregatedMetrics penaltyCostAvoided. */
                    public penaltyCostAvoided?: (number|null);

                    /** AggregatedMetrics travelDuration. */
                    public travelDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics waitDuration. */
                    public waitDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics delayDuration. */
                    public delayDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics breakDuration. */
                    public breakDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics visitDuration. */
                    public visitDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics totalDuration. */
                    public totalDuration?: (google.protobuf.IDuration|null);

                    /** AggregatedMetrics travelDistanceMeters. */
                    public travelDistanceMeters: number;

                    /** AggregatedMetrics maxLoads. */
                    public maxLoads: { [k: string]: google.cloud.optimization.v1.ShipmentRoute.IVehicleLoad };

                    /** AggregatedMetrics costs. */
                    public costs: { [k: string]: number };

                    /** AggregatedMetrics totalCost. */
                    public totalCost: number;

                    /** AggregatedMetrics _performedMandatoryShipmentCount. */
                    public _performedMandatoryShipmentCount?: "performedMandatoryShipmentCount";

                    /** AggregatedMetrics _penaltyCostAvoided. */
                    public _penaltyCostAvoided?: "penaltyCostAvoided";

                    /**
                     * Creates a new AggregatedMetrics instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns AggregatedMetrics instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IAggregatedMetrics): google.cloud.optimization.v1.AggregatedMetrics;

                    /**
                     * Encodes the specified AggregatedMetrics message. Does not implicitly {@link google.cloud.optimization.v1.AggregatedMetrics.verify|verify} messages.
                     * @param message AggregatedMetrics message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IAggregatedMetrics, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified AggregatedMetrics message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.AggregatedMetrics.verify|verify} messages.
                     * @param message AggregatedMetrics message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IAggregatedMetrics, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an AggregatedMetrics message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns AggregatedMetrics
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.AggregatedMetrics;

                    /**
                     * Decodes an AggregatedMetrics message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns AggregatedMetrics
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.AggregatedMetrics;

                    /**
                     * Verifies an AggregatedMetrics message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an AggregatedMetrics message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns AggregatedMetrics
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.AggregatedMetrics;

                    /**
                     * Creates a plain object from an AggregatedMetrics message. Also converts values to other types if specified.
                     * @param message AggregatedMetrics
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.AggregatedMetrics, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this AggregatedMetrics to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for AggregatedMetrics
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a VehicleFullness. */
                interface IVehicleFullness {

                    /** VehicleFullness maxFullness */
                    maxFullness?: (number|null);

                    /** VehicleFullness distance */
                    distance?: (number|null);

                    /** VehicleFullness travelDuration */
                    travelDuration?: (number|null);

                    /** VehicleFullness activeDuration */
                    activeDuration?: (number|null);

                    /** VehicleFullness maxLoad */
                    maxLoad?: (number|null);

                    /** VehicleFullness activeSpan */
                    activeSpan?: (number|null);
                }

                /** Represents a VehicleFullness. */
                class VehicleFullness implements IVehicleFullness {

                    /**
                     * Constructs a new VehicleFullness.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IVehicleFullness);

                    /** VehicleFullness maxFullness. */
                    public maxFullness?: (number|null);

                    /** VehicleFullness distance. */
                    public distance?: (number|null);

                    /** VehicleFullness travelDuration. */
                    public travelDuration?: (number|null);

                    /** VehicleFullness activeDuration. */
                    public activeDuration?: (number|null);

                    /** VehicleFullness maxLoad. */
                    public maxLoad?: (number|null);

                    /** VehicleFullness activeSpan. */
                    public activeSpan?: (number|null);

                    /** VehicleFullness _maxFullness. */
                    public _maxFullness?: "maxFullness";

                    /** VehicleFullness _distance. */
                    public _distance?: "distance";

                    /** VehicleFullness _travelDuration. */
                    public _travelDuration?: "travelDuration";

                    /** VehicleFullness _activeDuration. */
                    public _activeDuration?: "activeDuration";

                    /** VehicleFullness _maxLoad. */
                    public _maxLoad?: "maxLoad";

                    /** VehicleFullness _activeSpan. */
                    public _activeSpan?: "activeSpan";

                    /**
                     * Creates a new VehicleFullness instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns VehicleFullness instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IVehicleFullness): google.cloud.optimization.v1.VehicleFullness;

                    /**
                     * Encodes the specified VehicleFullness message. Does not implicitly {@link google.cloud.optimization.v1.VehicleFullness.verify|verify} messages.
                     * @param message VehicleFullness message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IVehicleFullness, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified VehicleFullness message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.VehicleFullness.verify|verify} messages.
                     * @param message VehicleFullness message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IVehicleFullness, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a VehicleFullness message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns VehicleFullness
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.VehicleFullness;

                    /**
                     * Decodes a VehicleFullness message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns VehicleFullness
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.VehicleFullness;

                    /**
                     * Verifies a VehicleFullness message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a VehicleFullness message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns VehicleFullness
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.VehicleFullness;

                    /**
                     * Creates a plain object from a VehicleFullness message. Also converts values to other types if specified.
                     * @param message VehicleFullness
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.VehicleFullness, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this VehicleFullness to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for VehicleFullness
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an InjectedSolutionConstraint. */
                interface IInjectedSolutionConstraint {

                    /** InjectedSolutionConstraint routes */
                    routes?: (google.cloud.optimization.v1.IShipmentRoute[]|null);

                    /** InjectedSolutionConstraint skippedShipments */
                    skippedShipments?: (google.cloud.optimization.v1.ISkippedShipment[]|null);

                    /** InjectedSolutionConstraint constraintRelaxations */
                    constraintRelaxations?: (google.cloud.optimization.v1.InjectedSolutionConstraint.IConstraintRelaxation[]|null);
                }

                /** Represents an InjectedSolutionConstraint. */
                class InjectedSolutionConstraint implements IInjectedSolutionConstraint {

                    /**
                     * Constructs a new InjectedSolutionConstraint.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IInjectedSolutionConstraint);

                    /** InjectedSolutionConstraint routes. */
                    public routes: google.cloud.optimization.v1.IShipmentRoute[];

                    /** InjectedSolutionConstraint skippedShipments. */
                    public skippedShipments: google.cloud.optimization.v1.ISkippedShipment[];

                    /** InjectedSolutionConstraint constraintRelaxations. */
                    public constraintRelaxations: google.cloud.optimization.v1.InjectedSolutionConstraint.IConstraintRelaxation[];

                    /**
                     * Creates a new InjectedSolutionConstraint instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns InjectedSolutionConstraint instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IInjectedSolutionConstraint): google.cloud.optimization.v1.InjectedSolutionConstraint;

                    /**
                     * Encodes the specified InjectedSolutionConstraint message. Does not implicitly {@link google.cloud.optimization.v1.InjectedSolutionConstraint.verify|verify} messages.
                     * @param message InjectedSolutionConstraint message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IInjectedSolutionConstraint, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified InjectedSolutionConstraint message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.InjectedSolutionConstraint.verify|verify} messages.
                     * @param message InjectedSolutionConstraint message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IInjectedSolutionConstraint, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an InjectedSolutionConstraint message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns InjectedSolutionConstraint
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.InjectedSolutionConstraint;

                    /**
                     * Decodes an InjectedSolutionConstraint message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns InjectedSolutionConstraint
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.InjectedSolutionConstraint;

                    /**
                     * Verifies an InjectedSolutionConstraint message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an InjectedSolutionConstraint message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns InjectedSolutionConstraint
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.InjectedSolutionConstraint;

                    /**
                     * Creates a plain object from an InjectedSolutionConstraint message. Also converts values to other types if specified.
                     * @param message InjectedSolutionConstraint
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.InjectedSolutionConstraint, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this InjectedSolutionConstraint to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for InjectedSolutionConstraint
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace InjectedSolutionConstraint {

                    /** Properties of a ConstraintRelaxation. */
                    interface IConstraintRelaxation {

                        /** ConstraintRelaxation relaxations */
                        relaxations?: (google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.IRelaxation[]|null);

                        /** ConstraintRelaxation vehicleIndices */
                        vehicleIndices?: (number[]|null);
                    }

                    /** Represents a ConstraintRelaxation. */
                    class ConstraintRelaxation implements IConstraintRelaxation {

                        /**
                         * Constructs a new ConstraintRelaxation.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.InjectedSolutionConstraint.IConstraintRelaxation);

                        /** ConstraintRelaxation relaxations. */
                        public relaxations: google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.IRelaxation[];

                        /** ConstraintRelaxation vehicleIndices. */
                        public vehicleIndices: number[];

                        /**
                         * Creates a new ConstraintRelaxation instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ConstraintRelaxation instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.InjectedSolutionConstraint.IConstraintRelaxation): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation;

                        /**
                         * Encodes the specified ConstraintRelaxation message. Does not implicitly {@link google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.verify|verify} messages.
                         * @param message ConstraintRelaxation message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.InjectedSolutionConstraint.IConstraintRelaxation, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ConstraintRelaxation message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.verify|verify} messages.
                         * @param message ConstraintRelaxation message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.InjectedSolutionConstraint.IConstraintRelaxation, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a ConstraintRelaxation message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns ConstraintRelaxation
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation;

                        /**
                         * Decodes a ConstraintRelaxation message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns ConstraintRelaxation
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation;

                        /**
                         * Verifies a ConstraintRelaxation message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a ConstraintRelaxation message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ConstraintRelaxation
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation;

                        /**
                         * Creates a plain object from a ConstraintRelaxation message. Also converts values to other types if specified.
                         * @param message ConstraintRelaxation
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ConstraintRelaxation to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for ConstraintRelaxation
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    namespace ConstraintRelaxation {

                        /** Properties of a Relaxation. */
                        interface IRelaxation {

                            /** Relaxation level */
                            level?: (google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.Level|keyof typeof google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.Level|null);

                            /** Relaxation thresholdTime */
                            thresholdTime?: (google.protobuf.ITimestamp|null);

                            /** Relaxation thresholdVisitCount */
                            thresholdVisitCount?: (number|null);
                        }

                        /** Represents a Relaxation. */
                        class Relaxation implements IRelaxation {

                            /**
                             * Constructs a new Relaxation.
                             * @param [properties] Properties to set
                             */
                            constructor(properties?: google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.IRelaxation);

                            /** Relaxation level. */
                            public level: (google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.Level|keyof typeof google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.Level);

                            /** Relaxation thresholdTime. */
                            public thresholdTime?: (google.protobuf.ITimestamp|null);

                            /** Relaxation thresholdVisitCount. */
                            public thresholdVisitCount: number;

                            /**
                             * Creates a new Relaxation instance using the specified properties.
                             * @param [properties] Properties to set
                             * @returns Relaxation instance
                             */
                            public static create(properties?: google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.IRelaxation): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation;

                            /**
                             * Encodes the specified Relaxation message. Does not implicitly {@link google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.verify|verify} messages.
                             * @param message Relaxation message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encode(message: google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.IRelaxation, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Encodes the specified Relaxation message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.verify|verify} messages.
                             * @param message Relaxation message or plain object to encode
                             * @param [writer] Writer to encode to
                             * @returns Writer
                             */
                            public static encodeDelimited(message: google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.IRelaxation, writer?: $protobuf.Writer): $protobuf.Writer;

                            /**
                             * Decodes a Relaxation message from the specified reader or buffer.
                             * @param reader Reader or buffer to decode from
                             * @param [length] Message length if known beforehand
                             * @returns Relaxation
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation;

                            /**
                             * Decodes a Relaxation message from the specified reader or buffer, length delimited.
                             * @param reader Reader or buffer to decode from
                             * @returns Relaxation
                             * @throws {Error} If the payload is not a reader or valid buffer
                             * @throws {$protobuf.util.ProtocolError} If required fields are missing
                             */
                            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation;

                            /**
                             * Verifies a Relaxation message.
                             * @param message Plain object to verify
                             * @returns `null` if valid, otherwise the reason why it is not
                             */
                            public static verify(message: { [k: string]: any }): (string|null);

                            /**
                             * Creates a Relaxation message from a plain object. Also converts values to their respective internal types.
                             * @param object Plain object
                             * @returns Relaxation
                             */
                            public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation;

                            /**
                             * Creates a plain object from a Relaxation message. Also converts values to other types if specified.
                             * @param message Relaxation
                             * @param [options] Conversion options
                             * @returns Plain object
                             */
                            public static toObject(message: google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                            /**
                             * Converts this Relaxation to JSON.
                             * @returns JSON object
                             */
                            public toJSON(): { [k: string]: any };

                            /**
                             * Gets the default type url for Relaxation
                             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                             * @returns The default type url
                             */
                            public static getTypeUrl(typeUrlPrefix?: string): string;
                        }

                        namespace Relaxation {

                            /** Level enum. */
                            enum Level {
                                LEVEL_UNSPECIFIED = 0,
                                RELAX_VISIT_TIMES_AFTER_THRESHOLD = 1,
                                RELAX_VISIT_TIMES_AND_SEQUENCE_AFTER_THRESHOLD = 2,
                                RELAX_ALL_AFTER_THRESHOLD = 3
                            }
                        }
                    }
                }

                /** Properties of an OptimizeToursValidationError. */
                interface IOptimizeToursValidationError {

                    /** OptimizeToursValidationError code */
                    code?: (number|null);

                    /** OptimizeToursValidationError displayName */
                    displayName?: (string|null);

                    /** OptimizeToursValidationError fields */
                    fields?: (google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference[]|null);

                    /** OptimizeToursValidationError errorMessage */
                    errorMessage?: (string|null);

                    /** OptimizeToursValidationError offendingValues */
                    offendingValues?: (string|null);
                }

                /** Represents an OptimizeToursValidationError. */
                class OptimizeToursValidationError implements IOptimizeToursValidationError {

                    /**
                     * Constructs a new OptimizeToursValidationError.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IOptimizeToursValidationError);

                    /** OptimizeToursValidationError code. */
                    public code: number;

                    /** OptimizeToursValidationError displayName. */
                    public displayName: string;

                    /** OptimizeToursValidationError fields. */
                    public fields: google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference[];

                    /** OptimizeToursValidationError errorMessage. */
                    public errorMessage: string;

                    /** OptimizeToursValidationError offendingValues. */
                    public offendingValues: string;

                    /**
                     * Creates a new OptimizeToursValidationError instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns OptimizeToursValidationError instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IOptimizeToursValidationError): google.cloud.optimization.v1.OptimizeToursValidationError;

                    /**
                     * Encodes the specified OptimizeToursValidationError message. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursValidationError.verify|verify} messages.
                     * @param message OptimizeToursValidationError message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IOptimizeToursValidationError, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified OptimizeToursValidationError message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursValidationError.verify|verify} messages.
                     * @param message OptimizeToursValidationError message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IOptimizeToursValidationError, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an OptimizeToursValidationError message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns OptimizeToursValidationError
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.OptimizeToursValidationError;

                    /**
                     * Decodes an OptimizeToursValidationError message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns OptimizeToursValidationError
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.OptimizeToursValidationError;

                    /**
                     * Verifies an OptimizeToursValidationError message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an OptimizeToursValidationError message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns OptimizeToursValidationError
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.OptimizeToursValidationError;

                    /**
                     * Creates a plain object from an OptimizeToursValidationError message. Also converts values to other types if specified.
                     * @param message OptimizeToursValidationError
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.OptimizeToursValidationError, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this OptimizeToursValidationError to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for OptimizeToursValidationError
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace OptimizeToursValidationError {

                    /** Properties of a FieldReference. */
                    interface IFieldReference {

                        /** FieldReference name */
                        name?: (string|null);

                        /** FieldReference index */
                        index?: (number|null);

                        /** FieldReference key */
                        key?: (string|null);

                        /** FieldReference subField */
                        subField?: (google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference|null);
                    }

                    /** Represents a FieldReference. */
                    class FieldReference implements IFieldReference {

                        /**
                         * Constructs a new FieldReference.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference);

                        /** FieldReference name. */
                        public name: string;

                        /** FieldReference index. */
                        public index?: (number|null);

                        /** FieldReference key. */
                        public key?: (string|null);

                        /** FieldReference subField. */
                        public subField?: (google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference|null);

                        /** FieldReference indexOrKey. */
                        public indexOrKey?: ("index"|"key");

                        /**
                         * Creates a new FieldReference instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns FieldReference instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference): google.cloud.optimization.v1.OptimizeToursValidationError.FieldReference;

                        /**
                         * Encodes the specified FieldReference message. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursValidationError.FieldReference.verify|verify} messages.
                         * @param message FieldReference message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified FieldReference message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.OptimizeToursValidationError.FieldReference.verify|verify} messages.
                         * @param message FieldReference message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.OptimizeToursValidationError.IFieldReference, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a FieldReference message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns FieldReference
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.OptimizeToursValidationError.FieldReference;

                        /**
                         * Decodes a FieldReference message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns FieldReference
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.OptimizeToursValidationError.FieldReference;

                        /**
                         * Verifies a FieldReference message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a FieldReference message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns FieldReference
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.OptimizeToursValidationError.FieldReference;

                        /**
                         * Creates a plain object from a FieldReference message. Also converts values to other types if specified.
                         * @param message FieldReference
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.OptimizeToursValidationError.FieldReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this FieldReference to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for FieldReference
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a Workspace. */
                interface IWorkspace {

                    /** Workspace name */
                    name?: (string|null);

                    /** Workspace displayName */
                    displayName?: (string|null);
                }

                /** Represents a Workspace. */
                class Workspace implements IWorkspace {

                    /**
                     * Constructs a new Workspace.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IWorkspace);

                    /** Workspace name. */
                    public name: string;

                    /** Workspace displayName. */
                    public displayName: string;

                    /**
                     * Creates a new Workspace instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Workspace instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IWorkspace): google.cloud.optimization.v1.Workspace;

                    /**
                     * Encodes the specified Workspace message. Does not implicitly {@link google.cloud.optimization.v1.Workspace.verify|verify} messages.
                     * @param message Workspace message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IWorkspace, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Workspace message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Workspace.verify|verify} messages.
                     * @param message Workspace message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IWorkspace, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Workspace message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Workspace
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Workspace;

                    /**
                     * Decodes a Workspace message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Workspace
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Workspace;

                    /**
                     * Verifies a Workspace message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Workspace message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Workspace
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Workspace;

                    /**
                     * Creates a plain object from a Workspace message. Also converts values to other types if specified.
                     * @param message Workspace
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.Workspace, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Workspace to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Workspace
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an Optimizer. */
                interface IOptimizer {

                    /** Optimizer name */
                    name?: (string|null);

                    /** Optimizer displayName */
                    displayName?: (string|null);

                    /** Optimizer modelSpec */
                    modelSpec?: (google.cloud.optimization.v1.Optimizer.IModelSpec|null);

                    /** Optimizer optimizeToursSpec */
                    optimizeToursSpec?: (google.cloud.optimization.v1.Optimizer.IOptimizeToursSpec|null);

                    /** Optimizer filters */
                    filters?: (google.cloud.optimization.v1.Optimizer.IFilters|null);
                }

                /** Represents an Optimizer. */
                class Optimizer implements IOptimizer {

                    /**
                     * Constructs a new Optimizer.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IOptimizer);

                    /** Optimizer name. */
                    public name: string;

                    /** Optimizer displayName. */
                    public displayName: string;

                    /** Optimizer modelSpec. */
                    public modelSpec?: (google.cloud.optimization.v1.Optimizer.IModelSpec|null);

                    /** Optimizer optimizeToursSpec. */
                    public optimizeToursSpec?: (google.cloud.optimization.v1.Optimizer.IOptimizeToursSpec|null);

                    /** Optimizer filters. */
                    public filters?: (google.cloud.optimization.v1.Optimizer.IFilters|null);

                    /**
                     * Creates a new Optimizer instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Optimizer instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IOptimizer): google.cloud.optimization.v1.Optimizer;

                    /**
                     * Encodes the specified Optimizer message. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.verify|verify} messages.
                     * @param message Optimizer message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IOptimizer, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Optimizer message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.verify|verify} messages.
                     * @param message Optimizer message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IOptimizer, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an Optimizer message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Optimizer
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Optimizer;

                    /**
                     * Decodes an Optimizer message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Optimizer
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Optimizer;

                    /**
                     * Verifies an Optimizer message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an Optimizer message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Optimizer
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Optimizer;

                    /**
                     * Creates a plain object from an Optimizer message. Also converts values to other types if specified.
                     * @param message Optimizer
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.Optimizer, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Optimizer to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Optimizer
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace Optimizer {

                    /** Properties of a ModelSpec. */
                    interface IModelSpec {

                        /** ModelSpec globalStartTime */
                        globalStartTime?: (google.protobuf.ITimestamp|null);

                        /** ModelSpec globalEndTime */
                        globalEndTime?: (google.protobuf.ITimestamp|null);

                        /** ModelSpec globalDurationCostPerHour */
                        globalDurationCostPerHour?: (number|null);

                        /** ModelSpec maxActiveVehicles */
                        maxActiveVehicles?: (number|null);

                        /** ModelSpec transitionAttributes */
                        transitionAttributes?: (google.cloud.optimization.v1.ITransitionAttributes[]|null);

                        /** ModelSpec shipmentTypeIncompatibilities */
                        shipmentTypeIncompatibilities?: (google.cloud.optimization.v1.IShipmentTypeIncompatibility[]|null);

                        /** ModelSpec shipmentTypeRequirements */
                        shipmentTypeRequirements?: (google.cloud.optimization.v1.IShipmentTypeRequirement[]|null);

                        /** ModelSpec precedenceRules */
                        precedenceRules?: (google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule[]|null);
                    }

                    /** Represents a ModelSpec. */
                    class ModelSpec implements IModelSpec {

                        /**
                         * Constructs a new ModelSpec.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Optimizer.IModelSpec);

                        /** ModelSpec globalStartTime. */
                        public globalStartTime?: (google.protobuf.ITimestamp|null);

                        /** ModelSpec globalEndTime. */
                        public globalEndTime?: (google.protobuf.ITimestamp|null);

                        /** ModelSpec globalDurationCostPerHour. */
                        public globalDurationCostPerHour: number;

                        /** ModelSpec maxActiveVehicles. */
                        public maxActiveVehicles?: (number|null);

                        /** ModelSpec transitionAttributes. */
                        public transitionAttributes: google.cloud.optimization.v1.ITransitionAttributes[];

                        /** ModelSpec shipmentTypeIncompatibilities. */
                        public shipmentTypeIncompatibilities: google.cloud.optimization.v1.IShipmentTypeIncompatibility[];

                        /** ModelSpec shipmentTypeRequirements. */
                        public shipmentTypeRequirements: google.cloud.optimization.v1.IShipmentTypeRequirement[];

                        /** ModelSpec precedenceRules. */
                        public precedenceRules: google.cloud.optimization.v1.ShipmentModel.IPrecedenceRule[];

                        /** ModelSpec _maxActiveVehicles. */
                        public _maxActiveVehicles?: "maxActiveVehicles";

                        /**
                         * Creates a new ModelSpec instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns ModelSpec instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Optimizer.IModelSpec): google.cloud.optimization.v1.Optimizer.ModelSpec;

                        /**
                         * Encodes the specified ModelSpec message. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.ModelSpec.verify|verify} messages.
                         * @param message ModelSpec message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Optimizer.IModelSpec, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified ModelSpec message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.ModelSpec.verify|verify} messages.
                         * @param message ModelSpec message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Optimizer.IModelSpec, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a ModelSpec message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns ModelSpec
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Optimizer.ModelSpec;

                        /**
                         * Decodes a ModelSpec message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns ModelSpec
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Optimizer.ModelSpec;

                        /**
                         * Verifies a ModelSpec message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a ModelSpec message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns ModelSpec
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Optimizer.ModelSpec;

                        /**
                         * Creates a plain object from a ModelSpec message. Also converts values to other types if specified.
                         * @param message ModelSpec
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Optimizer.ModelSpec, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this ModelSpec to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for ModelSpec
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of an OptimizeToursSpec. */
                    interface IOptimizeToursSpec {

                        /** OptimizeToursSpec timeout */
                        timeout?: (google.protobuf.IDuration|null);

                        /** OptimizeToursSpec searchMode */
                        searchMode?: (google.cloud.optimization.v1.OptimizeToursRequest.SearchMode|keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SearchMode|null);

                        /** OptimizeToursSpec considerRoadTraffic */
                        considerRoadTraffic?: (boolean|null);

                        /** OptimizeToursSpec populatePolylines */
                        populatePolylines?: (boolean|null);

                        /** OptimizeToursSpec populateTransitionPolylines */
                        populateTransitionPolylines?: (boolean|null);

                        /** OptimizeToursSpec allowLargeDeadlineDespiteInterruptionRisk */
                        allowLargeDeadlineDespiteInterruptionRisk?: (boolean|null);

                        /** OptimizeToursSpec useGeodesicDistances */
                        useGeodesicDistances?: (boolean|null);

                        /** OptimizeToursSpec geodesicMetersPerSecond */
                        geodesicMetersPerSecond?: (number|null);
                    }

                    /** Represents an OptimizeToursSpec. */
                    class OptimizeToursSpec implements IOptimizeToursSpec {

                        /**
                         * Constructs a new OptimizeToursSpec.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Optimizer.IOptimizeToursSpec);

                        /** OptimizeToursSpec timeout. */
                        public timeout?: (google.protobuf.IDuration|null);

                        /** OptimizeToursSpec searchMode. */
                        public searchMode: (google.cloud.optimization.v1.OptimizeToursRequest.SearchMode|keyof typeof google.cloud.optimization.v1.OptimizeToursRequest.SearchMode);

                        /** OptimizeToursSpec considerRoadTraffic. */
                        public considerRoadTraffic: boolean;

                        /** OptimizeToursSpec populatePolylines. */
                        public populatePolylines: boolean;

                        /** OptimizeToursSpec populateTransitionPolylines. */
                        public populateTransitionPolylines: boolean;

                        /** OptimizeToursSpec allowLargeDeadlineDespiteInterruptionRisk. */
                        public allowLargeDeadlineDespiteInterruptionRisk: boolean;

                        /** OptimizeToursSpec useGeodesicDistances. */
                        public useGeodesicDistances: boolean;

                        /** OptimizeToursSpec geodesicMetersPerSecond. */
                        public geodesicMetersPerSecond?: (number|null);

                        /** OptimizeToursSpec _geodesicMetersPerSecond. */
                        public _geodesicMetersPerSecond?: "geodesicMetersPerSecond";

                        /**
                         * Creates a new OptimizeToursSpec instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns OptimizeToursSpec instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Optimizer.IOptimizeToursSpec): google.cloud.optimization.v1.Optimizer.OptimizeToursSpec;

                        /**
                         * Encodes the specified OptimizeToursSpec message. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.OptimizeToursSpec.verify|verify} messages.
                         * @param message OptimizeToursSpec message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Optimizer.IOptimizeToursSpec, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified OptimizeToursSpec message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.OptimizeToursSpec.verify|verify} messages.
                         * @param message OptimizeToursSpec message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Optimizer.IOptimizeToursSpec, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes an OptimizeToursSpec message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns OptimizeToursSpec
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Optimizer.OptimizeToursSpec;

                        /**
                         * Decodes an OptimizeToursSpec message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns OptimizeToursSpec
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Optimizer.OptimizeToursSpec;

                        /**
                         * Verifies an OptimizeToursSpec message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates an OptimizeToursSpec message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns OptimizeToursSpec
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Optimizer.OptimizeToursSpec;

                        /**
                         * Creates a plain object from an OptimizeToursSpec message. Also converts values to other types if specified.
                         * @param message OptimizeToursSpec
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Optimizer.OptimizeToursSpec, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this OptimizeToursSpec to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for OptimizeToursSpec
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }

                    /** Properties of a Filters. */
                    interface IFilters {

                        /** Filters shipmentFilter */
                        shipmentFilter?: (string|null);

                        /** Filters vehicleFilter */
                        vehicleFilter?: (string|null);
                    }

                    /** Represents a Filters. */
                    class Filters implements IFilters {

                        /**
                         * Constructs a new Filters.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Optimizer.IFilters);

                        /** Filters shipmentFilter. */
                        public shipmentFilter: string;

                        /** Filters vehicleFilter. */
                        public vehicleFilter: string;

                        /**
                         * Creates a new Filters instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns Filters instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Optimizer.IFilters): google.cloud.optimization.v1.Optimizer.Filters;

                        /**
                         * Encodes the specified Filters message. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.Filters.verify|verify} messages.
                         * @param message Filters message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Optimizer.IFilters, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified Filters message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Optimizer.Filters.verify|verify} messages.
                         * @param message Filters message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Optimizer.IFilters, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a Filters message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns Filters
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Optimizer.Filters;

                        /**
                         * Decodes a Filters message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns Filters
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Optimizer.Filters;

                        /**
                         * Verifies a Filters message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a Filters message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns Filters
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Optimizer.Filters;

                        /**
                         * Creates a plain object from a Filters message. Also converts values to other types if specified.
                         * @param message Filters
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Optimizer.Filters, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this Filters to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for Filters
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Properties of a Solution. */
                interface ISolution {

                    /** Solution name */
                    name?: (string|null);

                    /** Solution displayName */
                    displayName?: (string|null);

                    /** Solution optimizationResponse */
                    optimizationResponse?: (google.cloud.optimization.v1.IOptimizeToursResponse|null);

                    /** Solution metadata */
                    metadata?: (google.cloud.optimization.v1.Solution.ISolutionMetadata|null);
                }

                /** Represents a Solution. */
                class Solution implements ISolution {

                    /**
                     * Constructs a new Solution.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ISolution);

                    /** Solution name. */
                    public name: string;

                    /** Solution displayName. */
                    public displayName: string;

                    /** Solution optimizationResponse. */
                    public optimizationResponse?: (google.cloud.optimization.v1.IOptimizeToursResponse|null);

                    /** Solution metadata. */
                    public metadata?: (google.cloud.optimization.v1.Solution.ISolutionMetadata|null);

                    /**
                     * Creates a new Solution instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Solution instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ISolution): google.cloud.optimization.v1.Solution;

                    /**
                     * Encodes the specified Solution message. Does not implicitly {@link google.cloud.optimization.v1.Solution.verify|verify} messages.
                     * @param message Solution message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ISolution, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Solution message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Solution.verify|verify} messages.
                     * @param message Solution message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ISolution, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Solution message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Solution
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Solution;

                    /**
                     * Decodes a Solution message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Solution
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Solution;

                    /**
                     * Verifies a Solution message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Solution message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Solution
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Solution;

                    /**
                     * Creates a plain object from a Solution message. Also converts values to other types if specified.
                     * @param message Solution
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.Solution, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Solution to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for Solution
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace Solution {

                    /** Properties of a SolutionMetadata. */
                    interface ISolutionMetadata {

                        /** SolutionMetadata optimizer */
                        optimizer?: (string|null);

                        /** SolutionMetadata optimizationStartTime */
                        optimizationStartTime?: (google.protobuf.ITimestamp|null);
                    }

                    /** Represents a SolutionMetadata. */
                    class SolutionMetadata implements ISolutionMetadata {

                        /**
                         * Constructs a new SolutionMetadata.
                         * @param [properties] Properties to set
                         */
                        constructor(properties?: google.cloud.optimization.v1.Solution.ISolutionMetadata);

                        /** SolutionMetadata optimizer. */
                        public optimizer: string;

                        /** SolutionMetadata optimizationStartTime. */
                        public optimizationStartTime?: (google.protobuf.ITimestamp|null);

                        /**
                         * Creates a new SolutionMetadata instance using the specified properties.
                         * @param [properties] Properties to set
                         * @returns SolutionMetadata instance
                         */
                        public static create(properties?: google.cloud.optimization.v1.Solution.ISolutionMetadata): google.cloud.optimization.v1.Solution.SolutionMetadata;

                        /**
                         * Encodes the specified SolutionMetadata message. Does not implicitly {@link google.cloud.optimization.v1.Solution.SolutionMetadata.verify|verify} messages.
                         * @param message SolutionMetadata message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encode(message: google.cloud.optimization.v1.Solution.ISolutionMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Encodes the specified SolutionMetadata message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.Solution.SolutionMetadata.verify|verify} messages.
                         * @param message SolutionMetadata message or plain object to encode
                         * @param [writer] Writer to encode to
                         * @returns Writer
                         */
                        public static encodeDelimited(message: google.cloud.optimization.v1.Solution.ISolutionMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

                        /**
                         * Decodes a SolutionMetadata message from the specified reader or buffer.
                         * @param reader Reader or buffer to decode from
                         * @param [length] Message length if known beforehand
                         * @returns SolutionMetadata
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.Solution.SolutionMetadata;

                        /**
                         * Decodes a SolutionMetadata message from the specified reader or buffer, length delimited.
                         * @param reader Reader or buffer to decode from
                         * @returns SolutionMetadata
                         * @throws {Error} If the payload is not a reader or valid buffer
                         * @throws {$protobuf.util.ProtocolError} If required fields are missing
                         */
                        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.Solution.SolutionMetadata;

                        /**
                         * Verifies a SolutionMetadata message.
                         * @param message Plain object to verify
                         * @returns `null` if valid, otherwise the reason why it is not
                         */
                        public static verify(message: { [k: string]: any }): (string|null);

                        /**
                         * Creates a SolutionMetadata message from a plain object. Also converts values to their respective internal types.
                         * @param object Plain object
                         * @returns SolutionMetadata
                         */
                        public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.Solution.SolutionMetadata;

                        /**
                         * Creates a plain object from a SolutionMetadata message. Also converts values to other types if specified.
                         * @param message SolutionMetadata
                         * @param [options] Conversion options
                         * @returns Plain object
                         */
                        public static toObject(message: google.cloud.optimization.v1.Solution.SolutionMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

                        /**
                         * Converts this SolutionMetadata to JSON.
                         * @returns JSON object
                         */
                        public toJSON(): { [k: string]: any };

                        /**
                         * Gets the default type url for SolutionMetadata
                         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                         * @returns The default type url
                         */
                        public static getTypeUrl(typeUrlPrefix?: string): string;
                    }
                }

                /** Represents a StatefulFleetRouting */
                class StatefulFleetRouting extends $protobuf.rpc.Service {

                    /**
                     * Constructs a new StatefulFleetRouting service.
                     * @param rpcImpl RPC implementation
                     * @param [requestDelimited=false] Whether requests are length-delimited
                     * @param [responseDelimited=false] Whether responses are length-delimited
                     */
                    constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

                    /**
                     * Creates new StatefulFleetRouting service using the specified rpc implementation.
                     * @param rpcImpl RPC implementation
                     * @param [requestDelimited=false] Whether requests are length-delimited
                     * @param [responseDelimited=false] Whether responses are length-delimited
                     * @returns RPC service. Useful where requests and/or responses are streamed.
                     */
                    public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): StatefulFleetRouting;

                    /**
                     * Calls CreateWorkspace.
                     * @param request CreateWorkspaceRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Workspace
                     */
                    public createWorkspace(request: google.cloud.optimization.v1.ICreateWorkspaceRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.CreateWorkspaceCallback): void;

                    /**
                     * Calls CreateWorkspace.
                     * @param request CreateWorkspaceRequest message or plain object
                     * @returns Promise
                     */
                    public createWorkspace(request: google.cloud.optimization.v1.ICreateWorkspaceRequest): Promise<google.cloud.optimization.v1.Workspace>;

                    /**
                     * Calls ListWorkspaces.
                     * @param request ListWorkspacesRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and ListWorkspacesResponse
                     */
                    public listWorkspaces(request: google.cloud.optimization.v1.IListWorkspacesRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.ListWorkspacesCallback): void;

                    /**
                     * Calls ListWorkspaces.
                     * @param request ListWorkspacesRequest message or plain object
                     * @returns Promise
                     */
                    public listWorkspaces(request: google.cloud.optimization.v1.IListWorkspacesRequest): Promise<google.cloud.optimization.v1.ListWorkspacesResponse>;

                    /**
                     * Calls UpdateWorkspace.
                     * @param request UpdateWorkspaceRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Workspace
                     */
                    public updateWorkspace(request: google.cloud.optimization.v1.IUpdateWorkspaceRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.UpdateWorkspaceCallback): void;

                    /**
                     * Calls UpdateWorkspace.
                     * @param request UpdateWorkspaceRequest message or plain object
                     * @returns Promise
                     */
                    public updateWorkspace(request: google.cloud.optimization.v1.IUpdateWorkspaceRequest): Promise<google.cloud.optimization.v1.Workspace>;

                    /**
                     * Calls DeleteWorkspace.
                     * @param request DeleteWorkspaceRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Empty
                     */
                    public deleteWorkspace(request: google.cloud.optimization.v1.IDeleteWorkspaceRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.DeleteWorkspaceCallback): void;

                    /**
                     * Calls DeleteWorkspace.
                     * @param request DeleteWorkspaceRequest message or plain object
                     * @returns Promise
                     */
                    public deleteWorkspace(request: google.cloud.optimization.v1.IDeleteWorkspaceRequest): Promise<google.protobuf.Empty>;

                    /**
                     * Calls CreateVehicle.
                     * @param request CreateVehicleRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Vehicle
                     */
                    public createVehicle(request: google.cloud.optimization.v1.ICreateVehicleRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.CreateVehicleCallback): void;

                    /**
                     * Calls CreateVehicle.
                     * @param request CreateVehicleRequest message or plain object
                     * @returns Promise
                     */
                    public createVehicle(request: google.cloud.optimization.v1.ICreateVehicleRequest): Promise<google.cloud.optimization.v1.Vehicle>;

                    /**
                     * Calls GetVehicle.
                     * @param request GetVehicleRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Vehicle
                     */
                    public getVehicle(request: google.cloud.optimization.v1.IGetVehicleRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.GetVehicleCallback): void;

                    /**
                     * Calls GetVehicle.
                     * @param request GetVehicleRequest message or plain object
                     * @returns Promise
                     */
                    public getVehicle(request: google.cloud.optimization.v1.IGetVehicleRequest): Promise<google.cloud.optimization.v1.Vehicle>;

                    /**
                     * Calls ListVehicles.
                     * @param request ListVehiclesRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and ListVehiclesResponse
                     */
                    public listVehicles(request: google.cloud.optimization.v1.IListVehiclesRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.ListVehiclesCallback): void;

                    /**
                     * Calls ListVehicles.
                     * @param request ListVehiclesRequest message or plain object
                     * @returns Promise
                     */
                    public listVehicles(request: google.cloud.optimization.v1.IListVehiclesRequest): Promise<google.cloud.optimization.v1.ListVehiclesResponse>;

                    /**
                     * Calls UpdateVehicle.
                     * @param request UpdateVehicleRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Vehicle
                     */
                    public updateVehicle(request: google.cloud.optimization.v1.IUpdateVehicleRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.UpdateVehicleCallback): void;

                    /**
                     * Calls UpdateVehicle.
                     * @param request UpdateVehicleRequest message or plain object
                     * @returns Promise
                     */
                    public updateVehicle(request: google.cloud.optimization.v1.IUpdateVehicleRequest): Promise<google.cloud.optimization.v1.Vehicle>;

                    /**
                     * Calls DeleteVehicle.
                     * @param request DeleteVehicleRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Empty
                     */
                    public deleteVehicle(request: google.cloud.optimization.v1.IDeleteVehicleRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.DeleteVehicleCallback): void;

                    /**
                     * Calls DeleteVehicle.
                     * @param request DeleteVehicleRequest message or plain object
                     * @returns Promise
                     */
                    public deleteVehicle(request: google.cloud.optimization.v1.IDeleteVehicleRequest): Promise<google.protobuf.Empty>;

                    /**
                     * Calls CreateShipment.
                     * @param request CreateShipmentRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Shipment
                     */
                    public createShipment(request: google.cloud.optimization.v1.ICreateShipmentRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.CreateShipmentCallback): void;

                    /**
                     * Calls CreateShipment.
                     * @param request CreateShipmentRequest message or plain object
                     * @returns Promise
                     */
                    public createShipment(request: google.cloud.optimization.v1.ICreateShipmentRequest): Promise<google.cloud.optimization.v1.Shipment>;

                    /**
                     * Calls GetShipment.
                     * @param request GetShipmentRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Shipment
                     */
                    public getShipment(request: google.cloud.optimization.v1.IGetShipmentRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.GetShipmentCallback): void;

                    /**
                     * Calls GetShipment.
                     * @param request GetShipmentRequest message or plain object
                     * @returns Promise
                     */
                    public getShipment(request: google.cloud.optimization.v1.IGetShipmentRequest): Promise<google.cloud.optimization.v1.Shipment>;

                    /**
                     * Calls ListShipments.
                     * @param request ListShipmentsRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and ListShipmentsResponse
                     */
                    public listShipments(request: google.cloud.optimization.v1.IListShipmentsRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.ListShipmentsCallback): void;

                    /**
                     * Calls ListShipments.
                     * @param request ListShipmentsRequest message or plain object
                     * @returns Promise
                     */
                    public listShipments(request: google.cloud.optimization.v1.IListShipmentsRequest): Promise<google.cloud.optimization.v1.ListShipmentsResponse>;

                    /**
                     * Calls UpdateShipment.
                     * @param request UpdateShipmentRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Shipment
                     */
                    public updateShipment(request: google.cloud.optimization.v1.IUpdateShipmentRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.UpdateShipmentCallback): void;

                    /**
                     * Calls UpdateShipment.
                     * @param request UpdateShipmentRequest message or plain object
                     * @returns Promise
                     */
                    public updateShipment(request: google.cloud.optimization.v1.IUpdateShipmentRequest): Promise<google.cloud.optimization.v1.Shipment>;

                    /**
                     * Calls DeleteShipment.
                     * @param request DeleteShipmentRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Empty
                     */
                    public deleteShipment(request: google.cloud.optimization.v1.IDeleteShipmentRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.DeleteShipmentCallback): void;

                    /**
                     * Calls DeleteShipment.
                     * @param request DeleteShipmentRequest message or plain object
                     * @returns Promise
                     */
                    public deleteShipment(request: google.cloud.optimization.v1.IDeleteShipmentRequest): Promise<google.protobuf.Empty>;

                    /**
                     * Calls GetSolution.
                     * @param request GetSolutionRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Solution
                     */
                    public getSolution(request: google.cloud.optimization.v1.IGetSolutionRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.GetSolutionCallback): void;

                    /**
                     * Calls GetSolution.
                     * @param request GetSolutionRequest message or plain object
                     * @returns Promise
                     */
                    public getSolution(request: google.cloud.optimization.v1.IGetSolutionRequest): Promise<google.cloud.optimization.v1.Solution>;

                    /**
                     * Calls ListSolutions.
                     * @param request ListSolutionsRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and ListSolutionsResponse
                     */
                    public listSolutions(request: google.cloud.optimization.v1.IListSolutionsRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.ListSolutionsCallback): void;

                    /**
                     * Calls ListSolutions.
                     * @param request ListSolutionsRequest message or plain object
                     * @returns Promise
                     */
                    public listSolutions(request: google.cloud.optimization.v1.IListSolutionsRequest): Promise<google.cloud.optimization.v1.ListSolutionsResponse>;

                    /**
                     * Calls DeleteSolution.
                     * @param request DeleteSolutionRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Empty
                     */
                    public deleteSolution(request: google.cloud.optimization.v1.IDeleteSolutionRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.DeleteSolutionCallback): void;

                    /**
                     * Calls DeleteSolution.
                     * @param request DeleteSolutionRequest message or plain object
                     * @returns Promise
                     */
                    public deleteSolution(request: google.cloud.optimization.v1.IDeleteSolutionRequest): Promise<google.protobuf.Empty>;

                    /**
                     * Calls RetrieveInput.
                     * @param request RetrieveInputRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and RetrieveInputResponse
                     */
                    public retrieveInput(request: google.cloud.optimization.v1.IRetrieveInputRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.RetrieveInputCallback): void;

                    /**
                     * Calls RetrieveInput.
                     * @param request RetrieveInputRequest message or plain object
                     * @returns Promise
                     */
                    public retrieveInput(request: google.cloud.optimization.v1.IRetrieveInputRequest): Promise<google.cloud.optimization.v1.RetrieveInputResponse>;

                    /**
                     * Calls CreateOptimizer.
                     * @param request CreateOptimizerRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Optimizer
                     */
                    public createOptimizer(request: google.cloud.optimization.v1.ICreateOptimizerRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.CreateOptimizerCallback): void;

                    /**
                     * Calls CreateOptimizer.
                     * @param request CreateOptimizerRequest message or plain object
                     * @returns Promise
                     */
                    public createOptimizer(request: google.cloud.optimization.v1.ICreateOptimizerRequest): Promise<google.cloud.optimization.v1.Optimizer>;

                    /**
                     * Calls GetOptimizer.
                     * @param request GetOptimizerRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Optimizer
                     */
                    public getOptimizer(request: google.cloud.optimization.v1.IGetOptimizerRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.GetOptimizerCallback): void;

                    /**
                     * Calls GetOptimizer.
                     * @param request GetOptimizerRequest message or plain object
                     * @returns Promise
                     */
                    public getOptimizer(request: google.cloud.optimization.v1.IGetOptimizerRequest): Promise<google.cloud.optimization.v1.Optimizer>;

                    /**
                     * Calls UpdateOptimizer.
                     * @param request UpdateOptimizerRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Optimizer
                     */
                    public updateOptimizer(request: google.cloud.optimization.v1.IUpdateOptimizerRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.UpdateOptimizerCallback): void;

                    /**
                     * Calls UpdateOptimizer.
                     * @param request UpdateOptimizerRequest message or plain object
                     * @returns Promise
                     */
                    public updateOptimizer(request: google.cloud.optimization.v1.IUpdateOptimizerRequest): Promise<google.cloud.optimization.v1.Optimizer>;

                    /**
                     * Calls DeleteOptimizer.
                     * @param request DeleteOptimizerRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Empty
                     */
                    public deleteOptimizer(request: google.cloud.optimization.v1.IDeleteOptimizerRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.DeleteOptimizerCallback): void;

                    /**
                     * Calls DeleteOptimizer.
                     * @param request DeleteOptimizerRequest message or plain object
                     * @returns Promise
                     */
                    public deleteOptimizer(request: google.cloud.optimization.v1.IDeleteOptimizerRequest): Promise<google.protobuf.Empty>;

                    /**
                     * Calls ListOptimizers.
                     * @param request ListOptimizersRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and ListOptimizersResponse
                     */
                    public listOptimizers(request: google.cloud.optimization.v1.IListOptimizersRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.ListOptimizersCallback): void;

                    /**
                     * Calls ListOptimizers.
                     * @param request ListOptimizersRequest message or plain object
                     * @returns Promise
                     */
                    public listOptimizers(request: google.cloud.optimization.v1.IListOptimizersRequest): Promise<google.cloud.optimization.v1.ListOptimizersResponse>;

                    /**
                     * Calls RunOptimizer.
                     * @param request RunOptimizerRequest message or plain object
                     * @param callback Node-style callback called with the error, if any, and Operation
                     */
                    public runOptimizer(request: google.cloud.optimization.v1.IRunOptimizerRequest, callback: google.cloud.optimization.v1.StatefulFleetRouting.RunOptimizerCallback): void;

                    /**
                     * Calls RunOptimizer.
                     * @param request RunOptimizerRequest message or plain object
                     * @returns Promise
                     */
                    public runOptimizer(request: google.cloud.optimization.v1.IRunOptimizerRequest): Promise<google.longrunning.Operation>;
                }

                namespace StatefulFleetRouting {

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|createWorkspace}.
                     * @param error Error, if any
                     * @param [response] Workspace
                     */
                    type CreateWorkspaceCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Workspace) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|listWorkspaces}.
                     * @param error Error, if any
                     * @param [response] ListWorkspacesResponse
                     */
                    type ListWorkspacesCallback = (error: (Error|null), response?: google.cloud.optimization.v1.ListWorkspacesResponse) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|updateWorkspace}.
                     * @param error Error, if any
                     * @param [response] Workspace
                     */
                    type UpdateWorkspaceCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Workspace) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|deleteWorkspace}.
                     * @param error Error, if any
                     * @param [response] Empty
                     */
                    type DeleteWorkspaceCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|createVehicle}.
                     * @param error Error, if any
                     * @param [response] Vehicle
                     */
                    type CreateVehicleCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Vehicle) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|getVehicle}.
                     * @param error Error, if any
                     * @param [response] Vehicle
                     */
                    type GetVehicleCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Vehicle) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|listVehicles}.
                     * @param error Error, if any
                     * @param [response] ListVehiclesResponse
                     */
                    type ListVehiclesCallback = (error: (Error|null), response?: google.cloud.optimization.v1.ListVehiclesResponse) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|updateVehicle}.
                     * @param error Error, if any
                     * @param [response] Vehicle
                     */
                    type UpdateVehicleCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Vehicle) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|deleteVehicle}.
                     * @param error Error, if any
                     * @param [response] Empty
                     */
                    type DeleteVehicleCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|createShipment}.
                     * @param error Error, if any
                     * @param [response] Shipment
                     */
                    type CreateShipmentCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Shipment) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|getShipment}.
                     * @param error Error, if any
                     * @param [response] Shipment
                     */
                    type GetShipmentCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Shipment) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|listShipments}.
                     * @param error Error, if any
                     * @param [response] ListShipmentsResponse
                     */
                    type ListShipmentsCallback = (error: (Error|null), response?: google.cloud.optimization.v1.ListShipmentsResponse) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|updateShipment}.
                     * @param error Error, if any
                     * @param [response] Shipment
                     */
                    type UpdateShipmentCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Shipment) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|deleteShipment}.
                     * @param error Error, if any
                     * @param [response] Empty
                     */
                    type DeleteShipmentCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|getSolution}.
                     * @param error Error, if any
                     * @param [response] Solution
                     */
                    type GetSolutionCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Solution) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|listSolutions}.
                     * @param error Error, if any
                     * @param [response] ListSolutionsResponse
                     */
                    type ListSolutionsCallback = (error: (Error|null), response?: google.cloud.optimization.v1.ListSolutionsResponse) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|deleteSolution}.
                     * @param error Error, if any
                     * @param [response] Empty
                     */
                    type DeleteSolutionCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|retrieveInput}.
                     * @param error Error, if any
                     * @param [response] RetrieveInputResponse
                     */
                    type RetrieveInputCallback = (error: (Error|null), response?: google.cloud.optimization.v1.RetrieveInputResponse) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|createOptimizer}.
                     * @param error Error, if any
                     * @param [response] Optimizer
                     */
                    type CreateOptimizerCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Optimizer) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|getOptimizer}.
                     * @param error Error, if any
                     * @param [response] Optimizer
                     */
                    type GetOptimizerCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Optimizer) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|updateOptimizer}.
                     * @param error Error, if any
                     * @param [response] Optimizer
                     */
                    type UpdateOptimizerCallback = (error: (Error|null), response?: google.cloud.optimization.v1.Optimizer) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|deleteOptimizer}.
                     * @param error Error, if any
                     * @param [response] Empty
                     */
                    type DeleteOptimizerCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|listOptimizers}.
                     * @param error Error, if any
                     * @param [response] ListOptimizersResponse
                     */
                    type ListOptimizersCallback = (error: (Error|null), response?: google.cloud.optimization.v1.ListOptimizersResponse) => void;

                    /**
                     * Callback as used by {@link google.cloud.optimization.v1.StatefulFleetRouting|runOptimizer}.
                     * @param error Error, if any
                     * @param [response] Operation
                     */
                    type RunOptimizerCallback = (error: (Error|null), response?: google.longrunning.Operation) => void;
                }

                /** Properties of a CreateWorkspaceRequest. */
                interface ICreateWorkspaceRequest {

                    /** CreateWorkspaceRequest parent */
                    parent?: (string|null);

                    /** CreateWorkspaceRequest workspace */
                    workspace?: (google.cloud.optimization.v1.IWorkspace|null);

                    /** CreateWorkspaceRequest workspaceId */
                    workspaceId?: (string|null);
                }

                /** Represents a CreateWorkspaceRequest. */
                class CreateWorkspaceRequest implements ICreateWorkspaceRequest {

                    /**
                     * Constructs a new CreateWorkspaceRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ICreateWorkspaceRequest);

                    /** CreateWorkspaceRequest parent. */
                    public parent: string;

                    /** CreateWorkspaceRequest workspace. */
                    public workspace?: (google.cloud.optimization.v1.IWorkspace|null);

                    /** CreateWorkspaceRequest workspaceId. */
                    public workspaceId: string;

                    /**
                     * Creates a new CreateWorkspaceRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CreateWorkspaceRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ICreateWorkspaceRequest): google.cloud.optimization.v1.CreateWorkspaceRequest;

                    /**
                     * Encodes the specified CreateWorkspaceRequest message. Does not implicitly {@link google.cloud.optimization.v1.CreateWorkspaceRequest.verify|verify} messages.
                     * @param message CreateWorkspaceRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ICreateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CreateWorkspaceRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.CreateWorkspaceRequest.verify|verify} messages.
                     * @param message CreateWorkspaceRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ICreateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CreateWorkspaceRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CreateWorkspaceRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.CreateWorkspaceRequest;

                    /**
                     * Decodes a CreateWorkspaceRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CreateWorkspaceRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.CreateWorkspaceRequest;

                    /**
                     * Verifies a CreateWorkspaceRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CreateWorkspaceRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CreateWorkspaceRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.CreateWorkspaceRequest;

                    /**
                     * Creates a plain object from a CreateWorkspaceRequest message. Also converts values to other types if specified.
                     * @param message CreateWorkspaceRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.CreateWorkspaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CreateWorkspaceRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CreateWorkspaceRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListWorkspacesRequest. */
                interface IListWorkspacesRequest {

                    /** ListWorkspacesRequest parent */
                    parent?: (string|null);

                    /** ListWorkspacesRequest pageSize */
                    pageSize?: (number|null);

                    /** ListWorkspacesRequest pageToken */
                    pageToken?: (string|null);

                    /** ListWorkspacesRequest filter */
                    filter?: (string|null);
                }

                /** Represents a ListWorkspacesRequest. */
                class ListWorkspacesRequest implements IListWorkspacesRequest {

                    /**
                     * Constructs a new ListWorkspacesRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListWorkspacesRequest);

                    /** ListWorkspacesRequest parent. */
                    public parent: string;

                    /** ListWorkspacesRequest pageSize. */
                    public pageSize: number;

                    /** ListWorkspacesRequest pageToken. */
                    public pageToken: string;

                    /** ListWorkspacesRequest filter. */
                    public filter: string;

                    /**
                     * Creates a new ListWorkspacesRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListWorkspacesRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListWorkspacesRequest): google.cloud.optimization.v1.ListWorkspacesRequest;

                    /**
                     * Encodes the specified ListWorkspacesRequest message. Does not implicitly {@link google.cloud.optimization.v1.ListWorkspacesRequest.verify|verify} messages.
                     * @param message ListWorkspacesRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListWorkspacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListWorkspacesRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListWorkspacesRequest.verify|verify} messages.
                     * @param message ListWorkspacesRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListWorkspacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListWorkspacesRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListWorkspacesRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListWorkspacesRequest;

                    /**
                     * Decodes a ListWorkspacesRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListWorkspacesRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListWorkspacesRequest;

                    /**
                     * Verifies a ListWorkspacesRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListWorkspacesRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListWorkspacesRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListWorkspacesRequest;

                    /**
                     * Creates a plain object from a ListWorkspacesRequest message. Also converts values to other types if specified.
                     * @param message ListWorkspacesRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListWorkspacesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListWorkspacesRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListWorkspacesRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListWorkspacesResponse. */
                interface IListWorkspacesResponse {

                    /** ListWorkspacesResponse workspaces */
                    workspaces?: (google.cloud.optimization.v1.IWorkspace[]|null);

                    /** ListWorkspacesResponse nextPageToken */
                    nextPageToken?: (string|null);
                }

                /** Represents a ListWorkspacesResponse. */
                class ListWorkspacesResponse implements IListWorkspacesResponse {

                    /**
                     * Constructs a new ListWorkspacesResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListWorkspacesResponse);

                    /** ListWorkspacesResponse workspaces. */
                    public workspaces: google.cloud.optimization.v1.IWorkspace[];

                    /** ListWorkspacesResponse nextPageToken. */
                    public nextPageToken: string;

                    /**
                     * Creates a new ListWorkspacesResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListWorkspacesResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListWorkspacesResponse): google.cloud.optimization.v1.ListWorkspacesResponse;

                    /**
                     * Encodes the specified ListWorkspacesResponse message. Does not implicitly {@link google.cloud.optimization.v1.ListWorkspacesResponse.verify|verify} messages.
                     * @param message ListWorkspacesResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListWorkspacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListWorkspacesResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListWorkspacesResponse.verify|verify} messages.
                     * @param message ListWorkspacesResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListWorkspacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListWorkspacesResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListWorkspacesResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListWorkspacesResponse;

                    /**
                     * Decodes a ListWorkspacesResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListWorkspacesResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListWorkspacesResponse;

                    /**
                     * Verifies a ListWorkspacesResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListWorkspacesResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListWorkspacesResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListWorkspacesResponse;

                    /**
                     * Creates a plain object from a ListWorkspacesResponse message. Also converts values to other types if specified.
                     * @param message ListWorkspacesResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListWorkspacesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListWorkspacesResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListWorkspacesResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an UpdateWorkspaceRequest. */
                interface IUpdateWorkspaceRequest {

                    /** UpdateWorkspaceRequest workspace */
                    workspace?: (google.cloud.optimization.v1.IWorkspace|null);

                    /** UpdateWorkspaceRequest updateMask */
                    updateMask?: (google.protobuf.IFieldMask|null);
                }

                /** Represents an UpdateWorkspaceRequest. */
                class UpdateWorkspaceRequest implements IUpdateWorkspaceRequest {

                    /**
                     * Constructs a new UpdateWorkspaceRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IUpdateWorkspaceRequest);

                    /** UpdateWorkspaceRequest workspace. */
                    public workspace?: (google.cloud.optimization.v1.IWorkspace|null);

                    /** UpdateWorkspaceRequest updateMask. */
                    public updateMask?: (google.protobuf.IFieldMask|null);

                    /**
                     * Creates a new UpdateWorkspaceRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns UpdateWorkspaceRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IUpdateWorkspaceRequest): google.cloud.optimization.v1.UpdateWorkspaceRequest;

                    /**
                     * Encodes the specified UpdateWorkspaceRequest message. Does not implicitly {@link google.cloud.optimization.v1.UpdateWorkspaceRequest.verify|verify} messages.
                     * @param message UpdateWorkspaceRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IUpdateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified UpdateWorkspaceRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.UpdateWorkspaceRequest.verify|verify} messages.
                     * @param message UpdateWorkspaceRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IUpdateWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an UpdateWorkspaceRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns UpdateWorkspaceRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.UpdateWorkspaceRequest;

                    /**
                     * Decodes an UpdateWorkspaceRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns UpdateWorkspaceRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.UpdateWorkspaceRequest;

                    /**
                     * Verifies an UpdateWorkspaceRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an UpdateWorkspaceRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns UpdateWorkspaceRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.UpdateWorkspaceRequest;

                    /**
                     * Creates a plain object from an UpdateWorkspaceRequest message. Also converts values to other types if specified.
                     * @param message UpdateWorkspaceRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.UpdateWorkspaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this UpdateWorkspaceRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for UpdateWorkspaceRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a DeleteWorkspaceRequest. */
                interface IDeleteWorkspaceRequest {

                    /** DeleteWorkspaceRequest name */
                    name?: (string|null);
                }

                /** Represents a DeleteWorkspaceRequest. */
                class DeleteWorkspaceRequest implements IDeleteWorkspaceRequest {

                    /**
                     * Constructs a new DeleteWorkspaceRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IDeleteWorkspaceRequest);

                    /** DeleteWorkspaceRequest name. */
                    public name: string;

                    /**
                     * Creates a new DeleteWorkspaceRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DeleteWorkspaceRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IDeleteWorkspaceRequest): google.cloud.optimization.v1.DeleteWorkspaceRequest;

                    /**
                     * Encodes the specified DeleteWorkspaceRequest message. Does not implicitly {@link google.cloud.optimization.v1.DeleteWorkspaceRequest.verify|verify} messages.
                     * @param message DeleteWorkspaceRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IDeleteWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DeleteWorkspaceRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.DeleteWorkspaceRequest.verify|verify} messages.
                     * @param message DeleteWorkspaceRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IDeleteWorkspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DeleteWorkspaceRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DeleteWorkspaceRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.DeleteWorkspaceRequest;

                    /**
                     * Decodes a DeleteWorkspaceRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DeleteWorkspaceRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.DeleteWorkspaceRequest;

                    /**
                     * Verifies a DeleteWorkspaceRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DeleteWorkspaceRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DeleteWorkspaceRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.DeleteWorkspaceRequest;

                    /**
                     * Creates a plain object from a DeleteWorkspaceRequest message. Also converts values to other types if specified.
                     * @param message DeleteWorkspaceRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.DeleteWorkspaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DeleteWorkspaceRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for DeleteWorkspaceRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a CreateVehicleRequest. */
                interface ICreateVehicleRequest {

                    /** CreateVehicleRequest parent */
                    parent?: (string|null);

                    /** CreateVehicleRequest vehicle */
                    vehicle?: (google.cloud.optimization.v1.IVehicle|null);

                    /** CreateVehicleRequest vehicleId */
                    vehicleId?: (string|null);
                }

                /** Represents a CreateVehicleRequest. */
                class CreateVehicleRequest implements ICreateVehicleRequest {

                    /**
                     * Constructs a new CreateVehicleRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ICreateVehicleRequest);

                    /** CreateVehicleRequest parent. */
                    public parent: string;

                    /** CreateVehicleRequest vehicle. */
                    public vehicle?: (google.cloud.optimization.v1.IVehicle|null);

                    /** CreateVehicleRequest vehicleId. */
                    public vehicleId: string;

                    /**
                     * Creates a new CreateVehicleRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CreateVehicleRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ICreateVehicleRequest): google.cloud.optimization.v1.CreateVehicleRequest;

                    /**
                     * Encodes the specified CreateVehicleRequest message. Does not implicitly {@link google.cloud.optimization.v1.CreateVehicleRequest.verify|verify} messages.
                     * @param message CreateVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ICreateVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CreateVehicleRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.CreateVehicleRequest.verify|verify} messages.
                     * @param message CreateVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ICreateVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CreateVehicleRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CreateVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.CreateVehicleRequest;

                    /**
                     * Decodes a CreateVehicleRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CreateVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.CreateVehicleRequest;

                    /**
                     * Verifies a CreateVehicleRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CreateVehicleRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CreateVehicleRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.CreateVehicleRequest;

                    /**
                     * Creates a plain object from a CreateVehicleRequest message. Also converts values to other types if specified.
                     * @param message CreateVehicleRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.CreateVehicleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CreateVehicleRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CreateVehicleRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GetVehicleRequest. */
                interface IGetVehicleRequest {

                    /** GetVehicleRequest name */
                    name?: (string|null);
                }

                /** Represents a GetVehicleRequest. */
                class GetVehicleRequest implements IGetVehicleRequest {

                    /**
                     * Constructs a new GetVehicleRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IGetVehicleRequest);

                    /** GetVehicleRequest name. */
                    public name: string;

                    /**
                     * Creates a new GetVehicleRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GetVehicleRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IGetVehicleRequest): google.cloud.optimization.v1.GetVehicleRequest;

                    /**
                     * Encodes the specified GetVehicleRequest message. Does not implicitly {@link google.cloud.optimization.v1.GetVehicleRequest.verify|verify} messages.
                     * @param message GetVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IGetVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GetVehicleRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.GetVehicleRequest.verify|verify} messages.
                     * @param message GetVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IGetVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GetVehicleRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GetVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.GetVehicleRequest;

                    /**
                     * Decodes a GetVehicleRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GetVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.GetVehicleRequest;

                    /**
                     * Verifies a GetVehicleRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GetVehicleRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GetVehicleRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.GetVehicleRequest;

                    /**
                     * Creates a plain object from a GetVehicleRequest message. Also converts values to other types if specified.
                     * @param message GetVehicleRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.GetVehicleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GetVehicleRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GetVehicleRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListVehiclesRequest. */
                interface IListVehiclesRequest {

                    /** ListVehiclesRequest parent */
                    parent?: (string|null);

                    /** ListVehiclesRequest pageSize */
                    pageSize?: (number|null);

                    /** ListVehiclesRequest pageToken */
                    pageToken?: (string|null);

                    /** ListVehiclesRequest filter */
                    filter?: (string|null);
                }

                /** Represents a ListVehiclesRequest. */
                class ListVehiclesRequest implements IListVehiclesRequest {

                    /**
                     * Constructs a new ListVehiclesRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListVehiclesRequest);

                    /** ListVehiclesRequest parent. */
                    public parent: string;

                    /** ListVehiclesRequest pageSize. */
                    public pageSize: number;

                    /** ListVehiclesRequest pageToken. */
                    public pageToken: string;

                    /** ListVehiclesRequest filter. */
                    public filter: string;

                    /**
                     * Creates a new ListVehiclesRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListVehiclesRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListVehiclesRequest): google.cloud.optimization.v1.ListVehiclesRequest;

                    /**
                     * Encodes the specified ListVehiclesRequest message. Does not implicitly {@link google.cloud.optimization.v1.ListVehiclesRequest.verify|verify} messages.
                     * @param message ListVehiclesRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListVehiclesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListVehiclesRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListVehiclesRequest.verify|verify} messages.
                     * @param message ListVehiclesRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListVehiclesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListVehiclesRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListVehiclesRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListVehiclesRequest;

                    /**
                     * Decodes a ListVehiclesRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListVehiclesRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListVehiclesRequest;

                    /**
                     * Verifies a ListVehiclesRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListVehiclesRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListVehiclesRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListVehiclesRequest;

                    /**
                     * Creates a plain object from a ListVehiclesRequest message. Also converts values to other types if specified.
                     * @param message ListVehiclesRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListVehiclesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListVehiclesRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListVehiclesRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListVehiclesResponse. */
                interface IListVehiclesResponse {

                    /** ListVehiclesResponse vehicles */
                    vehicles?: (google.cloud.optimization.v1.IVehicle[]|null);

                    /** ListVehiclesResponse nextPageToken */
                    nextPageToken?: (string|null);
                }

                /** Represents a ListVehiclesResponse. */
                class ListVehiclesResponse implements IListVehiclesResponse {

                    /**
                     * Constructs a new ListVehiclesResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListVehiclesResponse);

                    /** ListVehiclesResponse vehicles. */
                    public vehicles: google.cloud.optimization.v1.IVehicle[];

                    /** ListVehiclesResponse nextPageToken. */
                    public nextPageToken: string;

                    /**
                     * Creates a new ListVehiclesResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListVehiclesResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListVehiclesResponse): google.cloud.optimization.v1.ListVehiclesResponse;

                    /**
                     * Encodes the specified ListVehiclesResponse message. Does not implicitly {@link google.cloud.optimization.v1.ListVehiclesResponse.verify|verify} messages.
                     * @param message ListVehiclesResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListVehiclesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListVehiclesResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListVehiclesResponse.verify|verify} messages.
                     * @param message ListVehiclesResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListVehiclesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListVehiclesResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListVehiclesResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListVehiclesResponse;

                    /**
                     * Decodes a ListVehiclesResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListVehiclesResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListVehiclesResponse;

                    /**
                     * Verifies a ListVehiclesResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListVehiclesResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListVehiclesResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListVehiclesResponse;

                    /**
                     * Creates a plain object from a ListVehiclesResponse message. Also converts values to other types if specified.
                     * @param message ListVehiclesResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListVehiclesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListVehiclesResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListVehiclesResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an UpdateVehicleRequest. */
                interface IUpdateVehicleRequest {

                    /** UpdateVehicleRequest vehicle */
                    vehicle?: (google.cloud.optimization.v1.IVehicle|null);

                    /** UpdateVehicleRequest updateMask */
                    updateMask?: (google.protobuf.IFieldMask|null);
                }

                /** Represents an UpdateVehicleRequest. */
                class UpdateVehicleRequest implements IUpdateVehicleRequest {

                    /**
                     * Constructs a new UpdateVehicleRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IUpdateVehicleRequest);

                    /** UpdateVehicleRequest vehicle. */
                    public vehicle?: (google.cloud.optimization.v1.IVehicle|null);

                    /** UpdateVehicleRequest updateMask. */
                    public updateMask?: (google.protobuf.IFieldMask|null);

                    /**
                     * Creates a new UpdateVehicleRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns UpdateVehicleRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IUpdateVehicleRequest): google.cloud.optimization.v1.UpdateVehicleRequest;

                    /**
                     * Encodes the specified UpdateVehicleRequest message. Does not implicitly {@link google.cloud.optimization.v1.UpdateVehicleRequest.verify|verify} messages.
                     * @param message UpdateVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IUpdateVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified UpdateVehicleRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.UpdateVehicleRequest.verify|verify} messages.
                     * @param message UpdateVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IUpdateVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an UpdateVehicleRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns UpdateVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.UpdateVehicleRequest;

                    /**
                     * Decodes an UpdateVehicleRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns UpdateVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.UpdateVehicleRequest;

                    /**
                     * Verifies an UpdateVehicleRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an UpdateVehicleRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns UpdateVehicleRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.UpdateVehicleRequest;

                    /**
                     * Creates a plain object from an UpdateVehicleRequest message. Also converts values to other types if specified.
                     * @param message UpdateVehicleRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.UpdateVehicleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this UpdateVehicleRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for UpdateVehicleRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a DeleteVehicleRequest. */
                interface IDeleteVehicleRequest {

                    /** DeleteVehicleRequest name */
                    name?: (string|null);
                }

                /** Represents a DeleteVehicleRequest. */
                class DeleteVehicleRequest implements IDeleteVehicleRequest {

                    /**
                     * Constructs a new DeleteVehicleRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IDeleteVehicleRequest);

                    /** DeleteVehicleRequest name. */
                    public name: string;

                    /**
                     * Creates a new DeleteVehicleRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DeleteVehicleRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IDeleteVehicleRequest): google.cloud.optimization.v1.DeleteVehicleRequest;

                    /**
                     * Encodes the specified DeleteVehicleRequest message. Does not implicitly {@link google.cloud.optimization.v1.DeleteVehicleRequest.verify|verify} messages.
                     * @param message DeleteVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IDeleteVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DeleteVehicleRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.DeleteVehicleRequest.verify|verify} messages.
                     * @param message DeleteVehicleRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IDeleteVehicleRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DeleteVehicleRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DeleteVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.DeleteVehicleRequest;

                    /**
                     * Decodes a DeleteVehicleRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DeleteVehicleRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.DeleteVehicleRequest;

                    /**
                     * Verifies a DeleteVehicleRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DeleteVehicleRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DeleteVehicleRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.DeleteVehicleRequest;

                    /**
                     * Creates a plain object from a DeleteVehicleRequest message. Also converts values to other types if specified.
                     * @param message DeleteVehicleRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.DeleteVehicleRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DeleteVehicleRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for DeleteVehicleRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a CreateShipmentRequest. */
                interface ICreateShipmentRequest {

                    /** CreateShipmentRequest parent */
                    parent?: (string|null);

                    /** CreateShipmentRequest shipment */
                    shipment?: (google.cloud.optimization.v1.IShipment|null);

                    /** CreateShipmentRequest shipmentId */
                    shipmentId?: (string|null);
                }

                /** Represents a CreateShipmentRequest. */
                class CreateShipmentRequest implements ICreateShipmentRequest {

                    /**
                     * Constructs a new CreateShipmentRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ICreateShipmentRequest);

                    /** CreateShipmentRequest parent. */
                    public parent: string;

                    /** CreateShipmentRequest shipment. */
                    public shipment?: (google.cloud.optimization.v1.IShipment|null);

                    /** CreateShipmentRequest shipmentId. */
                    public shipmentId: string;

                    /**
                     * Creates a new CreateShipmentRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CreateShipmentRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ICreateShipmentRequest): google.cloud.optimization.v1.CreateShipmentRequest;

                    /**
                     * Encodes the specified CreateShipmentRequest message. Does not implicitly {@link google.cloud.optimization.v1.CreateShipmentRequest.verify|verify} messages.
                     * @param message CreateShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ICreateShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CreateShipmentRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.CreateShipmentRequest.verify|verify} messages.
                     * @param message CreateShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ICreateShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CreateShipmentRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CreateShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.CreateShipmentRequest;

                    /**
                     * Decodes a CreateShipmentRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CreateShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.CreateShipmentRequest;

                    /**
                     * Verifies a CreateShipmentRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CreateShipmentRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CreateShipmentRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.CreateShipmentRequest;

                    /**
                     * Creates a plain object from a CreateShipmentRequest message. Also converts values to other types if specified.
                     * @param message CreateShipmentRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.CreateShipmentRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CreateShipmentRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CreateShipmentRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GetShipmentRequest. */
                interface IGetShipmentRequest {

                    /** GetShipmentRequest name */
                    name?: (string|null);
                }

                /** Represents a GetShipmentRequest. */
                class GetShipmentRequest implements IGetShipmentRequest {

                    /**
                     * Constructs a new GetShipmentRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IGetShipmentRequest);

                    /** GetShipmentRequest name. */
                    public name: string;

                    /**
                     * Creates a new GetShipmentRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GetShipmentRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IGetShipmentRequest): google.cloud.optimization.v1.GetShipmentRequest;

                    /**
                     * Encodes the specified GetShipmentRequest message. Does not implicitly {@link google.cloud.optimization.v1.GetShipmentRequest.verify|verify} messages.
                     * @param message GetShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IGetShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GetShipmentRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.GetShipmentRequest.verify|verify} messages.
                     * @param message GetShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IGetShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GetShipmentRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GetShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.GetShipmentRequest;

                    /**
                     * Decodes a GetShipmentRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GetShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.GetShipmentRequest;

                    /**
                     * Verifies a GetShipmentRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GetShipmentRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GetShipmentRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.GetShipmentRequest;

                    /**
                     * Creates a plain object from a GetShipmentRequest message. Also converts values to other types if specified.
                     * @param message GetShipmentRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.GetShipmentRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GetShipmentRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GetShipmentRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListShipmentsRequest. */
                interface IListShipmentsRequest {

                    /** ListShipmentsRequest parent */
                    parent?: (string|null);

                    /** ListShipmentsRequest pageSize */
                    pageSize?: (number|null);

                    /** ListShipmentsRequest pageToken */
                    pageToken?: (string|null);

                    /** ListShipmentsRequest filter */
                    filter?: (string|null);
                }

                /** Represents a ListShipmentsRequest. */
                class ListShipmentsRequest implements IListShipmentsRequest {

                    /**
                     * Constructs a new ListShipmentsRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListShipmentsRequest);

                    /** ListShipmentsRequest parent. */
                    public parent: string;

                    /** ListShipmentsRequest pageSize. */
                    public pageSize: number;

                    /** ListShipmentsRequest pageToken. */
                    public pageToken: string;

                    /** ListShipmentsRequest filter. */
                    public filter: string;

                    /**
                     * Creates a new ListShipmentsRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListShipmentsRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListShipmentsRequest): google.cloud.optimization.v1.ListShipmentsRequest;

                    /**
                     * Encodes the specified ListShipmentsRequest message. Does not implicitly {@link google.cloud.optimization.v1.ListShipmentsRequest.verify|verify} messages.
                     * @param message ListShipmentsRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListShipmentsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListShipmentsRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListShipmentsRequest.verify|verify} messages.
                     * @param message ListShipmentsRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListShipmentsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListShipmentsRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListShipmentsRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListShipmentsRequest;

                    /**
                     * Decodes a ListShipmentsRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListShipmentsRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListShipmentsRequest;

                    /**
                     * Verifies a ListShipmentsRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListShipmentsRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListShipmentsRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListShipmentsRequest;

                    /**
                     * Creates a plain object from a ListShipmentsRequest message. Also converts values to other types if specified.
                     * @param message ListShipmentsRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListShipmentsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListShipmentsRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListShipmentsRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListShipmentsResponse. */
                interface IListShipmentsResponse {

                    /** ListShipmentsResponse shipments */
                    shipments?: (google.cloud.optimization.v1.IShipment[]|null);

                    /** ListShipmentsResponse nextPageToken */
                    nextPageToken?: (string|null);
                }

                /** Represents a ListShipmentsResponse. */
                class ListShipmentsResponse implements IListShipmentsResponse {

                    /**
                     * Constructs a new ListShipmentsResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListShipmentsResponse);

                    /** ListShipmentsResponse shipments. */
                    public shipments: google.cloud.optimization.v1.IShipment[];

                    /** ListShipmentsResponse nextPageToken. */
                    public nextPageToken: string;

                    /**
                     * Creates a new ListShipmentsResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListShipmentsResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListShipmentsResponse): google.cloud.optimization.v1.ListShipmentsResponse;

                    /**
                     * Encodes the specified ListShipmentsResponse message. Does not implicitly {@link google.cloud.optimization.v1.ListShipmentsResponse.verify|verify} messages.
                     * @param message ListShipmentsResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListShipmentsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListShipmentsResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListShipmentsResponse.verify|verify} messages.
                     * @param message ListShipmentsResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListShipmentsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListShipmentsResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListShipmentsResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListShipmentsResponse;

                    /**
                     * Decodes a ListShipmentsResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListShipmentsResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListShipmentsResponse;

                    /**
                     * Verifies a ListShipmentsResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListShipmentsResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListShipmentsResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListShipmentsResponse;

                    /**
                     * Creates a plain object from a ListShipmentsResponse message. Also converts values to other types if specified.
                     * @param message ListShipmentsResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListShipmentsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListShipmentsResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListShipmentsResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an UpdateShipmentRequest. */
                interface IUpdateShipmentRequest {

                    /** UpdateShipmentRequest shipment */
                    shipment?: (google.cloud.optimization.v1.IShipment|null);

                    /** UpdateShipmentRequest updateMask */
                    updateMask?: (google.protobuf.IFieldMask|null);
                }

                /** Represents an UpdateShipmentRequest. */
                class UpdateShipmentRequest implements IUpdateShipmentRequest {

                    /**
                     * Constructs a new UpdateShipmentRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IUpdateShipmentRequest);

                    /** UpdateShipmentRequest shipment. */
                    public shipment?: (google.cloud.optimization.v1.IShipment|null);

                    /** UpdateShipmentRequest updateMask. */
                    public updateMask?: (google.protobuf.IFieldMask|null);

                    /**
                     * Creates a new UpdateShipmentRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns UpdateShipmentRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IUpdateShipmentRequest): google.cloud.optimization.v1.UpdateShipmentRequest;

                    /**
                     * Encodes the specified UpdateShipmentRequest message. Does not implicitly {@link google.cloud.optimization.v1.UpdateShipmentRequest.verify|verify} messages.
                     * @param message UpdateShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IUpdateShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified UpdateShipmentRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.UpdateShipmentRequest.verify|verify} messages.
                     * @param message UpdateShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IUpdateShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an UpdateShipmentRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns UpdateShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.UpdateShipmentRequest;

                    /**
                     * Decodes an UpdateShipmentRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns UpdateShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.UpdateShipmentRequest;

                    /**
                     * Verifies an UpdateShipmentRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an UpdateShipmentRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns UpdateShipmentRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.UpdateShipmentRequest;

                    /**
                     * Creates a plain object from an UpdateShipmentRequest message. Also converts values to other types if specified.
                     * @param message UpdateShipmentRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.UpdateShipmentRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this UpdateShipmentRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for UpdateShipmentRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a DeleteShipmentRequest. */
                interface IDeleteShipmentRequest {

                    /** DeleteShipmentRequest name */
                    name?: (string|null);
                }

                /** Represents a DeleteShipmentRequest. */
                class DeleteShipmentRequest implements IDeleteShipmentRequest {

                    /**
                     * Constructs a new DeleteShipmentRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IDeleteShipmentRequest);

                    /** DeleteShipmentRequest name. */
                    public name: string;

                    /**
                     * Creates a new DeleteShipmentRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DeleteShipmentRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IDeleteShipmentRequest): google.cloud.optimization.v1.DeleteShipmentRequest;

                    /**
                     * Encodes the specified DeleteShipmentRequest message. Does not implicitly {@link google.cloud.optimization.v1.DeleteShipmentRequest.verify|verify} messages.
                     * @param message DeleteShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IDeleteShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DeleteShipmentRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.DeleteShipmentRequest.verify|verify} messages.
                     * @param message DeleteShipmentRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IDeleteShipmentRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DeleteShipmentRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DeleteShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.DeleteShipmentRequest;

                    /**
                     * Decodes a DeleteShipmentRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DeleteShipmentRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.DeleteShipmentRequest;

                    /**
                     * Verifies a DeleteShipmentRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DeleteShipmentRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DeleteShipmentRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.DeleteShipmentRequest;

                    /**
                     * Creates a plain object from a DeleteShipmentRequest message. Also converts values to other types if specified.
                     * @param message DeleteShipmentRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.DeleteShipmentRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DeleteShipmentRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for DeleteShipmentRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GetSolutionRequest. */
                interface IGetSolutionRequest {

                    /** GetSolutionRequest name */
                    name?: (string|null);
                }

                /** Represents a GetSolutionRequest. */
                class GetSolutionRequest implements IGetSolutionRequest {

                    /**
                     * Constructs a new GetSolutionRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IGetSolutionRequest);

                    /** GetSolutionRequest name. */
                    public name: string;

                    /**
                     * Creates a new GetSolutionRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GetSolutionRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IGetSolutionRequest): google.cloud.optimization.v1.GetSolutionRequest;

                    /**
                     * Encodes the specified GetSolutionRequest message. Does not implicitly {@link google.cloud.optimization.v1.GetSolutionRequest.verify|verify} messages.
                     * @param message GetSolutionRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IGetSolutionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GetSolutionRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.GetSolutionRequest.verify|verify} messages.
                     * @param message GetSolutionRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IGetSolutionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GetSolutionRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GetSolutionRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.GetSolutionRequest;

                    /**
                     * Decodes a GetSolutionRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GetSolutionRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.GetSolutionRequest;

                    /**
                     * Verifies a GetSolutionRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GetSolutionRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GetSolutionRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.GetSolutionRequest;

                    /**
                     * Creates a plain object from a GetSolutionRequest message. Also converts values to other types if specified.
                     * @param message GetSolutionRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.GetSolutionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GetSolutionRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GetSolutionRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListSolutionsRequest. */
                interface IListSolutionsRequest {

                    /** ListSolutionsRequest parent */
                    parent?: (string|null);

                    /** ListSolutionsRequest pageSize */
                    pageSize?: (number|null);

                    /** ListSolutionsRequest pageToken */
                    pageToken?: (string|null);

                    /** ListSolutionsRequest filter */
                    filter?: (string|null);
                }

                /** Represents a ListSolutionsRequest. */
                class ListSolutionsRequest implements IListSolutionsRequest {

                    /**
                     * Constructs a new ListSolutionsRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListSolutionsRequest);

                    /** ListSolutionsRequest parent. */
                    public parent: string;

                    /** ListSolutionsRequest pageSize. */
                    public pageSize: number;

                    /** ListSolutionsRequest pageToken. */
                    public pageToken: string;

                    /** ListSolutionsRequest filter. */
                    public filter: string;

                    /**
                     * Creates a new ListSolutionsRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListSolutionsRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListSolutionsRequest): google.cloud.optimization.v1.ListSolutionsRequest;

                    /**
                     * Encodes the specified ListSolutionsRequest message. Does not implicitly {@link google.cloud.optimization.v1.ListSolutionsRequest.verify|verify} messages.
                     * @param message ListSolutionsRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListSolutionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListSolutionsRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListSolutionsRequest.verify|verify} messages.
                     * @param message ListSolutionsRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListSolutionsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListSolutionsRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListSolutionsRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListSolutionsRequest;

                    /**
                     * Decodes a ListSolutionsRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListSolutionsRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListSolutionsRequest;

                    /**
                     * Verifies a ListSolutionsRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListSolutionsRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListSolutionsRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListSolutionsRequest;

                    /**
                     * Creates a plain object from a ListSolutionsRequest message. Also converts values to other types if specified.
                     * @param message ListSolutionsRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListSolutionsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListSolutionsRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListSolutionsRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListSolutionsResponse. */
                interface IListSolutionsResponse {

                    /** ListSolutionsResponse solutions */
                    solutions?: (google.cloud.optimization.v1.ISolution[]|null);

                    /** ListSolutionsResponse nextPageToken */
                    nextPageToken?: (string|null);
                }

                /** Represents a ListSolutionsResponse. */
                class ListSolutionsResponse implements IListSolutionsResponse {

                    /**
                     * Constructs a new ListSolutionsResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListSolutionsResponse);

                    /** ListSolutionsResponse solutions. */
                    public solutions: google.cloud.optimization.v1.ISolution[];

                    /** ListSolutionsResponse nextPageToken. */
                    public nextPageToken: string;

                    /**
                     * Creates a new ListSolutionsResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListSolutionsResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListSolutionsResponse): google.cloud.optimization.v1.ListSolutionsResponse;

                    /**
                     * Encodes the specified ListSolutionsResponse message. Does not implicitly {@link google.cloud.optimization.v1.ListSolutionsResponse.verify|verify} messages.
                     * @param message ListSolutionsResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListSolutionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListSolutionsResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListSolutionsResponse.verify|verify} messages.
                     * @param message ListSolutionsResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListSolutionsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListSolutionsResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListSolutionsResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListSolutionsResponse;

                    /**
                     * Decodes a ListSolutionsResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListSolutionsResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListSolutionsResponse;

                    /**
                     * Verifies a ListSolutionsResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListSolutionsResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListSolutionsResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListSolutionsResponse;

                    /**
                     * Creates a plain object from a ListSolutionsResponse message. Also converts values to other types if specified.
                     * @param message ListSolutionsResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListSolutionsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListSolutionsResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListSolutionsResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a DeleteSolutionRequest. */
                interface IDeleteSolutionRequest {

                    /** DeleteSolutionRequest name */
                    name?: (string|null);
                }

                /** Represents a DeleteSolutionRequest. */
                class DeleteSolutionRequest implements IDeleteSolutionRequest {

                    /**
                     * Constructs a new DeleteSolutionRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IDeleteSolutionRequest);

                    /** DeleteSolutionRequest name. */
                    public name: string;

                    /**
                     * Creates a new DeleteSolutionRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DeleteSolutionRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IDeleteSolutionRequest): google.cloud.optimization.v1.DeleteSolutionRequest;

                    /**
                     * Encodes the specified DeleteSolutionRequest message. Does not implicitly {@link google.cloud.optimization.v1.DeleteSolutionRequest.verify|verify} messages.
                     * @param message DeleteSolutionRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IDeleteSolutionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DeleteSolutionRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.DeleteSolutionRequest.verify|verify} messages.
                     * @param message DeleteSolutionRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IDeleteSolutionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DeleteSolutionRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DeleteSolutionRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.DeleteSolutionRequest;

                    /**
                     * Decodes a DeleteSolutionRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DeleteSolutionRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.DeleteSolutionRequest;

                    /**
                     * Verifies a DeleteSolutionRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DeleteSolutionRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DeleteSolutionRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.DeleteSolutionRequest;

                    /**
                     * Creates a plain object from a DeleteSolutionRequest message. Also converts values to other types if specified.
                     * @param message DeleteSolutionRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.DeleteSolutionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DeleteSolutionRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for DeleteSolutionRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RetrieveInputRequest. */
                interface IRetrieveInputRequest {

                    /** RetrieveInputRequest name */
                    name?: (string|null);
                }

                /** Represents a RetrieveInputRequest. */
                class RetrieveInputRequest implements IRetrieveInputRequest {

                    /**
                     * Constructs a new RetrieveInputRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IRetrieveInputRequest);

                    /** RetrieveInputRequest name. */
                    public name: string;

                    /**
                     * Creates a new RetrieveInputRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RetrieveInputRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IRetrieveInputRequest): google.cloud.optimization.v1.RetrieveInputRequest;

                    /**
                     * Encodes the specified RetrieveInputRequest message. Does not implicitly {@link google.cloud.optimization.v1.RetrieveInputRequest.verify|verify} messages.
                     * @param message RetrieveInputRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IRetrieveInputRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RetrieveInputRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RetrieveInputRequest.verify|verify} messages.
                     * @param message RetrieveInputRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IRetrieveInputRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RetrieveInputRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RetrieveInputRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RetrieveInputRequest;

                    /**
                     * Decodes a RetrieveInputRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RetrieveInputRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RetrieveInputRequest;

                    /**
                     * Verifies a RetrieveInputRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RetrieveInputRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RetrieveInputRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RetrieveInputRequest;

                    /**
                     * Creates a plain object from a RetrieveInputRequest message. Also converts values to other types if specified.
                     * @param message RetrieveInputRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.RetrieveInputRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RetrieveInputRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RetrieveInputRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RetrieveInputResponse. */
                interface IRetrieveInputResponse {

                    /** RetrieveInputResponse optimizationRequest */
                    optimizationRequest?: (google.cloud.optimization.v1.IOptimizeToursRequest|null);
                }

                /** Represents a RetrieveInputResponse. */
                class RetrieveInputResponse implements IRetrieveInputResponse {

                    /**
                     * Constructs a new RetrieveInputResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IRetrieveInputResponse);

                    /** RetrieveInputResponse optimizationRequest. */
                    public optimizationRequest?: (google.cloud.optimization.v1.IOptimizeToursRequest|null);

                    /**
                     * Creates a new RetrieveInputResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RetrieveInputResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IRetrieveInputResponse): google.cloud.optimization.v1.RetrieveInputResponse;

                    /**
                     * Encodes the specified RetrieveInputResponse message. Does not implicitly {@link google.cloud.optimization.v1.RetrieveInputResponse.verify|verify} messages.
                     * @param message RetrieveInputResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IRetrieveInputResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RetrieveInputResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RetrieveInputResponse.verify|verify} messages.
                     * @param message RetrieveInputResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IRetrieveInputResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RetrieveInputResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RetrieveInputResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RetrieveInputResponse;

                    /**
                     * Decodes a RetrieveInputResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RetrieveInputResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RetrieveInputResponse;

                    /**
                     * Verifies a RetrieveInputResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RetrieveInputResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RetrieveInputResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RetrieveInputResponse;

                    /**
                     * Creates a plain object from a RetrieveInputResponse message. Also converts values to other types if specified.
                     * @param message RetrieveInputResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.RetrieveInputResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RetrieveInputResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RetrieveInputResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a CreateOptimizerRequest. */
                interface ICreateOptimizerRequest {

                    /** CreateOptimizerRequest parent */
                    parent?: (string|null);

                    /** CreateOptimizerRequest optimizer */
                    optimizer?: (google.cloud.optimization.v1.IOptimizer|null);

                    /** CreateOptimizerRequest optimizerId */
                    optimizerId?: (string|null);
                }

                /** Represents a CreateOptimizerRequest. */
                class CreateOptimizerRequest implements ICreateOptimizerRequest {

                    /**
                     * Constructs a new CreateOptimizerRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.ICreateOptimizerRequest);

                    /** CreateOptimizerRequest parent. */
                    public parent: string;

                    /** CreateOptimizerRequest optimizer. */
                    public optimizer?: (google.cloud.optimization.v1.IOptimizer|null);

                    /** CreateOptimizerRequest optimizerId. */
                    public optimizerId: string;

                    /**
                     * Creates a new CreateOptimizerRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns CreateOptimizerRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.ICreateOptimizerRequest): google.cloud.optimization.v1.CreateOptimizerRequest;

                    /**
                     * Encodes the specified CreateOptimizerRequest message. Does not implicitly {@link google.cloud.optimization.v1.CreateOptimizerRequest.verify|verify} messages.
                     * @param message CreateOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.ICreateOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified CreateOptimizerRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.CreateOptimizerRequest.verify|verify} messages.
                     * @param message CreateOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.ICreateOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a CreateOptimizerRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns CreateOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.CreateOptimizerRequest;

                    /**
                     * Decodes a CreateOptimizerRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns CreateOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.CreateOptimizerRequest;

                    /**
                     * Verifies a CreateOptimizerRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a CreateOptimizerRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns CreateOptimizerRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.CreateOptimizerRequest;

                    /**
                     * Creates a plain object from a CreateOptimizerRequest message. Also converts values to other types if specified.
                     * @param message CreateOptimizerRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.CreateOptimizerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this CreateOptimizerRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for CreateOptimizerRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a GetOptimizerRequest. */
                interface IGetOptimizerRequest {

                    /** GetOptimizerRequest name */
                    name?: (string|null);
                }

                /** Represents a GetOptimizerRequest. */
                class GetOptimizerRequest implements IGetOptimizerRequest {

                    /**
                     * Constructs a new GetOptimizerRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IGetOptimizerRequest);

                    /** GetOptimizerRequest name. */
                    public name: string;

                    /**
                     * Creates a new GetOptimizerRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns GetOptimizerRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IGetOptimizerRequest): google.cloud.optimization.v1.GetOptimizerRequest;

                    /**
                     * Encodes the specified GetOptimizerRequest message. Does not implicitly {@link google.cloud.optimization.v1.GetOptimizerRequest.verify|verify} messages.
                     * @param message GetOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IGetOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified GetOptimizerRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.GetOptimizerRequest.verify|verify} messages.
                     * @param message GetOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IGetOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a GetOptimizerRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns GetOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.GetOptimizerRequest;

                    /**
                     * Decodes a GetOptimizerRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns GetOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.GetOptimizerRequest;

                    /**
                     * Verifies a GetOptimizerRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a GetOptimizerRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns GetOptimizerRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.GetOptimizerRequest;

                    /**
                     * Creates a plain object from a GetOptimizerRequest message. Also converts values to other types if specified.
                     * @param message GetOptimizerRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.GetOptimizerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this GetOptimizerRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for GetOptimizerRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of an UpdateOptimizerRequest. */
                interface IUpdateOptimizerRequest {

                    /** UpdateOptimizerRequest optimizer */
                    optimizer?: (google.cloud.optimization.v1.IOptimizer|null);

                    /** UpdateOptimizerRequest updateMask */
                    updateMask?: (google.protobuf.IFieldMask|null);
                }

                /** Represents an UpdateOptimizerRequest. */
                class UpdateOptimizerRequest implements IUpdateOptimizerRequest {

                    /**
                     * Constructs a new UpdateOptimizerRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IUpdateOptimizerRequest);

                    /** UpdateOptimizerRequest optimizer. */
                    public optimizer?: (google.cloud.optimization.v1.IOptimizer|null);

                    /** UpdateOptimizerRequest updateMask. */
                    public updateMask?: (google.protobuf.IFieldMask|null);

                    /**
                     * Creates a new UpdateOptimizerRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns UpdateOptimizerRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IUpdateOptimizerRequest): google.cloud.optimization.v1.UpdateOptimizerRequest;

                    /**
                     * Encodes the specified UpdateOptimizerRequest message. Does not implicitly {@link google.cloud.optimization.v1.UpdateOptimizerRequest.verify|verify} messages.
                     * @param message UpdateOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IUpdateOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified UpdateOptimizerRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.UpdateOptimizerRequest.verify|verify} messages.
                     * @param message UpdateOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IUpdateOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes an UpdateOptimizerRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns UpdateOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.UpdateOptimizerRequest;

                    /**
                     * Decodes an UpdateOptimizerRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns UpdateOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.UpdateOptimizerRequest;

                    /**
                     * Verifies an UpdateOptimizerRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates an UpdateOptimizerRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns UpdateOptimizerRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.UpdateOptimizerRequest;

                    /**
                     * Creates a plain object from an UpdateOptimizerRequest message. Also converts values to other types if specified.
                     * @param message UpdateOptimizerRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.UpdateOptimizerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this UpdateOptimizerRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for UpdateOptimizerRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a DeleteOptimizerRequest. */
                interface IDeleteOptimizerRequest {

                    /** DeleteOptimizerRequest name */
                    name?: (string|null);
                }

                /** Represents a DeleteOptimizerRequest. */
                class DeleteOptimizerRequest implements IDeleteOptimizerRequest {

                    /**
                     * Constructs a new DeleteOptimizerRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IDeleteOptimizerRequest);

                    /** DeleteOptimizerRequest name. */
                    public name: string;

                    /**
                     * Creates a new DeleteOptimizerRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns DeleteOptimizerRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IDeleteOptimizerRequest): google.cloud.optimization.v1.DeleteOptimizerRequest;

                    /**
                     * Encodes the specified DeleteOptimizerRequest message. Does not implicitly {@link google.cloud.optimization.v1.DeleteOptimizerRequest.verify|verify} messages.
                     * @param message DeleteOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IDeleteOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified DeleteOptimizerRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.DeleteOptimizerRequest.verify|verify} messages.
                     * @param message DeleteOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IDeleteOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a DeleteOptimizerRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns DeleteOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.DeleteOptimizerRequest;

                    /**
                     * Decodes a DeleteOptimizerRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns DeleteOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.DeleteOptimizerRequest;

                    /**
                     * Verifies a DeleteOptimizerRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a DeleteOptimizerRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns DeleteOptimizerRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.DeleteOptimizerRequest;

                    /**
                     * Creates a plain object from a DeleteOptimizerRequest message. Also converts values to other types if specified.
                     * @param message DeleteOptimizerRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.DeleteOptimizerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this DeleteOptimizerRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for DeleteOptimizerRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListOptimizersRequest. */
                interface IListOptimizersRequest {

                    /** ListOptimizersRequest parent */
                    parent?: (string|null);

                    /** ListOptimizersRequest pageSize */
                    pageSize?: (number|null);

                    /** ListOptimizersRequest pageToken */
                    pageToken?: (string|null);

                    /** ListOptimizersRequest filter */
                    filter?: (string|null);
                }

                /** Represents a ListOptimizersRequest. */
                class ListOptimizersRequest implements IListOptimizersRequest {

                    /**
                     * Constructs a new ListOptimizersRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListOptimizersRequest);

                    /** ListOptimizersRequest parent. */
                    public parent: string;

                    /** ListOptimizersRequest pageSize. */
                    public pageSize: number;

                    /** ListOptimizersRequest pageToken. */
                    public pageToken: string;

                    /** ListOptimizersRequest filter. */
                    public filter: string;

                    /**
                     * Creates a new ListOptimizersRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListOptimizersRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListOptimizersRequest): google.cloud.optimization.v1.ListOptimizersRequest;

                    /**
                     * Encodes the specified ListOptimizersRequest message. Does not implicitly {@link google.cloud.optimization.v1.ListOptimizersRequest.verify|verify} messages.
                     * @param message ListOptimizersRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListOptimizersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListOptimizersRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListOptimizersRequest.verify|verify} messages.
                     * @param message ListOptimizersRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListOptimizersRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListOptimizersRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListOptimizersRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListOptimizersRequest;

                    /**
                     * Decodes a ListOptimizersRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListOptimizersRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListOptimizersRequest;

                    /**
                     * Verifies a ListOptimizersRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListOptimizersRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListOptimizersRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListOptimizersRequest;

                    /**
                     * Creates a plain object from a ListOptimizersRequest message. Also converts values to other types if specified.
                     * @param message ListOptimizersRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListOptimizersRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListOptimizersRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListOptimizersRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a ListOptimizersResponse. */
                interface IListOptimizersResponse {

                    /** ListOptimizersResponse optimizers */
                    optimizers?: (google.cloud.optimization.v1.IOptimizer[]|null);

                    /** ListOptimizersResponse nextPageToken */
                    nextPageToken?: (string|null);
                }

                /** Represents a ListOptimizersResponse. */
                class ListOptimizersResponse implements IListOptimizersResponse {

                    /**
                     * Constructs a new ListOptimizersResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IListOptimizersResponse);

                    /** ListOptimizersResponse optimizers. */
                    public optimizers: google.cloud.optimization.v1.IOptimizer[];

                    /** ListOptimizersResponse nextPageToken. */
                    public nextPageToken: string;

                    /**
                     * Creates a new ListOptimizersResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns ListOptimizersResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IListOptimizersResponse): google.cloud.optimization.v1.ListOptimizersResponse;

                    /**
                     * Encodes the specified ListOptimizersResponse message. Does not implicitly {@link google.cloud.optimization.v1.ListOptimizersResponse.verify|verify} messages.
                     * @param message ListOptimizersResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IListOptimizersResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified ListOptimizersResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.ListOptimizersResponse.verify|verify} messages.
                     * @param message ListOptimizersResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IListOptimizersResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a ListOptimizersResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns ListOptimizersResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.ListOptimizersResponse;

                    /**
                     * Decodes a ListOptimizersResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns ListOptimizersResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.ListOptimizersResponse;

                    /**
                     * Verifies a ListOptimizersResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a ListOptimizersResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns ListOptimizersResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.ListOptimizersResponse;

                    /**
                     * Creates a plain object from a ListOptimizersResponse message. Also converts values to other types if specified.
                     * @param message ListOptimizersResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.ListOptimizersResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this ListOptimizersResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for ListOptimizersResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RunOptimizerRequest. */
                interface IRunOptimizerRequest {

                    /** RunOptimizerRequest name */
                    name?: (string|null);
                }

                /** Represents a RunOptimizerRequest. */
                class RunOptimizerRequest implements IRunOptimizerRequest {

                    /**
                     * Constructs a new RunOptimizerRequest.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IRunOptimizerRequest);

                    /** RunOptimizerRequest name. */
                    public name: string;

                    /**
                     * Creates a new RunOptimizerRequest instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RunOptimizerRequest instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IRunOptimizerRequest): google.cloud.optimization.v1.RunOptimizerRequest;

                    /**
                     * Encodes the specified RunOptimizerRequest message. Does not implicitly {@link google.cloud.optimization.v1.RunOptimizerRequest.verify|verify} messages.
                     * @param message RunOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IRunOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RunOptimizerRequest message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RunOptimizerRequest.verify|verify} messages.
                     * @param message RunOptimizerRequest message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IRunOptimizerRequest, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RunOptimizerRequest message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RunOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RunOptimizerRequest;

                    /**
                     * Decodes a RunOptimizerRequest message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RunOptimizerRequest
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RunOptimizerRequest;

                    /**
                     * Verifies a RunOptimizerRequest message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RunOptimizerRequest message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RunOptimizerRequest
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RunOptimizerRequest;

                    /**
                     * Creates a plain object from a RunOptimizerRequest message. Also converts values to other types if specified.
                     * @param message RunOptimizerRequest
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.RunOptimizerRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RunOptimizerRequest to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RunOptimizerRequest
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RunOptimizerResponse. */
                interface IRunOptimizerResponse {

                    /** RunOptimizerResponse solution */
                    solution?: (string|null);
                }

                /** Represents a RunOptimizerResponse. */
                class RunOptimizerResponse implements IRunOptimizerResponse {

                    /**
                     * Constructs a new RunOptimizerResponse.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IRunOptimizerResponse);

                    /** RunOptimizerResponse solution. */
                    public solution: string;

                    /**
                     * Creates a new RunOptimizerResponse instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RunOptimizerResponse instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IRunOptimizerResponse): google.cloud.optimization.v1.RunOptimizerResponse;

                    /**
                     * Encodes the specified RunOptimizerResponse message. Does not implicitly {@link google.cloud.optimization.v1.RunOptimizerResponse.verify|verify} messages.
                     * @param message RunOptimizerResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IRunOptimizerResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RunOptimizerResponse message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RunOptimizerResponse.verify|verify} messages.
                     * @param message RunOptimizerResponse message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IRunOptimizerResponse, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RunOptimizerResponse message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RunOptimizerResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RunOptimizerResponse;

                    /**
                     * Decodes a RunOptimizerResponse message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RunOptimizerResponse
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RunOptimizerResponse;

                    /**
                     * Verifies a RunOptimizerResponse message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RunOptimizerResponse message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RunOptimizerResponse
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RunOptimizerResponse;

                    /**
                     * Creates a plain object from a RunOptimizerResponse message. Also converts values to other types if specified.
                     * @param message RunOptimizerResponse
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.RunOptimizerResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RunOptimizerResponse to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RunOptimizerResponse
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                /** Properties of a RunOptimizerMetadata. */
                interface IRunOptimizerMetadata {

                    /** RunOptimizerMetadata state */
                    state?: (google.cloud.optimization.v1.RunOptimizerMetadata.State|keyof typeof google.cloud.optimization.v1.RunOptimizerMetadata.State|null);

                    /** RunOptimizerMetadata createTime */
                    createTime?: (google.protobuf.ITimestamp|null);

                    /** RunOptimizerMetadata updateTime */
                    updateTime?: (google.protobuf.ITimestamp|null);
                }

                /** Represents a RunOptimizerMetadata. */
                class RunOptimizerMetadata implements IRunOptimizerMetadata {

                    /**
                     * Constructs a new RunOptimizerMetadata.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: google.cloud.optimization.v1.IRunOptimizerMetadata);

                    /** RunOptimizerMetadata state. */
                    public state: (google.cloud.optimization.v1.RunOptimizerMetadata.State|keyof typeof google.cloud.optimization.v1.RunOptimizerMetadata.State);

                    /** RunOptimizerMetadata createTime. */
                    public createTime?: (google.protobuf.ITimestamp|null);

                    /** RunOptimizerMetadata updateTime. */
                    public updateTime?: (google.protobuf.ITimestamp|null);

                    /**
                     * Creates a new RunOptimizerMetadata instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns RunOptimizerMetadata instance
                     */
                    public static create(properties?: google.cloud.optimization.v1.IRunOptimizerMetadata): google.cloud.optimization.v1.RunOptimizerMetadata;

                    /**
                     * Encodes the specified RunOptimizerMetadata message. Does not implicitly {@link google.cloud.optimization.v1.RunOptimizerMetadata.verify|verify} messages.
                     * @param message RunOptimizerMetadata message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: google.cloud.optimization.v1.IRunOptimizerMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified RunOptimizerMetadata message, length delimited. Does not implicitly {@link google.cloud.optimization.v1.RunOptimizerMetadata.verify|verify} messages.
                     * @param message RunOptimizerMetadata message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: google.cloud.optimization.v1.IRunOptimizerMetadata, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a RunOptimizerMetadata message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns RunOptimizerMetadata
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.cloud.optimization.v1.RunOptimizerMetadata;

                    /**
                     * Decodes a RunOptimizerMetadata message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns RunOptimizerMetadata
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.cloud.optimization.v1.RunOptimizerMetadata;

                    /**
                     * Verifies a RunOptimizerMetadata message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a RunOptimizerMetadata message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns RunOptimizerMetadata
                     */
                    public static fromObject(object: { [k: string]: any }): google.cloud.optimization.v1.RunOptimizerMetadata;

                    /**
                     * Creates a plain object from a RunOptimizerMetadata message. Also converts values to other types if specified.
                     * @param message RunOptimizerMetadata
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: google.cloud.optimization.v1.RunOptimizerMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this RunOptimizerMetadata to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };

                    /**
                     * Gets the default type url for RunOptimizerMetadata
                     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                     * @returns The default type url
                     */
                    public static getTypeUrl(typeUrlPrefix?: string): string;
                }

                namespace RunOptimizerMetadata {

                    /** State enum. */
                    enum State {
                        STATE_UNSPECIFIED = 0,
                        RUNNING = 1,
                        DONE = 2
                    }
                }
            }
        }
    }

    /** Namespace api. */
    namespace api {

        /** FieldBehavior enum. */
        enum FieldBehavior {
            FIELD_BEHAVIOR_UNSPECIFIED = 0,
            OPTIONAL = 1,
            REQUIRED = 2,
            OUTPUT_ONLY = 3,
            INPUT_ONLY = 4,
            IMMUTABLE = 5,
            UNORDERED_LIST = 6,
            NON_EMPTY_DEFAULT = 7
        }

        /** Properties of a Http. */
        interface IHttp {

            /** Http rules */
            rules?: (google.api.IHttpRule[]|null);

            /** Http fullyDecodeReservedExpansion */
            fullyDecodeReservedExpansion?: (boolean|null);
        }

        /** Represents a Http. */
        class Http implements IHttp {

            /**
             * Constructs a new Http.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IHttp);

            /** Http rules. */
            public rules: google.api.IHttpRule[];

            /** Http fullyDecodeReservedExpansion. */
            public fullyDecodeReservedExpansion: boolean;

            /**
             * Creates a new Http instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Http instance
             */
            public static create(properties?: google.api.IHttp): google.api.Http;

            /**
             * Encodes the specified Http message. Does not implicitly {@link google.api.Http.verify|verify} messages.
             * @param message Http message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Http message, length delimited. Does not implicitly {@link google.api.Http.verify|verify} messages.
             * @param message Http message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Http message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.Http;

            /**
             * Decodes a Http message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.Http;

            /**
             * Verifies a Http message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Http message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Http
             */
            public static fromObject(object: { [k: string]: any }): google.api.Http;

            /**
             * Creates a plain object from a Http message. Also converts values to other types if specified.
             * @param message Http
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.Http, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Http to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Http
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a HttpRule. */
        interface IHttpRule {

            /** HttpRule selector */
            selector?: (string|null);

            /** HttpRule get */
            get?: (string|null);

            /** HttpRule put */
            put?: (string|null);

            /** HttpRule post */
            post?: (string|null);

            /** HttpRule delete */
            "delete"?: (string|null);

            /** HttpRule patch */
            patch?: (string|null);

            /** HttpRule custom */
            custom?: (google.api.ICustomHttpPattern|null);

            /** HttpRule body */
            body?: (string|null);

            /** HttpRule responseBody */
            responseBody?: (string|null);

            /** HttpRule additionalBindings */
            additionalBindings?: (google.api.IHttpRule[]|null);
        }

        /** Represents a HttpRule. */
        class HttpRule implements IHttpRule {

            /**
             * Constructs a new HttpRule.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IHttpRule);

            /** HttpRule selector. */
            public selector: string;

            /** HttpRule get. */
            public get?: (string|null);

            /** HttpRule put. */
            public put?: (string|null);

            /** HttpRule post. */
            public post?: (string|null);

            /** HttpRule delete. */
            public delete?: (string|null);

            /** HttpRule patch. */
            public patch?: (string|null);

            /** HttpRule custom. */
            public custom?: (google.api.ICustomHttpPattern|null);

            /** HttpRule body. */
            public body: string;

            /** HttpRule responseBody. */
            public responseBody: string;

            /** HttpRule additionalBindings. */
            public additionalBindings: google.api.IHttpRule[];

            /** HttpRule pattern. */
            public pattern?: ("get"|"put"|"post"|"delete"|"patch"|"custom");

            /**
             * Creates a new HttpRule instance using the specified properties.
             * @param [properties] Properties to set
             * @returns HttpRule instance
             */
            public static create(properties?: google.api.IHttpRule): google.api.HttpRule;

            /**
             * Encodes the specified HttpRule message. Does not implicitly {@link google.api.HttpRule.verify|verify} messages.
             * @param message HttpRule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified HttpRule message, length delimited. Does not implicitly {@link google.api.HttpRule.verify|verify} messages.
             * @param message HttpRule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a HttpRule message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns HttpRule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.HttpRule;

            /**
             * Decodes a HttpRule message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns HttpRule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.HttpRule;

            /**
             * Verifies a HttpRule message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a HttpRule message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns HttpRule
             */
            public static fromObject(object: { [k: string]: any }): google.api.HttpRule;

            /**
             * Creates a plain object from a HttpRule message. Also converts values to other types if specified.
             * @param message HttpRule
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.HttpRule, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this HttpRule to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for HttpRule
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CustomHttpPattern. */
        interface ICustomHttpPattern {

            /** CustomHttpPattern kind */
            kind?: (string|null);

            /** CustomHttpPattern path */
            path?: (string|null);
        }

        /** Represents a CustomHttpPattern. */
        class CustomHttpPattern implements ICustomHttpPattern {

            /**
             * Constructs a new CustomHttpPattern.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.ICustomHttpPattern);

            /** CustomHttpPattern kind. */
            public kind: string;

            /** CustomHttpPattern path. */
            public path: string;

            /**
             * Creates a new CustomHttpPattern instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CustomHttpPattern instance
             */
            public static create(properties?: google.api.ICustomHttpPattern): google.api.CustomHttpPattern;

            /**
             * Encodes the specified CustomHttpPattern message. Does not implicitly {@link google.api.CustomHttpPattern.verify|verify} messages.
             * @param message CustomHttpPattern message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CustomHttpPattern message, length delimited. Does not implicitly {@link google.api.CustomHttpPattern.verify|verify} messages.
             * @param message CustomHttpPattern message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CustomHttpPattern message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CustomHttpPattern
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.CustomHttpPattern;

            /**
             * Decodes a CustomHttpPattern message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CustomHttpPattern
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.CustomHttpPattern;

            /**
             * Verifies a CustomHttpPattern message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CustomHttpPattern message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CustomHttpPattern
             */
            public static fromObject(object: { [k: string]: any }): google.api.CustomHttpPattern;

            /**
             * Creates a plain object from a CustomHttpPattern message. Also converts values to other types if specified.
             * @param message CustomHttpPattern
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.CustomHttpPattern, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CustomHttpPattern to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CustomHttpPattern
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ResourceDescriptor. */
        interface IResourceDescriptor {

            /** ResourceDescriptor type */
            type?: (string|null);

            /** ResourceDescriptor pattern */
            pattern?: (string[]|null);

            /** ResourceDescriptor nameField */
            nameField?: (string|null);

            /** ResourceDescriptor history */
            history?: (google.api.ResourceDescriptor.History|keyof typeof google.api.ResourceDescriptor.History|null);

            /** ResourceDescriptor plural */
            plural?: (string|null);

            /** ResourceDescriptor singular */
            singular?: (string|null);

            /** ResourceDescriptor style */
            style?: (google.api.ResourceDescriptor.Style[]|null);
        }

        /** Represents a ResourceDescriptor. */
        class ResourceDescriptor implements IResourceDescriptor {

            /**
             * Constructs a new ResourceDescriptor.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IResourceDescriptor);

            /** ResourceDescriptor type. */
            public type: string;

            /** ResourceDescriptor pattern. */
            public pattern: string[];

            /** ResourceDescriptor nameField. */
            public nameField: string;

            /** ResourceDescriptor history. */
            public history: (google.api.ResourceDescriptor.History|keyof typeof google.api.ResourceDescriptor.History);

            /** ResourceDescriptor plural. */
            public plural: string;

            /** ResourceDescriptor singular. */
            public singular: string;

            /** ResourceDescriptor style. */
            public style: google.api.ResourceDescriptor.Style[];

            /**
             * Creates a new ResourceDescriptor instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ResourceDescriptor instance
             */
            public static create(properties?: google.api.IResourceDescriptor): google.api.ResourceDescriptor;

            /**
             * Encodes the specified ResourceDescriptor message. Does not implicitly {@link google.api.ResourceDescriptor.verify|verify} messages.
             * @param message ResourceDescriptor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IResourceDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ResourceDescriptor message, length delimited. Does not implicitly {@link google.api.ResourceDescriptor.verify|verify} messages.
             * @param message ResourceDescriptor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IResourceDescriptor, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ResourceDescriptor message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ResourceDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.ResourceDescriptor;

            /**
             * Decodes a ResourceDescriptor message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ResourceDescriptor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.ResourceDescriptor;

            /**
             * Verifies a ResourceDescriptor message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ResourceDescriptor message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ResourceDescriptor
             */
            public static fromObject(object: { [k: string]: any }): google.api.ResourceDescriptor;

            /**
             * Creates a plain object from a ResourceDescriptor message. Also converts values to other types if specified.
             * @param message ResourceDescriptor
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.ResourceDescriptor, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ResourceDescriptor to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ResourceDescriptor
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace ResourceDescriptor {

            /** History enum. */
            enum History {
                HISTORY_UNSPECIFIED = 0,
                ORIGINALLY_SINGLE_PATTERN = 1,
                FUTURE_MULTI_PATTERN = 2
            }

            /** Style enum. */
            enum Style {
                STYLE_UNSPECIFIED = 0,
                DECLARATIVE_FRIENDLY = 1
            }
        }

        /** Properties of a ResourceReference. */
        interface IResourceReference {

            /** ResourceReference type */
            type?: (string|null);

            /** ResourceReference childType */
            childType?: (string|null);
        }

        /** Represents a ResourceReference. */
        class ResourceReference implements IResourceReference {

            /**
             * Constructs a new ResourceReference.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IResourceReference);

            /** ResourceReference type. */
            public type: string;

            /** ResourceReference childType. */
            public childType: string;

            /**
             * Creates a new ResourceReference instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ResourceReference instance
             */
            public static create(properties?: google.api.IResourceReference): google.api.ResourceReference;

            /**
             * Encodes the specified ResourceReference message. Does not implicitly {@link google.api.ResourceReference.verify|verify} messages.
             * @param message ResourceReference message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IResourceReference, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ResourceReference message, length delimited. Does not implicitly {@link google.api.ResourceReference.verify|verify} messages.
             * @param message ResourceReference message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IResourceReference, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ResourceReference message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ResourceReference
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.ResourceReference;

            /**
             * Decodes a ResourceReference message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ResourceReference
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.ResourceReference;

            /**
             * Verifies a ResourceReference message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ResourceReference message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ResourceReference
             */
            public static fromObject(object: { [k: string]: any }): google.api.ResourceReference;

            /**
             * Creates a plain object from a ResourceReference message. Also converts values to other types if specified.
             * @param message ResourceReference
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.ResourceReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ResourceReference to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ResourceReference
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a FileDescriptorSet. */
        interface IFileDescriptorSet {

            /** FileDescriptorSet file */
            file?: (google.protobuf.IFileDescriptorProto[]|null);
        }

        /** Represents a FileDescriptorSet. */
        class FileDescriptorSet implements IFileDescriptorSet {

            /**
             * Constructs a new FileDescriptorSet.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileDescriptorSet);

            /** FileDescriptorSet file. */
            public file: google.protobuf.IFileDescriptorProto[];

            /**
             * Creates a new FileDescriptorSet instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileDescriptorSet instance
             */
            public static create(properties?: google.protobuf.IFileDescriptorSet): google.protobuf.FileDescriptorSet;

            /**
             * Encodes the specified FileDescriptorSet message. Does not implicitly {@link google.protobuf.FileDescriptorSet.verify|verify} messages.
             * @param message FileDescriptorSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileDescriptorSet message, length delimited. Does not implicitly {@link google.protobuf.FileDescriptorSet.verify|verify} messages.
             * @param message FileDescriptorSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileDescriptorSet message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileDescriptorSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorSet;

            /**
             * Decodes a FileDescriptorSet message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileDescriptorSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorSet;

            /**
             * Verifies a FileDescriptorSet message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileDescriptorSet message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileDescriptorSet
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorSet;

            /**
             * Creates a plain object from a FileDescriptorSet message. Also converts values to other types if specified.
             * @param message FileDescriptorSet
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileDescriptorSet, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileDescriptorSet to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FileDescriptorSet
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a FileDescriptorProto. */
        interface IFileDescriptorProto {

            /** FileDescriptorProto name */
            name?: (string|null);

            /** FileDescriptorProto package */
            "package"?: (string|null);

            /** FileDescriptorProto dependency */
            dependency?: (string[]|null);

            /** FileDescriptorProto publicDependency */
            publicDependency?: (number[]|null);

            /** FileDescriptorProto weakDependency */
            weakDependency?: (number[]|null);

            /** FileDescriptorProto messageType */
            messageType?: (google.protobuf.IDescriptorProto[]|null);

            /** FileDescriptorProto enumType */
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);

            /** FileDescriptorProto service */
            service?: (google.protobuf.IServiceDescriptorProto[]|null);

            /** FileDescriptorProto extension */
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** FileDescriptorProto options */
            options?: (google.protobuf.IFileOptions|null);

            /** FileDescriptorProto sourceCodeInfo */
            sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);

            /** FileDescriptorProto syntax */
            syntax?: (string|null);

            /** FileDescriptorProto edition */
            edition?: (string|null);
        }

        /** Represents a FileDescriptorProto. */
        class FileDescriptorProto implements IFileDescriptorProto {

            /**
             * Constructs a new FileDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileDescriptorProto);

            /** FileDescriptorProto name. */
            public name: string;

            /** FileDescriptorProto package. */
            public package: string;

            /** FileDescriptorProto dependency. */
            public dependency: string[];

            /** FileDescriptorProto publicDependency. */
            public publicDependency: number[];

            /** FileDescriptorProto weakDependency. */
            public weakDependency: number[];

            /** FileDescriptorProto messageType. */
            public messageType: google.protobuf.IDescriptorProto[];

            /** FileDescriptorProto enumType. */
            public enumType: google.protobuf.IEnumDescriptorProto[];

            /** FileDescriptorProto service. */
            public service: google.protobuf.IServiceDescriptorProto[];

            /** FileDescriptorProto extension. */
            public extension: google.protobuf.IFieldDescriptorProto[];

            /** FileDescriptorProto options. */
            public options?: (google.protobuf.IFileOptions|null);

            /** FileDescriptorProto sourceCodeInfo. */
            public sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);

            /** FileDescriptorProto syntax. */
            public syntax: string;

            /** FileDescriptorProto edition. */
            public edition: string;

            /**
             * Creates a new FileDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IFileDescriptorProto): google.protobuf.FileDescriptorProto;

            /**
             * Encodes the specified FileDescriptorProto message. Does not implicitly {@link google.protobuf.FileDescriptorProto.verify|verify} messages.
             * @param message FileDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.FileDescriptorProto.verify|verify} messages.
             * @param message FileDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorProto;

            /**
             * Decodes a FileDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorProto;

            /**
             * Verifies a FileDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorProto;

            /**
             * Creates a plain object from a FileDescriptorProto message. Also converts values to other types if specified.
             * @param message FileDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FileDescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DescriptorProto. */
        interface IDescriptorProto {

            /** DescriptorProto name */
            name?: (string|null);

            /** DescriptorProto field */
            field?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** DescriptorProto extension */
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** DescriptorProto nestedType */
            nestedType?: (google.protobuf.IDescriptorProto[]|null);

            /** DescriptorProto enumType */
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);

            /** DescriptorProto extensionRange */
            extensionRange?: (google.protobuf.DescriptorProto.IExtensionRange[]|null);

            /** DescriptorProto oneofDecl */
            oneofDecl?: (google.protobuf.IOneofDescriptorProto[]|null);

            /** DescriptorProto options */
            options?: (google.protobuf.IMessageOptions|null);

            /** DescriptorProto reservedRange */
            reservedRange?: (google.protobuf.DescriptorProto.IReservedRange[]|null);

            /** DescriptorProto reservedName */
            reservedName?: (string[]|null);
        }

        /** Represents a DescriptorProto. */
        class DescriptorProto implements IDescriptorProto {

            /**
             * Constructs a new DescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDescriptorProto);

            /** DescriptorProto name. */
            public name: string;

            /** DescriptorProto field. */
            public field: google.protobuf.IFieldDescriptorProto[];

            /** DescriptorProto extension. */
            public extension: google.protobuf.IFieldDescriptorProto[];

            /** DescriptorProto nestedType. */
            public nestedType: google.protobuf.IDescriptorProto[];

            /** DescriptorProto enumType. */
            public enumType: google.protobuf.IEnumDescriptorProto[];

            /** DescriptorProto extensionRange. */
            public extensionRange: google.protobuf.DescriptorProto.IExtensionRange[];

            /** DescriptorProto oneofDecl. */
            public oneofDecl: google.protobuf.IOneofDescriptorProto[];

            /** DescriptorProto options. */
            public options?: (google.protobuf.IMessageOptions|null);

            /** DescriptorProto reservedRange. */
            public reservedRange: google.protobuf.DescriptorProto.IReservedRange[];

            /** DescriptorProto reservedName. */
            public reservedName: string[];

            /**
             * Creates a new DescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DescriptorProto instance
             */
            public static create(properties?: google.protobuf.IDescriptorProto): google.protobuf.DescriptorProto;

            /**
             * Encodes the specified DescriptorProto message. Does not implicitly {@link google.protobuf.DescriptorProto.verify|verify} messages.
             * @param message DescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.verify|verify} messages.
             * @param message DescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto;

            /**
             * Decodes a DescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto;

            /**
             * Verifies a DescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto;

            /**
             * Creates a plain object from a DescriptorProto message. Also converts values to other types if specified.
             * @param message DescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.DescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace DescriptorProto {

            /** Properties of an ExtensionRange. */
            interface IExtensionRange {

                /** ExtensionRange start */
                start?: (number|null);

                /** ExtensionRange end */
                end?: (number|null);

                /** ExtensionRange options */
                options?: (google.protobuf.IExtensionRangeOptions|null);
            }

            /** Represents an ExtensionRange. */
            class ExtensionRange implements IExtensionRange {

                /**
                 * Constructs a new ExtensionRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.DescriptorProto.IExtensionRange);

                /** ExtensionRange start. */
                public start: number;

                /** ExtensionRange end. */
                public end: number;

                /** ExtensionRange options. */
                public options?: (google.protobuf.IExtensionRangeOptions|null);

                /**
                 * Creates a new ExtensionRange instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ExtensionRange instance
                 */
                public static create(properties?: google.protobuf.DescriptorProto.IExtensionRange): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Encodes the specified ExtensionRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ExtensionRange.verify|verify} messages.
                 * @param message ExtensionRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ExtensionRange message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.ExtensionRange.verify|verify} messages.
                 * @param message ExtensionRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ExtensionRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ExtensionRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Decodes an ExtensionRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ExtensionRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Verifies an ExtensionRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ExtensionRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ExtensionRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Creates a plain object from an ExtensionRange message. Also converts values to other types if specified.
                 * @param message ExtensionRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.DescriptorProto.ExtensionRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ExtensionRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ExtensionRange
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            /** Properties of a ReservedRange. */
            interface IReservedRange {

                /** ReservedRange start */
                start?: (number|null);

                /** ReservedRange end */
                end?: (number|null);
            }

            /** Represents a ReservedRange. */
            class ReservedRange implements IReservedRange {

                /**
                 * Constructs a new ReservedRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.DescriptorProto.IReservedRange);

                /** ReservedRange start. */
                public start: number;

                /** ReservedRange end. */
                public end: number;

                /**
                 * Creates a new ReservedRange instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ReservedRange instance
                 */
                public static create(properties?: google.protobuf.DescriptorProto.IReservedRange): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Encodes the specified ReservedRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ReservedRange.verify|verify} messages.
                 * @param message ReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ReservedRange message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.ReservedRange.verify|verify} messages.
                 * @param message ReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ReservedRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Decodes a ReservedRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Verifies a ReservedRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ReservedRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ReservedRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Creates a plain object from a ReservedRange message. Also converts values to other types if specified.
                 * @param message ReservedRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.DescriptorProto.ReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ReservedRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for ReservedRange
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        /** Properties of an ExtensionRangeOptions. */
        interface IExtensionRangeOptions {

            /** ExtensionRangeOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an ExtensionRangeOptions. */
        class ExtensionRangeOptions implements IExtensionRangeOptions {

            /**
             * Constructs a new ExtensionRangeOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IExtensionRangeOptions);

            /** ExtensionRangeOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new ExtensionRangeOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExtensionRangeOptions instance
             */
            public static create(properties?: google.protobuf.IExtensionRangeOptions): google.protobuf.ExtensionRangeOptions;

            /**
             * Encodes the specified ExtensionRangeOptions message. Does not implicitly {@link google.protobuf.ExtensionRangeOptions.verify|verify} messages.
             * @param message ExtensionRangeOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExtensionRangeOptions message, length delimited. Does not implicitly {@link google.protobuf.ExtensionRangeOptions.verify|verify} messages.
             * @param message ExtensionRangeOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExtensionRangeOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ExtensionRangeOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ExtensionRangeOptions;

            /**
             * Decodes an ExtensionRangeOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ExtensionRangeOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ExtensionRangeOptions;

            /**
             * Verifies an ExtensionRangeOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ExtensionRangeOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ExtensionRangeOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ExtensionRangeOptions;

            /**
             * Creates a plain object from an ExtensionRangeOptions message. Also converts values to other types if specified.
             * @param message ExtensionRangeOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ExtensionRangeOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ExtensionRangeOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ExtensionRangeOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a FieldDescriptorProto. */
        interface IFieldDescriptorProto {

            /** FieldDescriptorProto name */
            name?: (string|null);

            /** FieldDescriptorProto number */
            number?: (number|null);

            /** FieldDescriptorProto label */
            label?: (google.protobuf.FieldDescriptorProto.Label|keyof typeof google.protobuf.FieldDescriptorProto.Label|null);

            /** FieldDescriptorProto type */
            type?: (google.protobuf.FieldDescriptorProto.Type|keyof typeof google.protobuf.FieldDescriptorProto.Type|null);

            /** FieldDescriptorProto typeName */
            typeName?: (string|null);

            /** FieldDescriptorProto extendee */
            extendee?: (string|null);

            /** FieldDescriptorProto defaultValue */
            defaultValue?: (string|null);

            /** FieldDescriptorProto oneofIndex */
            oneofIndex?: (number|null);

            /** FieldDescriptorProto jsonName */
            jsonName?: (string|null);

            /** FieldDescriptorProto options */
            options?: (google.protobuf.IFieldOptions|null);

            /** FieldDescriptorProto proto3Optional */
            proto3Optional?: (boolean|null);
        }

        /** Represents a FieldDescriptorProto. */
        class FieldDescriptorProto implements IFieldDescriptorProto {

            /**
             * Constructs a new FieldDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFieldDescriptorProto);

            /** FieldDescriptorProto name. */
            public name: string;

            /** FieldDescriptorProto number. */
            public number: number;

            /** FieldDescriptorProto label. */
            public label: (google.protobuf.FieldDescriptorProto.Label|keyof typeof google.protobuf.FieldDescriptorProto.Label);

            /** FieldDescriptorProto type. */
            public type: (google.protobuf.FieldDescriptorProto.Type|keyof typeof google.protobuf.FieldDescriptorProto.Type);

            /** FieldDescriptorProto typeName. */
            public typeName: string;

            /** FieldDescriptorProto extendee. */
            public extendee: string;

            /** FieldDescriptorProto defaultValue. */
            public defaultValue: string;

            /** FieldDescriptorProto oneofIndex. */
            public oneofIndex: number;

            /** FieldDescriptorProto jsonName. */
            public jsonName: string;

            /** FieldDescriptorProto options. */
            public options?: (google.protobuf.IFieldOptions|null);

            /** FieldDescriptorProto proto3Optional. */
            public proto3Optional: boolean;

            /**
             * Creates a new FieldDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FieldDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IFieldDescriptorProto): google.protobuf.FieldDescriptorProto;

            /**
             * Encodes the specified FieldDescriptorProto message. Does not implicitly {@link google.protobuf.FieldDescriptorProto.verify|verify} messages.
             * @param message FieldDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.FieldDescriptorProto.verify|verify} messages.
             * @param message FieldDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldDescriptorProto;

            /**
             * Decodes a FieldDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldDescriptorProto;

            /**
             * Verifies a FieldDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldDescriptorProto;

            /**
             * Creates a plain object from a FieldDescriptorProto message. Also converts values to other types if specified.
             * @param message FieldDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FieldDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FieldDescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace FieldDescriptorProto {

            /** Type enum. */
            enum Type {
                TYPE_DOUBLE = 1,
                TYPE_FLOAT = 2,
                TYPE_INT64 = 3,
                TYPE_UINT64 = 4,
                TYPE_INT32 = 5,
                TYPE_FIXED64 = 6,
                TYPE_FIXED32 = 7,
                TYPE_BOOL = 8,
                TYPE_STRING = 9,
                TYPE_GROUP = 10,
                TYPE_MESSAGE = 11,
                TYPE_BYTES = 12,
                TYPE_UINT32 = 13,
                TYPE_ENUM = 14,
                TYPE_SFIXED32 = 15,
                TYPE_SFIXED64 = 16,
                TYPE_SINT32 = 17,
                TYPE_SINT64 = 18
            }

            /** Label enum. */
            enum Label {
                LABEL_OPTIONAL = 1,
                LABEL_REQUIRED = 2,
                LABEL_REPEATED = 3
            }
        }

        /** Properties of an OneofDescriptorProto. */
        interface IOneofDescriptorProto {

            /** OneofDescriptorProto name */
            name?: (string|null);

            /** OneofDescriptorProto options */
            options?: (google.protobuf.IOneofOptions|null);
        }

        /** Represents an OneofDescriptorProto. */
        class OneofDescriptorProto implements IOneofDescriptorProto {

            /**
             * Constructs a new OneofDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IOneofDescriptorProto);

            /** OneofDescriptorProto name. */
            public name: string;

            /** OneofDescriptorProto options. */
            public options?: (google.protobuf.IOneofOptions|null);

            /**
             * Creates a new OneofDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OneofDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IOneofDescriptorProto): google.protobuf.OneofDescriptorProto;

            /**
             * Encodes the specified OneofDescriptorProto message. Does not implicitly {@link google.protobuf.OneofDescriptorProto.verify|verify} messages.
             * @param message OneofDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.OneofDescriptorProto.verify|verify} messages.
             * @param message OneofDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofDescriptorProto;

            /**
             * Decodes an OneofDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofDescriptorProto;

            /**
             * Verifies an OneofDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofDescriptorProto;

            /**
             * Creates a plain object from an OneofDescriptorProto message. Also converts values to other types if specified.
             * @param message OneofDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.OneofDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for OneofDescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EnumDescriptorProto. */
        interface IEnumDescriptorProto {

            /** EnumDescriptorProto name */
            name?: (string|null);

            /** EnumDescriptorProto value */
            value?: (google.protobuf.IEnumValueDescriptorProto[]|null);

            /** EnumDescriptorProto options */
            options?: (google.protobuf.IEnumOptions|null);

            /** EnumDescriptorProto reservedRange */
            reservedRange?: (google.protobuf.EnumDescriptorProto.IEnumReservedRange[]|null);

            /** EnumDescriptorProto reservedName */
            reservedName?: (string[]|null);
        }

        /** Represents an EnumDescriptorProto. */
        class EnumDescriptorProto implements IEnumDescriptorProto {

            /**
             * Constructs a new EnumDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumDescriptorProto);

            /** EnumDescriptorProto name. */
            public name: string;

            /** EnumDescriptorProto value. */
            public value: google.protobuf.IEnumValueDescriptorProto[];

            /** EnumDescriptorProto options. */
            public options?: (google.protobuf.IEnumOptions|null);

            /** EnumDescriptorProto reservedRange. */
            public reservedRange: google.protobuf.EnumDescriptorProto.IEnumReservedRange[];

            /** EnumDescriptorProto reservedName. */
            public reservedName: string[];

            /**
             * Creates a new EnumDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IEnumDescriptorProto): google.protobuf.EnumDescriptorProto;

            /**
             * Encodes the specified EnumDescriptorProto message. Does not implicitly {@link google.protobuf.EnumDescriptorProto.verify|verify} messages.
             * @param message EnumDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.EnumDescriptorProto.verify|verify} messages.
             * @param message EnumDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto;

            /**
             * Decodes an EnumDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto;

            /**
             * Verifies an EnumDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto;

            /**
             * Creates a plain object from an EnumDescriptorProto message. Also converts values to other types if specified.
             * @param message EnumDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EnumDescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace EnumDescriptorProto {

            /** Properties of an EnumReservedRange. */
            interface IEnumReservedRange {

                /** EnumReservedRange start */
                start?: (number|null);

                /** EnumReservedRange end */
                end?: (number|null);
            }

            /** Represents an EnumReservedRange. */
            class EnumReservedRange implements IEnumReservedRange {

                /**
                 * Constructs a new EnumReservedRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange);

                /** EnumReservedRange start. */
                public start: number;

                /** EnumReservedRange end. */
                public end: number;

                /**
                 * Creates a new EnumReservedRange instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns EnumReservedRange instance
                 */
                public static create(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Encodes the specified EnumReservedRange message. Does not implicitly {@link google.protobuf.EnumDescriptorProto.EnumReservedRange.verify|verify} messages.
                 * @param message EnumReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EnumReservedRange message, length delimited. Does not implicitly {@link google.protobuf.EnumDescriptorProto.EnumReservedRange.verify|verify} messages.
                 * @param message EnumReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EnumReservedRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EnumReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Decodes an EnumReservedRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EnumReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Verifies an EnumReservedRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EnumReservedRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EnumReservedRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Creates a plain object from an EnumReservedRange message. Also converts values to other types if specified.
                 * @param message EnumReservedRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.EnumDescriptorProto.EnumReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EnumReservedRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for EnumReservedRange
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        /** Properties of an EnumValueDescriptorProto. */
        interface IEnumValueDescriptorProto {

            /** EnumValueDescriptorProto name */
            name?: (string|null);

            /** EnumValueDescriptorProto number */
            number?: (number|null);

            /** EnumValueDescriptorProto options */
            options?: (google.protobuf.IEnumValueOptions|null);
        }

        /** Represents an EnumValueDescriptorProto. */
        class EnumValueDescriptorProto implements IEnumValueDescriptorProto {

            /**
             * Constructs a new EnumValueDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumValueDescriptorProto);

            /** EnumValueDescriptorProto name. */
            public name: string;

            /** EnumValueDescriptorProto number. */
            public number: number;

            /** EnumValueDescriptorProto options. */
            public options?: (google.protobuf.IEnumValueOptions|null);

            /**
             * Creates a new EnumValueDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumValueDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IEnumValueDescriptorProto): google.protobuf.EnumValueDescriptorProto;

            /**
             * Encodes the specified EnumValueDescriptorProto message. Does not implicitly {@link google.protobuf.EnumValueDescriptorProto.verify|verify} messages.
             * @param message EnumValueDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumValueDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.EnumValueDescriptorProto.verify|verify} messages.
             * @param message EnumValueDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumValueDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumValueDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueDescriptorProto;

            /**
             * Decodes an EnumValueDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumValueDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueDescriptorProto;

            /**
             * Verifies an EnumValueDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumValueDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumValueDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueDescriptorProto;

            /**
             * Creates a plain object from an EnumValueDescriptorProto message. Also converts values to other types if specified.
             * @param message EnumValueDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumValueDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumValueDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EnumValueDescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ServiceDescriptorProto. */
        interface IServiceDescriptorProto {

            /** ServiceDescriptorProto name */
            name?: (string|null);

            /** ServiceDescriptorProto method */
            method?: (google.protobuf.IMethodDescriptorProto[]|null);

            /** ServiceDescriptorProto options */
            options?: (google.protobuf.IServiceOptions|null);
        }

        /** Represents a ServiceDescriptorProto. */
        class ServiceDescriptorProto implements IServiceDescriptorProto {

            /**
             * Constructs a new ServiceDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IServiceDescriptorProto);

            /** ServiceDescriptorProto name. */
            public name: string;

            /** ServiceDescriptorProto method. */
            public method: google.protobuf.IMethodDescriptorProto[];

            /** ServiceDescriptorProto options. */
            public options?: (google.protobuf.IServiceOptions|null);

            /**
             * Creates a new ServiceDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServiceDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IServiceDescriptorProto): google.protobuf.ServiceDescriptorProto;

            /**
             * Encodes the specified ServiceDescriptorProto message. Does not implicitly {@link google.protobuf.ServiceDescriptorProto.verify|verify} messages.
             * @param message ServiceDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServiceDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.ServiceDescriptorProto.verify|verify} messages.
             * @param message ServiceDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServiceDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServiceDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceDescriptorProto;

            /**
             * Decodes a ServiceDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServiceDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceDescriptorProto;

            /**
             * Verifies a ServiceDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServiceDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServiceDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceDescriptorProto;

            /**
             * Creates a plain object from a ServiceDescriptorProto message. Also converts values to other types if specified.
             * @param message ServiceDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ServiceDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServiceDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ServiceDescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a MethodDescriptorProto. */
        interface IMethodDescriptorProto {

            /** MethodDescriptorProto name */
            name?: (string|null);

            /** MethodDescriptorProto inputType */
            inputType?: (string|null);

            /** MethodDescriptorProto outputType */
            outputType?: (string|null);

            /** MethodDescriptorProto options */
            options?: (google.protobuf.IMethodOptions|null);

            /** MethodDescriptorProto clientStreaming */
            clientStreaming?: (boolean|null);

            /** MethodDescriptorProto serverStreaming */
            serverStreaming?: (boolean|null);
        }

        /** Represents a MethodDescriptorProto. */
        class MethodDescriptorProto implements IMethodDescriptorProto {

            /**
             * Constructs a new MethodDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMethodDescriptorProto);

            /** MethodDescriptorProto name. */
            public name: string;

            /** MethodDescriptorProto inputType. */
            public inputType: string;

            /** MethodDescriptorProto outputType. */
            public outputType: string;

            /** MethodDescriptorProto options. */
            public options?: (google.protobuf.IMethodOptions|null);

            /** MethodDescriptorProto clientStreaming. */
            public clientStreaming: boolean;

            /** MethodDescriptorProto serverStreaming. */
            public serverStreaming: boolean;

            /**
             * Creates a new MethodDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MethodDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IMethodDescriptorProto): google.protobuf.MethodDescriptorProto;

            /**
             * Encodes the specified MethodDescriptorProto message. Does not implicitly {@link google.protobuf.MethodDescriptorProto.verify|verify} messages.
             * @param message MethodDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MethodDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.MethodDescriptorProto.verify|verify} messages.
             * @param message MethodDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MethodDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MethodDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodDescriptorProto;

            /**
             * Decodes a MethodDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MethodDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodDescriptorProto;

            /**
             * Verifies a MethodDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MethodDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MethodDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodDescriptorProto;

            /**
             * Creates a plain object from a MethodDescriptorProto message. Also converts values to other types if specified.
             * @param message MethodDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MethodDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MethodDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MethodDescriptorProto
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a FileOptions. */
        interface IFileOptions {

            /** FileOptions javaPackage */
            javaPackage?: (string|null);

            /** FileOptions javaOuterClassname */
            javaOuterClassname?: (string|null);

            /** FileOptions javaMultipleFiles */
            javaMultipleFiles?: (boolean|null);

            /** FileOptions javaGenerateEqualsAndHash */
            javaGenerateEqualsAndHash?: (boolean|null);

            /** FileOptions javaStringCheckUtf8 */
            javaStringCheckUtf8?: (boolean|null);

            /** FileOptions optimizeFor */
            optimizeFor?: (google.protobuf.FileOptions.OptimizeMode|keyof typeof google.protobuf.FileOptions.OptimizeMode|null);

            /** FileOptions goPackage */
            goPackage?: (string|null);

            /** FileOptions ccGenericServices */
            ccGenericServices?: (boolean|null);

            /** FileOptions javaGenericServices */
            javaGenericServices?: (boolean|null);

            /** FileOptions pyGenericServices */
            pyGenericServices?: (boolean|null);

            /** FileOptions phpGenericServices */
            phpGenericServices?: (boolean|null);

            /** FileOptions deprecated */
            deprecated?: (boolean|null);

            /** FileOptions ccEnableArenas */
            ccEnableArenas?: (boolean|null);

            /** FileOptions objcClassPrefix */
            objcClassPrefix?: (string|null);

            /** FileOptions csharpNamespace */
            csharpNamespace?: (string|null);

            /** FileOptions swiftPrefix */
            swiftPrefix?: (string|null);

            /** FileOptions phpClassPrefix */
            phpClassPrefix?: (string|null);

            /** FileOptions phpNamespace */
            phpNamespace?: (string|null);

            /** FileOptions phpMetadataNamespace */
            phpMetadataNamespace?: (string|null);

            /** FileOptions rubyPackage */
            rubyPackage?: (string|null);

            /** FileOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** FileOptions .google.api.resourceDefinition */
            ".google.api.resourceDefinition"?: (google.api.IResourceDescriptor[]|null);
        }

        /** Represents a FileOptions. */
        class FileOptions implements IFileOptions {

            /**
             * Constructs a new FileOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileOptions);

            /** FileOptions javaPackage. */
            public javaPackage: string;

            /** FileOptions javaOuterClassname. */
            public javaOuterClassname: string;

            /** FileOptions javaMultipleFiles. */
            public javaMultipleFiles: boolean;

            /** FileOptions javaGenerateEqualsAndHash. */
            public javaGenerateEqualsAndHash: boolean;

            /** FileOptions javaStringCheckUtf8. */
            public javaStringCheckUtf8: boolean;

            /** FileOptions optimizeFor. */
            public optimizeFor: (google.protobuf.FileOptions.OptimizeMode|keyof typeof google.protobuf.FileOptions.OptimizeMode);

            /** FileOptions goPackage. */
            public goPackage: string;

            /** FileOptions ccGenericServices. */
            public ccGenericServices: boolean;

            /** FileOptions javaGenericServices. */
            public javaGenericServices: boolean;

            /** FileOptions pyGenericServices. */
            public pyGenericServices: boolean;

            /** FileOptions phpGenericServices. */
            public phpGenericServices: boolean;

            /** FileOptions deprecated. */
            public deprecated: boolean;

            /** FileOptions ccEnableArenas. */
            public ccEnableArenas: boolean;

            /** FileOptions objcClassPrefix. */
            public objcClassPrefix: string;

            /** FileOptions csharpNamespace. */
            public csharpNamespace: string;

            /** FileOptions swiftPrefix. */
            public swiftPrefix: string;

            /** FileOptions phpClassPrefix. */
            public phpClassPrefix: string;

            /** FileOptions phpNamespace. */
            public phpNamespace: string;

            /** FileOptions phpMetadataNamespace. */
            public phpMetadataNamespace: string;

            /** FileOptions rubyPackage. */
            public rubyPackage: string;

            /** FileOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new FileOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileOptions instance
             */
            public static create(properties?: google.protobuf.IFileOptions): google.protobuf.FileOptions;

            /**
             * Encodes the specified FileOptions message. Does not implicitly {@link google.protobuf.FileOptions.verify|verify} messages.
             * @param message FileOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileOptions message, length delimited. Does not implicitly {@link google.protobuf.FileOptions.verify|verify} messages.
             * @param message FileOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileOptions;

            /**
             * Decodes a FileOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileOptions;

            /**
             * Verifies a FileOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileOptions;

            /**
             * Creates a plain object from a FileOptions message. Also converts values to other types if specified.
             * @param message FileOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FileOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace FileOptions {

            /** OptimizeMode enum. */
            enum OptimizeMode {
                SPEED = 1,
                CODE_SIZE = 2,
                LITE_RUNTIME = 3
            }
        }

        /** Properties of a MessageOptions. */
        interface IMessageOptions {

            /** MessageOptions messageSetWireFormat */
            messageSetWireFormat?: (boolean|null);

            /** MessageOptions noStandardDescriptorAccessor */
            noStandardDescriptorAccessor?: (boolean|null);

            /** MessageOptions deprecated */
            deprecated?: (boolean|null);

            /** MessageOptions mapEntry */
            mapEntry?: (boolean|null);

            /** MessageOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** MessageOptions .google.api.resource */
            ".google.api.resource"?: (google.api.IResourceDescriptor|null);
        }

        /** Represents a MessageOptions. */
        class MessageOptions implements IMessageOptions {

            /**
             * Constructs a new MessageOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMessageOptions);

            /** MessageOptions messageSetWireFormat. */
            public messageSetWireFormat: boolean;

            /** MessageOptions noStandardDescriptorAccessor. */
            public noStandardDescriptorAccessor: boolean;

            /** MessageOptions deprecated. */
            public deprecated: boolean;

            /** MessageOptions mapEntry. */
            public mapEntry: boolean;

            /** MessageOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new MessageOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MessageOptions instance
             */
            public static create(properties?: google.protobuf.IMessageOptions): google.protobuf.MessageOptions;

            /**
             * Encodes the specified MessageOptions message. Does not implicitly {@link google.protobuf.MessageOptions.verify|verify} messages.
             * @param message MessageOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MessageOptions message, length delimited. Does not implicitly {@link google.protobuf.MessageOptions.verify|verify} messages.
             * @param message MessageOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MessageOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MessageOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MessageOptions;

            /**
             * Decodes a MessageOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MessageOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MessageOptions;

            /**
             * Verifies a MessageOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MessageOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MessageOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MessageOptions;

            /**
             * Creates a plain object from a MessageOptions message. Also converts values to other types if specified.
             * @param message MessageOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MessageOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MessageOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MessageOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a FieldOptions. */
        interface IFieldOptions {

            /** FieldOptions ctype */
            ctype?: (google.protobuf.FieldOptions.CType|keyof typeof google.protobuf.FieldOptions.CType|null);

            /** FieldOptions packed */
            packed?: (boolean|null);

            /** FieldOptions jstype */
            jstype?: (google.protobuf.FieldOptions.JSType|keyof typeof google.protobuf.FieldOptions.JSType|null);

            /** FieldOptions lazy */
            lazy?: (boolean|null);

            /** FieldOptions unverifiedLazy */
            unverifiedLazy?: (boolean|null);

            /** FieldOptions deprecated */
            deprecated?: (boolean|null);

            /** FieldOptions weak */
            weak?: (boolean|null);

            /** FieldOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** FieldOptions .google.api.fieldBehavior */
            ".google.api.fieldBehavior"?: (google.api.FieldBehavior[]|null);

            /** FieldOptions .google.api.resourceReference */
            ".google.api.resourceReference"?: (google.api.IResourceReference|null);
        }

        /** Represents a FieldOptions. */
        class FieldOptions implements IFieldOptions {

            /**
             * Constructs a new FieldOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFieldOptions);

            /** FieldOptions ctype. */
            public ctype: (google.protobuf.FieldOptions.CType|keyof typeof google.protobuf.FieldOptions.CType);

            /** FieldOptions packed. */
            public packed: boolean;

            /** FieldOptions jstype. */
            public jstype: (google.protobuf.FieldOptions.JSType|keyof typeof google.protobuf.FieldOptions.JSType);

            /** FieldOptions lazy. */
            public lazy: boolean;

            /** FieldOptions unverifiedLazy. */
            public unverifiedLazy: boolean;

            /** FieldOptions deprecated. */
            public deprecated: boolean;

            /** FieldOptions weak. */
            public weak: boolean;

            /** FieldOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new FieldOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FieldOptions instance
             */
            public static create(properties?: google.protobuf.IFieldOptions): google.protobuf.FieldOptions;

            /**
             * Encodes the specified FieldOptions message. Does not implicitly {@link google.protobuf.FieldOptions.verify|verify} messages.
             * @param message FieldOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldOptions message, length delimited. Does not implicitly {@link google.protobuf.FieldOptions.verify|verify} messages.
             * @param message FieldOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldOptions;

            /**
             * Decodes a FieldOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldOptions;

            /**
             * Verifies a FieldOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldOptions;

            /**
             * Creates a plain object from a FieldOptions message. Also converts values to other types if specified.
             * @param message FieldOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FieldOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FieldOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace FieldOptions {

            /** CType enum. */
            enum CType {
                STRING = 0,
                CORD = 1,
                STRING_PIECE = 2
            }

            /** JSType enum. */
            enum JSType {
                JS_NORMAL = 0,
                JS_STRING = 1,
                JS_NUMBER = 2
            }
        }

        /** Properties of an OneofOptions. */
        interface IOneofOptions {

            /** OneofOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an OneofOptions. */
        class OneofOptions implements IOneofOptions {

            /**
             * Constructs a new OneofOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IOneofOptions);

            /** OneofOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new OneofOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OneofOptions instance
             */
            public static create(properties?: google.protobuf.IOneofOptions): google.protobuf.OneofOptions;

            /**
             * Encodes the specified OneofOptions message. Does not implicitly {@link google.protobuf.OneofOptions.verify|verify} messages.
             * @param message OneofOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofOptions message, length delimited. Does not implicitly {@link google.protobuf.OneofOptions.verify|verify} messages.
             * @param message OneofOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofOptions;

            /**
             * Decodes an OneofOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofOptions;

            /**
             * Verifies an OneofOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofOptions;

            /**
             * Creates a plain object from an OneofOptions message. Also converts values to other types if specified.
             * @param message OneofOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.OneofOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for OneofOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EnumOptions. */
        interface IEnumOptions {

            /** EnumOptions allowAlias */
            allowAlias?: (boolean|null);

            /** EnumOptions deprecated */
            deprecated?: (boolean|null);

            /** EnumOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an EnumOptions. */
        class EnumOptions implements IEnumOptions {

            /**
             * Constructs a new EnumOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumOptions);

            /** EnumOptions allowAlias. */
            public allowAlias: boolean;

            /** EnumOptions deprecated. */
            public deprecated: boolean;

            /** EnumOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new EnumOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumOptions instance
             */
            public static create(properties?: google.protobuf.IEnumOptions): google.protobuf.EnumOptions;

            /**
             * Encodes the specified EnumOptions message. Does not implicitly {@link google.protobuf.EnumOptions.verify|verify} messages.
             * @param message EnumOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumOptions message, length delimited. Does not implicitly {@link google.protobuf.EnumOptions.verify|verify} messages.
             * @param message EnumOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumOptions;

            /**
             * Decodes an EnumOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumOptions;

            /**
             * Verifies an EnumOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumOptions;

            /**
             * Creates a plain object from an EnumOptions message. Also converts values to other types if specified.
             * @param message EnumOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EnumOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an EnumValueOptions. */
        interface IEnumValueOptions {

            /** EnumValueOptions deprecated */
            deprecated?: (boolean|null);

            /** EnumValueOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an EnumValueOptions. */
        class EnumValueOptions implements IEnumValueOptions {

            /**
             * Constructs a new EnumValueOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumValueOptions);

            /** EnumValueOptions deprecated. */
            public deprecated: boolean;

            /** EnumValueOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new EnumValueOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumValueOptions instance
             */
            public static create(properties?: google.protobuf.IEnumValueOptions): google.protobuf.EnumValueOptions;

            /**
             * Encodes the specified EnumValueOptions message. Does not implicitly {@link google.protobuf.EnumValueOptions.verify|verify} messages.
             * @param message EnumValueOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumValueOptions message, length delimited. Does not implicitly {@link google.protobuf.EnumValueOptions.verify|verify} messages.
             * @param message EnumValueOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumValueOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumValueOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueOptions;

            /**
             * Decodes an EnumValueOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumValueOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueOptions;

            /**
             * Verifies an EnumValueOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumValueOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumValueOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueOptions;

            /**
             * Creates a plain object from an EnumValueOptions message. Also converts values to other types if specified.
             * @param message EnumValueOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumValueOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumValueOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for EnumValueOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ServiceOptions. */
        interface IServiceOptions {

            /** ServiceOptions deprecated */
            deprecated?: (boolean|null);

            /** ServiceOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** ServiceOptions .google.api.defaultHost */
            ".google.api.defaultHost"?: (string|null);

            /** ServiceOptions .google.api.oauthScopes */
            ".google.api.oauthScopes"?: (string|null);
        }

        /** Represents a ServiceOptions. */
        class ServiceOptions implements IServiceOptions {

            /**
             * Constructs a new ServiceOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IServiceOptions);

            /** ServiceOptions deprecated. */
            public deprecated: boolean;

            /** ServiceOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new ServiceOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServiceOptions instance
             */
            public static create(properties?: google.protobuf.IServiceOptions): google.protobuf.ServiceOptions;

            /**
             * Encodes the specified ServiceOptions message. Does not implicitly {@link google.protobuf.ServiceOptions.verify|verify} messages.
             * @param message ServiceOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServiceOptions message, length delimited. Does not implicitly {@link google.protobuf.ServiceOptions.verify|verify} messages.
             * @param message ServiceOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServiceOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServiceOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceOptions;

            /**
             * Decodes a ServiceOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServiceOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceOptions;

            /**
             * Verifies a ServiceOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServiceOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServiceOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceOptions;

            /**
             * Creates a plain object from a ServiceOptions message. Also converts values to other types if specified.
             * @param message ServiceOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServiceOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ServiceOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a MethodOptions. */
        interface IMethodOptions {

            /** MethodOptions deprecated */
            deprecated?: (boolean|null);

            /** MethodOptions idempotencyLevel */
            idempotencyLevel?: (google.protobuf.MethodOptions.IdempotencyLevel|keyof typeof google.protobuf.MethodOptions.IdempotencyLevel|null);

            /** MethodOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** MethodOptions .google.api.http */
            ".google.api.http"?: (google.api.IHttpRule|null);

            /** MethodOptions .google.api.methodSignature */
            ".google.api.methodSignature"?: (string[]|null);

            /** MethodOptions .google.longrunning.operationInfo */
            ".google.longrunning.operationInfo"?: (google.longrunning.IOperationInfo|null);
        }

        /** Represents a MethodOptions. */
        class MethodOptions implements IMethodOptions {

            /**
             * Constructs a new MethodOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMethodOptions);

            /** MethodOptions deprecated. */
            public deprecated: boolean;

            /** MethodOptions idempotencyLevel. */
            public idempotencyLevel: (google.protobuf.MethodOptions.IdempotencyLevel|keyof typeof google.protobuf.MethodOptions.IdempotencyLevel);

            /** MethodOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new MethodOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MethodOptions instance
             */
            public static create(properties?: google.protobuf.IMethodOptions): google.protobuf.MethodOptions;

            /**
             * Encodes the specified MethodOptions message. Does not implicitly {@link google.protobuf.MethodOptions.verify|verify} messages.
             * @param message MethodOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MethodOptions message, length delimited. Does not implicitly {@link google.protobuf.MethodOptions.verify|verify} messages.
             * @param message MethodOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MethodOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MethodOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodOptions;

            /**
             * Decodes a MethodOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MethodOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodOptions;

            /**
             * Verifies a MethodOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MethodOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MethodOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodOptions;

            /**
             * Creates a plain object from a MethodOptions message. Also converts values to other types if specified.
             * @param message MethodOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MethodOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for MethodOptions
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace MethodOptions {

            /** IdempotencyLevel enum. */
            enum IdempotencyLevel {
                IDEMPOTENCY_UNKNOWN = 0,
                NO_SIDE_EFFECTS = 1,
                IDEMPOTENT = 2
            }
        }

        /** Properties of an UninterpretedOption. */
        interface IUninterpretedOption {

            /** UninterpretedOption name */
            name?: (google.protobuf.UninterpretedOption.INamePart[]|null);

            /** UninterpretedOption identifierValue */
            identifierValue?: (string|null);

            /** UninterpretedOption positiveIntValue */
            positiveIntValue?: (number|Long|string|null);

            /** UninterpretedOption negativeIntValue */
            negativeIntValue?: (number|Long|string|null);

            /** UninterpretedOption doubleValue */
            doubleValue?: (number|null);

            /** UninterpretedOption stringValue */
            stringValue?: (Uint8Array|string|null);

            /** UninterpretedOption aggregateValue */
            aggregateValue?: (string|null);
        }

        /** Represents an UninterpretedOption. */
        class UninterpretedOption implements IUninterpretedOption {

            /**
             * Constructs a new UninterpretedOption.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IUninterpretedOption);

            /** UninterpretedOption name. */
            public name: google.protobuf.UninterpretedOption.INamePart[];

            /** UninterpretedOption identifierValue. */
            public identifierValue: string;

            /** UninterpretedOption positiveIntValue. */
            public positiveIntValue: (number|Long|string);

            /** UninterpretedOption negativeIntValue. */
            public negativeIntValue: (number|Long|string);

            /** UninterpretedOption doubleValue. */
            public doubleValue: number;

            /** UninterpretedOption stringValue. */
            public stringValue: (Uint8Array|string);

            /** UninterpretedOption aggregateValue. */
            public aggregateValue: string;

            /**
             * Creates a new UninterpretedOption instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UninterpretedOption instance
             */
            public static create(properties?: google.protobuf.IUninterpretedOption): google.protobuf.UninterpretedOption;

            /**
             * Encodes the specified UninterpretedOption message. Does not implicitly {@link google.protobuf.UninterpretedOption.verify|verify} messages.
             * @param message UninterpretedOption message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UninterpretedOption message, length delimited. Does not implicitly {@link google.protobuf.UninterpretedOption.verify|verify} messages.
             * @param message UninterpretedOption message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UninterpretedOption message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UninterpretedOption
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption;

            /**
             * Decodes an UninterpretedOption message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UninterpretedOption
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption;

            /**
             * Verifies an UninterpretedOption message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UninterpretedOption message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UninterpretedOption
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption;

            /**
             * Creates a plain object from an UninterpretedOption message. Also converts values to other types if specified.
             * @param message UninterpretedOption
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.UninterpretedOption, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UninterpretedOption to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for UninterpretedOption
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace UninterpretedOption {

            /** Properties of a NamePart. */
            interface INamePart {

                /** NamePart namePart */
                namePart: string;

                /** NamePart isExtension */
                isExtension: boolean;
            }

            /** Represents a NamePart. */
            class NamePart implements INamePart {

                /**
                 * Constructs a new NamePart.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.UninterpretedOption.INamePart);

                /** NamePart namePart. */
                public namePart: string;

                /** NamePart isExtension. */
                public isExtension: boolean;

                /**
                 * Creates a new NamePart instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns NamePart instance
                 */
                public static create(properties?: google.protobuf.UninterpretedOption.INamePart): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Encodes the specified NamePart message. Does not implicitly {@link google.protobuf.UninterpretedOption.NamePart.verify|verify} messages.
                 * @param message NamePart message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified NamePart message, length delimited. Does not implicitly {@link google.protobuf.UninterpretedOption.NamePart.verify|verify} messages.
                 * @param message NamePart message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a NamePart message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns NamePart
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Decodes a NamePart message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns NamePart
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Verifies a NamePart message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a NamePart message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns NamePart
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Creates a plain object from a NamePart message. Also converts values to other types if specified.
                 * @param message NamePart
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.UninterpretedOption.NamePart, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this NamePart to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for NamePart
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        /** Properties of a SourceCodeInfo. */
        interface ISourceCodeInfo {

            /** SourceCodeInfo location */
            location?: (google.protobuf.SourceCodeInfo.ILocation[]|null);
        }

        /** Represents a SourceCodeInfo. */
        class SourceCodeInfo implements ISourceCodeInfo {

            /**
             * Constructs a new SourceCodeInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ISourceCodeInfo);

            /** SourceCodeInfo location. */
            public location: google.protobuf.SourceCodeInfo.ILocation[];

            /**
             * Creates a new SourceCodeInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SourceCodeInfo instance
             */
            public static create(properties?: google.protobuf.ISourceCodeInfo): google.protobuf.SourceCodeInfo;

            /**
             * Encodes the specified SourceCodeInfo message. Does not implicitly {@link google.protobuf.SourceCodeInfo.verify|verify} messages.
             * @param message SourceCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SourceCodeInfo message, length delimited. Does not implicitly {@link google.protobuf.SourceCodeInfo.verify|verify} messages.
             * @param message SourceCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SourceCodeInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SourceCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo;

            /**
             * Decodes a SourceCodeInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SourceCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo;

            /**
             * Verifies a SourceCodeInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SourceCodeInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SourceCodeInfo
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo;

            /**
             * Creates a plain object from a SourceCodeInfo message. Also converts values to other types if specified.
             * @param message SourceCodeInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.SourceCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SourceCodeInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for SourceCodeInfo
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace SourceCodeInfo {

            /** Properties of a Location. */
            interface ILocation {

                /** Location path */
                path?: (number[]|null);

                /** Location span */
                span?: (number[]|null);

                /** Location leadingComments */
                leadingComments?: (string|null);

                /** Location trailingComments */
                trailingComments?: (string|null);

                /** Location leadingDetachedComments */
                leadingDetachedComments?: (string[]|null);
            }

            /** Represents a Location. */
            class Location implements ILocation {

                /**
                 * Constructs a new Location.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.SourceCodeInfo.ILocation);

                /** Location path. */
                public path: number[];

                /** Location span. */
                public span: number[];

                /** Location leadingComments. */
                public leadingComments: string;

                /** Location trailingComments. */
                public trailingComments: string;

                /** Location leadingDetachedComments. */
                public leadingDetachedComments: string[];

                /**
                 * Creates a new Location instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Location instance
                 */
                public static create(properties?: google.protobuf.SourceCodeInfo.ILocation): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Encodes the specified Location message. Does not implicitly {@link google.protobuf.SourceCodeInfo.Location.verify|verify} messages.
                 * @param message Location message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Location message, length delimited. Does not implicitly {@link google.protobuf.SourceCodeInfo.Location.verify|verify} messages.
                 * @param message Location message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Location message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Location
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Decodes a Location message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Location
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Verifies a Location message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Location message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Location
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Creates a plain object from a Location message. Also converts values to other types if specified.
                 * @param message Location
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.SourceCodeInfo.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Location to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Location
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }
        }

        /** Properties of a GeneratedCodeInfo. */
        interface IGeneratedCodeInfo {

            /** GeneratedCodeInfo annotation */
            annotation?: (google.protobuf.GeneratedCodeInfo.IAnnotation[]|null);
        }

        /** Represents a GeneratedCodeInfo. */
        class GeneratedCodeInfo implements IGeneratedCodeInfo {

            /**
             * Constructs a new GeneratedCodeInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IGeneratedCodeInfo);

            /** GeneratedCodeInfo annotation. */
            public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[];

            /**
             * Creates a new GeneratedCodeInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GeneratedCodeInfo instance
             */
            public static create(properties?: google.protobuf.IGeneratedCodeInfo): google.protobuf.GeneratedCodeInfo;

            /**
             * Encodes the specified GeneratedCodeInfo message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.verify|verify} messages.
             * @param message GeneratedCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GeneratedCodeInfo message, length delimited. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.verify|verify} messages.
             * @param message GeneratedCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GeneratedCodeInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GeneratedCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo;

            /**
             * Decodes a GeneratedCodeInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GeneratedCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo;

            /**
             * Verifies a GeneratedCodeInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GeneratedCodeInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GeneratedCodeInfo
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo;

            /**
             * Creates a plain object from a GeneratedCodeInfo message. Also converts values to other types if specified.
             * @param message GeneratedCodeInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.GeneratedCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GeneratedCodeInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GeneratedCodeInfo
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        namespace GeneratedCodeInfo {

            /** Properties of an Annotation. */
            interface IAnnotation {

                /** Annotation path */
                path?: (number[]|null);

                /** Annotation sourceFile */
                sourceFile?: (string|null);

                /** Annotation begin */
                begin?: (number|null);

                /** Annotation end */
                end?: (number|null);

                /** Annotation semantic */
                semantic?: (google.protobuf.GeneratedCodeInfo.Annotation.Semantic|keyof typeof google.protobuf.GeneratedCodeInfo.Annotation.Semantic|null);
            }

            /** Represents an Annotation. */
            class Annotation implements IAnnotation {

                /**
                 * Constructs a new Annotation.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation);

                /** Annotation path. */
                public path: number[];

                /** Annotation sourceFile. */
                public sourceFile: string;

                /** Annotation begin. */
                public begin: number;

                /** Annotation end. */
                public end: number;

                /** Annotation semantic. */
                public semantic: (google.protobuf.GeneratedCodeInfo.Annotation.Semantic|keyof typeof google.protobuf.GeneratedCodeInfo.Annotation.Semantic);

                /**
                 * Creates a new Annotation instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Annotation instance
                 */
                public static create(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Encodes the specified Annotation message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.Annotation.verify|verify} messages.
                 * @param message Annotation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Annotation message, length delimited. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.Annotation.verify|verify} messages.
                 * @param message Annotation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Annotation message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Annotation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Decodes an Annotation message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Annotation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Verifies an Annotation message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Annotation message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Annotation
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Creates a plain object from an Annotation message. Also converts values to other types if specified.
                 * @param message Annotation
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.GeneratedCodeInfo.Annotation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Annotation to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };

                /**
                 * Gets the default type url for Annotation
                 * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
                 * @returns The default type url
                 */
                public static getTypeUrl(typeUrlPrefix?: string): string;
            }

            namespace Annotation {

                /** Semantic enum. */
                enum Semantic {
                    NONE = 0,
                    SET = 1,
                    ALIAS = 2
                }
            }
        }

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|Long|string|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: (number|Long|string);

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Timestamp
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Any. */
        interface IAny {

            /** Any type_url */
            type_url?: (string|null);

            /** Any value */
            value?: (Uint8Array|string|null);
        }

        /** Represents an Any. */
        class Any implements IAny {

            /**
             * Constructs a new Any.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IAny);

            /** Any type_url. */
            public type_url: string;

            /** Any value. */
            public value: (Uint8Array|string);

            /**
             * Creates a new Any instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Any instance
             */
            public static create(properties?: google.protobuf.IAny): google.protobuf.Any;

            /**
             * Encodes the specified Any message. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Any message, length delimited. Does not implicitly {@link google.protobuf.Any.verify|verify} messages.
             * @param message Any message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IAny, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Any message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Any;

            /**
             * Decodes an Any message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Any
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Any;

            /**
             * Verifies an Any message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Any message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Any
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Any;

            /**
             * Creates a plain object from an Any message. Also converts values to other types if specified.
             * @param message Any
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Any, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Any to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Any
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a Duration. */
        interface IDuration {

            /** Duration seconds */
            seconds?: (number|Long|string|null);

            /** Duration nanos */
            nanos?: (number|null);
        }

        /** Represents a Duration. */
        class Duration implements IDuration {

            /**
             * Constructs a new Duration.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDuration);

            /** Duration seconds. */
            public seconds: (number|Long|string);

            /** Duration nanos. */
            public nanos: number;

            /**
             * Creates a new Duration instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Duration instance
             */
            public static create(properties?: google.protobuf.IDuration): google.protobuf.Duration;

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Duration message, length delimited. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Duration;

            /**
             * Decodes a Duration message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Duration;

            /**
             * Verifies a Duration message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Duration
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Duration;

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @param message Duration
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Duration, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Duration to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Duration
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an Empty. */
        interface IEmpty {
        }

        /** Represents an Empty. */
        class Empty implements IEmpty {

            /**
             * Constructs a new Empty.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEmpty);

            /**
             * Creates a new Empty instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Empty instance
             */
            public static create(properties?: google.protobuf.IEmpty): google.protobuf.Empty;

            /**
             * Encodes the specified Empty message. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @param message Empty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Empty message, length delimited. Does not implicitly {@link google.protobuf.Empty.verify|verify} messages.
             * @param message Empty message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEmpty, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Empty message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Empty;

            /**
             * Decodes an Empty message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Empty
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Empty;

            /**
             * Verifies an Empty message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Empty message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Empty
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Empty;

            /**
             * Creates a plain object from an Empty message. Also converts values to other types if specified.
             * @param message Empty
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Empty, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Empty to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Empty
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a FieldMask. */
        interface IFieldMask {

            /** FieldMask paths */
            paths?: (string[]|null);
        }

        /** Represents a FieldMask. */
        class FieldMask implements IFieldMask {

            /**
             * Constructs a new FieldMask.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFieldMask);

            /** FieldMask paths. */
            public paths: string[];

            /**
             * Creates a new FieldMask instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FieldMask instance
             */
            public static create(properties?: google.protobuf.IFieldMask): google.protobuf.FieldMask;

            /**
             * Encodes the specified FieldMask message. Does not implicitly {@link google.protobuf.FieldMask.verify|verify} messages.
             * @param message FieldMask message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFieldMask, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldMask message, length delimited. Does not implicitly {@link google.protobuf.FieldMask.verify|verify} messages.
             * @param message FieldMask message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFieldMask, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldMask message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldMask
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldMask;

            /**
             * Decodes a FieldMask message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldMask
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldMask;

            /**
             * Verifies a FieldMask message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldMask message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldMask
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldMask;

            /**
             * Creates a plain object from a FieldMask message. Also converts values to other types if specified.
             * @param message FieldMask
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FieldMask, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldMask to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for FieldMask
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace longrunning. */
    namespace longrunning {

        /** Represents an Operations */
        class Operations extends $protobuf.rpc.Service {

            /**
             * Constructs a new Operations service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new Operations service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): Operations;

            /**
             * Calls ListOperations.
             * @param request ListOperationsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ListOperationsResponse
             */
            public listOperations(request: google.longrunning.IListOperationsRequest, callback: google.longrunning.Operations.ListOperationsCallback): void;

            /**
             * Calls ListOperations.
             * @param request ListOperationsRequest message or plain object
             * @returns Promise
             */
            public listOperations(request: google.longrunning.IListOperationsRequest): Promise<google.longrunning.ListOperationsResponse>;

            /**
             * Calls GetOperation.
             * @param request GetOperationRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and Operation
             */
            public getOperation(request: google.longrunning.IGetOperationRequest, callback: google.longrunning.Operations.GetOperationCallback): void;

            /**
             * Calls GetOperation.
             * @param request GetOperationRequest message or plain object
             * @returns Promise
             */
            public getOperation(request: google.longrunning.IGetOperationRequest): Promise<google.longrunning.Operation>;

            /**
             * Calls DeleteOperation.
             * @param request DeleteOperationRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and Empty
             */
            public deleteOperation(request: google.longrunning.IDeleteOperationRequest, callback: google.longrunning.Operations.DeleteOperationCallback): void;

            /**
             * Calls DeleteOperation.
             * @param request DeleteOperationRequest message or plain object
             * @returns Promise
             */
            public deleteOperation(request: google.longrunning.IDeleteOperationRequest): Promise<google.protobuf.Empty>;

            /**
             * Calls CancelOperation.
             * @param request CancelOperationRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and Empty
             */
            public cancelOperation(request: google.longrunning.ICancelOperationRequest, callback: google.longrunning.Operations.CancelOperationCallback): void;

            /**
             * Calls CancelOperation.
             * @param request CancelOperationRequest message or plain object
             * @returns Promise
             */
            public cancelOperation(request: google.longrunning.ICancelOperationRequest): Promise<google.protobuf.Empty>;

            /**
             * Calls WaitOperation.
             * @param request WaitOperationRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and Operation
             */
            public waitOperation(request: google.longrunning.IWaitOperationRequest, callback: google.longrunning.Operations.WaitOperationCallback): void;

            /**
             * Calls WaitOperation.
             * @param request WaitOperationRequest message or plain object
             * @returns Promise
             */
            public waitOperation(request: google.longrunning.IWaitOperationRequest): Promise<google.longrunning.Operation>;
        }

        namespace Operations {

            /**
             * Callback as used by {@link google.longrunning.Operations|listOperations}.
             * @param error Error, if any
             * @param [response] ListOperationsResponse
             */
            type ListOperationsCallback = (error: (Error|null), response?: google.longrunning.ListOperationsResponse) => void;

            /**
             * Callback as used by {@link google.longrunning.Operations|getOperation}.
             * @param error Error, if any
             * @param [response] Operation
             */
            type GetOperationCallback = (error: (Error|null), response?: google.longrunning.Operation) => void;

            /**
             * Callback as used by {@link google.longrunning.Operations|deleteOperation}.
             * @param error Error, if any
             * @param [response] Empty
             */
            type DeleteOperationCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

            /**
             * Callback as used by {@link google.longrunning.Operations|cancelOperation}.
             * @param error Error, if any
             * @param [response] Empty
             */
            type CancelOperationCallback = (error: (Error|null), response?: google.protobuf.Empty) => void;

            /**
             * Callback as used by {@link google.longrunning.Operations|waitOperation}.
             * @param error Error, if any
             * @param [response] Operation
             */
            type WaitOperationCallback = (error: (Error|null), response?: google.longrunning.Operation) => void;
        }

        /** Properties of an Operation. */
        interface IOperation {

            /** Operation name */
            name?: (string|null);

            /** Operation metadata */
            metadata?: (google.protobuf.IAny|null);

            /** Operation done */
            done?: (boolean|null);

            /** Operation error */
            error?: (google.rpc.IStatus|null);

            /** Operation response */
            response?: (google.protobuf.IAny|null);
        }

        /** Represents an Operation. */
        class Operation implements IOperation {

            /**
             * Constructs a new Operation.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.IOperation);

            /** Operation name. */
            public name: string;

            /** Operation metadata. */
            public metadata?: (google.protobuf.IAny|null);

            /** Operation done. */
            public done: boolean;

            /** Operation error. */
            public error?: (google.rpc.IStatus|null);

            /** Operation response. */
            public response?: (google.protobuf.IAny|null);

            /** Operation result. */
            public result?: ("error"|"response");

            /**
             * Creates a new Operation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Operation instance
             */
            public static create(properties?: google.longrunning.IOperation): google.longrunning.Operation;

            /**
             * Encodes the specified Operation message. Does not implicitly {@link google.longrunning.Operation.verify|verify} messages.
             * @param message Operation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.IOperation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Operation message, length delimited. Does not implicitly {@link google.longrunning.Operation.verify|verify} messages.
             * @param message Operation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.IOperation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Operation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Operation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.Operation;

            /**
             * Decodes an Operation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Operation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.Operation;

            /**
             * Verifies an Operation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Operation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Operation
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.Operation;

            /**
             * Creates a plain object from an Operation message. Also converts values to other types if specified.
             * @param message Operation
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.Operation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Operation to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Operation
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a GetOperationRequest. */
        interface IGetOperationRequest {

            /** GetOperationRequest name */
            name?: (string|null);
        }

        /** Represents a GetOperationRequest. */
        class GetOperationRequest implements IGetOperationRequest {

            /**
             * Constructs a new GetOperationRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.IGetOperationRequest);

            /** GetOperationRequest name. */
            public name: string;

            /**
             * Creates a new GetOperationRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GetOperationRequest instance
             */
            public static create(properties?: google.longrunning.IGetOperationRequest): google.longrunning.GetOperationRequest;

            /**
             * Encodes the specified GetOperationRequest message. Does not implicitly {@link google.longrunning.GetOperationRequest.verify|verify} messages.
             * @param message GetOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.IGetOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GetOperationRequest message, length delimited. Does not implicitly {@link google.longrunning.GetOperationRequest.verify|verify} messages.
             * @param message GetOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.IGetOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GetOperationRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GetOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.GetOperationRequest;

            /**
             * Decodes a GetOperationRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GetOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.GetOperationRequest;

            /**
             * Verifies a GetOperationRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GetOperationRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GetOperationRequest
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.GetOperationRequest;

            /**
             * Creates a plain object from a GetOperationRequest message. Also converts values to other types if specified.
             * @param message GetOperationRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.GetOperationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GetOperationRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for GetOperationRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListOperationsRequest. */
        interface IListOperationsRequest {

            /** ListOperationsRequest name */
            name?: (string|null);

            /** ListOperationsRequest filter */
            filter?: (string|null);

            /** ListOperationsRequest pageSize */
            pageSize?: (number|null);

            /** ListOperationsRequest pageToken */
            pageToken?: (string|null);
        }

        /** Represents a ListOperationsRequest. */
        class ListOperationsRequest implements IListOperationsRequest {

            /**
             * Constructs a new ListOperationsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.IListOperationsRequest);

            /** ListOperationsRequest name. */
            public name: string;

            /** ListOperationsRequest filter. */
            public filter: string;

            /** ListOperationsRequest pageSize. */
            public pageSize: number;

            /** ListOperationsRequest pageToken. */
            public pageToken: string;

            /**
             * Creates a new ListOperationsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListOperationsRequest instance
             */
            public static create(properties?: google.longrunning.IListOperationsRequest): google.longrunning.ListOperationsRequest;

            /**
             * Encodes the specified ListOperationsRequest message. Does not implicitly {@link google.longrunning.ListOperationsRequest.verify|verify} messages.
             * @param message ListOperationsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.IListOperationsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListOperationsRequest message, length delimited. Does not implicitly {@link google.longrunning.ListOperationsRequest.verify|verify} messages.
             * @param message ListOperationsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.IListOperationsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListOperationsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListOperationsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.ListOperationsRequest;

            /**
             * Decodes a ListOperationsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListOperationsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.ListOperationsRequest;

            /**
             * Verifies a ListOperationsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListOperationsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListOperationsRequest
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.ListOperationsRequest;

            /**
             * Creates a plain object from a ListOperationsRequest message. Also converts values to other types if specified.
             * @param message ListOperationsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.ListOperationsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListOperationsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListOperationsRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a ListOperationsResponse. */
        interface IListOperationsResponse {

            /** ListOperationsResponse operations */
            operations?: (google.longrunning.IOperation[]|null);

            /** ListOperationsResponse nextPageToken */
            nextPageToken?: (string|null);
        }

        /** Represents a ListOperationsResponse. */
        class ListOperationsResponse implements IListOperationsResponse {

            /**
             * Constructs a new ListOperationsResponse.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.IListOperationsResponse);

            /** ListOperationsResponse operations. */
            public operations: google.longrunning.IOperation[];

            /** ListOperationsResponse nextPageToken. */
            public nextPageToken: string;

            /**
             * Creates a new ListOperationsResponse instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ListOperationsResponse instance
             */
            public static create(properties?: google.longrunning.IListOperationsResponse): google.longrunning.ListOperationsResponse;

            /**
             * Encodes the specified ListOperationsResponse message. Does not implicitly {@link google.longrunning.ListOperationsResponse.verify|verify} messages.
             * @param message ListOperationsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.IListOperationsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ListOperationsResponse message, length delimited. Does not implicitly {@link google.longrunning.ListOperationsResponse.verify|verify} messages.
             * @param message ListOperationsResponse message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.IListOperationsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ListOperationsResponse message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ListOperationsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.ListOperationsResponse;

            /**
             * Decodes a ListOperationsResponse message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ListOperationsResponse
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.ListOperationsResponse;

            /**
             * Verifies a ListOperationsResponse message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ListOperationsResponse message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ListOperationsResponse
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.ListOperationsResponse;

            /**
             * Creates a plain object from a ListOperationsResponse message. Also converts values to other types if specified.
             * @param message ListOperationsResponse
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.ListOperationsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ListOperationsResponse to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for ListOperationsResponse
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a CancelOperationRequest. */
        interface ICancelOperationRequest {

            /** CancelOperationRequest name */
            name?: (string|null);
        }

        /** Represents a CancelOperationRequest. */
        class CancelOperationRequest implements ICancelOperationRequest {

            /**
             * Constructs a new CancelOperationRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.ICancelOperationRequest);

            /** CancelOperationRequest name. */
            public name: string;

            /**
             * Creates a new CancelOperationRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CancelOperationRequest instance
             */
            public static create(properties?: google.longrunning.ICancelOperationRequest): google.longrunning.CancelOperationRequest;

            /**
             * Encodes the specified CancelOperationRequest message. Does not implicitly {@link google.longrunning.CancelOperationRequest.verify|verify} messages.
             * @param message CancelOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.ICancelOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CancelOperationRequest message, length delimited. Does not implicitly {@link google.longrunning.CancelOperationRequest.verify|verify} messages.
             * @param message CancelOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.ICancelOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CancelOperationRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CancelOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.CancelOperationRequest;

            /**
             * Decodes a CancelOperationRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CancelOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.CancelOperationRequest;

            /**
             * Verifies a CancelOperationRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CancelOperationRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CancelOperationRequest
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.CancelOperationRequest;

            /**
             * Creates a plain object from a CancelOperationRequest message. Also converts values to other types if specified.
             * @param message CancelOperationRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.CancelOperationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CancelOperationRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for CancelOperationRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a DeleteOperationRequest. */
        interface IDeleteOperationRequest {

            /** DeleteOperationRequest name */
            name?: (string|null);
        }

        /** Represents a DeleteOperationRequest. */
        class DeleteOperationRequest implements IDeleteOperationRequest {

            /**
             * Constructs a new DeleteOperationRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.IDeleteOperationRequest);

            /** DeleteOperationRequest name. */
            public name: string;

            /**
             * Creates a new DeleteOperationRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DeleteOperationRequest instance
             */
            public static create(properties?: google.longrunning.IDeleteOperationRequest): google.longrunning.DeleteOperationRequest;

            /**
             * Encodes the specified DeleteOperationRequest message. Does not implicitly {@link google.longrunning.DeleteOperationRequest.verify|verify} messages.
             * @param message DeleteOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.IDeleteOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DeleteOperationRequest message, length delimited. Does not implicitly {@link google.longrunning.DeleteOperationRequest.verify|verify} messages.
             * @param message DeleteOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.IDeleteOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DeleteOperationRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DeleteOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.DeleteOperationRequest;

            /**
             * Decodes a DeleteOperationRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DeleteOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.DeleteOperationRequest;

            /**
             * Verifies a DeleteOperationRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DeleteOperationRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DeleteOperationRequest
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.DeleteOperationRequest;

            /**
             * Creates a plain object from a DeleteOperationRequest message. Also converts values to other types if specified.
             * @param message DeleteOperationRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.DeleteOperationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DeleteOperationRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for DeleteOperationRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of a WaitOperationRequest. */
        interface IWaitOperationRequest {

            /** WaitOperationRequest name */
            name?: (string|null);

            /** WaitOperationRequest timeout */
            timeout?: (google.protobuf.IDuration|null);
        }

        /** Represents a WaitOperationRequest. */
        class WaitOperationRequest implements IWaitOperationRequest {

            /**
             * Constructs a new WaitOperationRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.IWaitOperationRequest);

            /** WaitOperationRequest name. */
            public name: string;

            /** WaitOperationRequest timeout. */
            public timeout?: (google.protobuf.IDuration|null);

            /**
             * Creates a new WaitOperationRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns WaitOperationRequest instance
             */
            public static create(properties?: google.longrunning.IWaitOperationRequest): google.longrunning.WaitOperationRequest;

            /**
             * Encodes the specified WaitOperationRequest message. Does not implicitly {@link google.longrunning.WaitOperationRequest.verify|verify} messages.
             * @param message WaitOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.IWaitOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified WaitOperationRequest message, length delimited. Does not implicitly {@link google.longrunning.WaitOperationRequest.verify|verify} messages.
             * @param message WaitOperationRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.IWaitOperationRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a WaitOperationRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns WaitOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.WaitOperationRequest;

            /**
             * Decodes a WaitOperationRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns WaitOperationRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.WaitOperationRequest;

            /**
             * Verifies a WaitOperationRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a WaitOperationRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns WaitOperationRequest
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.WaitOperationRequest;

            /**
             * Creates a plain object from a WaitOperationRequest message. Also converts values to other types if specified.
             * @param message WaitOperationRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.WaitOperationRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this WaitOperationRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for WaitOperationRequest
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }

        /** Properties of an OperationInfo. */
        interface IOperationInfo {

            /** OperationInfo responseType */
            responseType?: (string|null);

            /** OperationInfo metadataType */
            metadataType?: (string|null);
        }

        /** Represents an OperationInfo. */
        class OperationInfo implements IOperationInfo {

            /**
             * Constructs a new OperationInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.longrunning.IOperationInfo);

            /** OperationInfo responseType. */
            public responseType: string;

            /** OperationInfo metadataType. */
            public metadataType: string;

            /**
             * Creates a new OperationInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OperationInfo instance
             */
            public static create(properties?: google.longrunning.IOperationInfo): google.longrunning.OperationInfo;

            /**
             * Encodes the specified OperationInfo message. Does not implicitly {@link google.longrunning.OperationInfo.verify|verify} messages.
             * @param message OperationInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.longrunning.IOperationInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OperationInfo message, length delimited. Does not implicitly {@link google.longrunning.OperationInfo.verify|verify} messages.
             * @param message OperationInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.longrunning.IOperationInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OperationInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OperationInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.longrunning.OperationInfo;

            /**
             * Decodes an OperationInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OperationInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.longrunning.OperationInfo;

            /**
             * Verifies an OperationInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OperationInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OperationInfo
             */
            public static fromObject(object: { [k: string]: any }): google.longrunning.OperationInfo;

            /**
             * Creates a plain object from an OperationInfo message. Also converts values to other types if specified.
             * @param message OperationInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.longrunning.OperationInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OperationInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for OperationInfo
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace rpc. */
    namespace rpc {

        /** Properties of a Status. */
        interface IStatus {

            /** Status code */
            code?: (number|null);

            /** Status message */
            message?: (string|null);

            /** Status details */
            details?: (google.protobuf.IAny[]|null);
        }

        /** Represents a Status. */
        class Status implements IStatus {

            /**
             * Constructs a new Status.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.rpc.IStatus);

            /** Status code. */
            public code: number;

            /** Status message. */
            public message: string;

            /** Status details. */
            public details: google.protobuf.IAny[];

            /**
             * Creates a new Status instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Status instance
             */
            public static create(properties?: google.rpc.IStatus): google.rpc.Status;

            /**
             * Encodes the specified Status message. Does not implicitly {@link google.rpc.Status.verify|verify} messages.
             * @param message Status message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.rpc.IStatus, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Status message, length delimited. Does not implicitly {@link google.rpc.Status.verify|verify} messages.
             * @param message Status message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.rpc.IStatus, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Status message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Status
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.rpc.Status;

            /**
             * Decodes a Status message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Status
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.rpc.Status;

            /**
             * Verifies a Status message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Status message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Status
             */
            public static fromObject(object: { [k: string]: any }): google.rpc.Status;

            /**
             * Creates a plain object from a Status message. Also converts values to other types if specified.
             * @param message Status
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.rpc.Status, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Status to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for Status
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }

    /** Namespace type. */
    namespace type {

        /** Properties of a LatLng. */
        interface ILatLng {

            /** LatLng latitude */
            latitude?: (number|null);

            /** LatLng longitude */
            longitude?: (number|null);
        }

        /** Represents a LatLng. */
        class LatLng implements ILatLng {

            /**
             * Constructs a new LatLng.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.type.ILatLng);

            /** LatLng latitude. */
            public latitude: number;

            /** LatLng longitude. */
            public longitude: number;

            /**
             * Creates a new LatLng instance using the specified properties.
             * @param [properties] Properties to set
             * @returns LatLng instance
             */
            public static create(properties?: google.type.ILatLng): google.type.LatLng;

            /**
             * Encodes the specified LatLng message. Does not implicitly {@link google.type.LatLng.verify|verify} messages.
             * @param message LatLng message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.type.ILatLng, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified LatLng message, length delimited. Does not implicitly {@link google.type.LatLng.verify|verify} messages.
             * @param message LatLng message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.type.ILatLng, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a LatLng message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns LatLng
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.type.LatLng;

            /**
             * Decodes a LatLng message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns LatLng
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.type.LatLng;

            /**
             * Verifies a LatLng message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a LatLng message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns LatLng
             */
            public static fromObject(object: { [k: string]: any }): google.type.LatLng;

            /**
             * Creates a plain object from a LatLng message. Also converts values to other types if specified.
             * @param message LatLng
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.type.LatLng, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this LatLng to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };

            /**
             * Gets the default type url for LatLng
             * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
             * @returns The default type url
             */
            public static getTypeUrl(typeUrlPrefix?: string): string;
        }
    }
}
