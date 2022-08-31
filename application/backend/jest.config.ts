/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

process.env.LOG_LEVEL = 'debug';
process.env.PROJECT_ID = "test-project-id-does-not-exist";
process.env.STORAGE_BUCKET_NAME = 'test-bucket-does-not-exist';

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/*.test.ts'
  ],
  silent: false
};
