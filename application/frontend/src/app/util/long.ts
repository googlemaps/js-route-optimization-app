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

export function maxLong(a?: Long, b?: Long): Long {
  if (a == null) {
    return b;
  }
  if (b == null) {
    return a;
  }
  return a.greaterThan(b) ? a : b;
}

export function minLong(a?: Long, b?: Long): Long {
  if (a == null) {
    return b;
  }
  if (b == null) {
    return a;
  }
  return a.lessThan(b) ? a : b;
}
