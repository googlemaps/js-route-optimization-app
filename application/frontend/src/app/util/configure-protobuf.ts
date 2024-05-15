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

import * as Long from 'long';
import * as protobuf from 'protobufjs/minimal';
import { ExtendedConversionOptions } from './canonical-protobuf';
import * as patchDispatcher from './patch-dispatcher-protobuf';
import * as patchPrimitive from './patch-primitive-protobuf';

export function configureProtobuf(): void {
  protobuf.util.Long = Long;
  protobuf.util.toJSONOptions = {
    json: true,
    longs: String,
    canonical: false,
  } as ExtendedConversionOptions;
  protobuf.configure();
  patchProtobuf();
}

function patchProtobuf(): void {
  for (const patch of Object.values(patchPrimitive).concat(Object.values(patchDispatcher))) {
    patch();
  }
}
