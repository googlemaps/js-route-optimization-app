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

import { Observable, throwError, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { StatusCode } from 'grpc-web';

interface RetryOptions {
  maxAttempts?: number;
  duration?: number;
  retryPredicate?: (error: any) => boolean;
}

/**
 * @remarks
 * Based on the "Customizable Retry with Increased Duration" example:
 * {@link https://www.learnrxjs.io/operators/error_handling/retrywhen.html}
 */
export const retryStrategy = ({
  maxAttempts = 2,
  duration = 500,
  retryPredicate = null,
}: RetryOptions = {}) => {
  return (attempts: Observable<any>) => {
    return attempts.pipe(
      mergeMap((error, i) => {
        const retryAttempt = i + 1;
        if (retryAttempt > maxAttempts || (retryPredicate && !retryPredicate(error))) {
          return throwError(error);
        }

        return timer(duration);
      })
    );
  };
};

export const httpRetryPredicate = (): ((error: any) => boolean) => {
  const retryStatuses = [500, 502, 503, 504];
  return (error: any): boolean => {
    return retryStatuses.some((retryStatus) => error.status === retryStatus);
  };
};

/** See {@link https://aip.dev/194} */
export const grpcRetryPredicate = (error: any): boolean => {
  return error.code === StatusCode.UNAVAILABLE;
};

export const httpRetryStrategy = ({
  maxAttempts = 2,
  duration = 500,
  retryPredicate = httpRetryPredicate(),
}: RetryOptions = {}): ((attempts: any) => Observable<number>) =>
  retryStrategy({ maxAttempts, duration, retryPredicate });
