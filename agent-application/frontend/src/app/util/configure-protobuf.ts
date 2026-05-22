import Long from 'long';
import * as protobuf from 'protobufjs/minimal';
import { ExtendedConversionOptions } from './canonical-protobuf';
import * as patchDispatcher from './patch-ro-protobuf';
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
