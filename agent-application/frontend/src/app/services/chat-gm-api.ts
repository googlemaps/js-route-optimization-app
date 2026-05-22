/*
Copyright 2026 Google LLC

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

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Injector } from '@angular/core';
import { NEVER, Observable, takeUntil } from 'rxjs';
import { ChatResponse, RefreshResponse } from '../models/chat';
import { APP_CONFIG } from '../models/tokens';
import { IShipmentModel, IShipmentRoute } from '../models/ro';

@Injectable({ providedIn: 'root' })
export class ChatGMApiService {
  private httpClient = inject(HttpClient);
  private injector = inject(Injector);
  config = this.injector.get(APP_CONFIG);

  /**
   * Sends a user prompt to the ChatGM API and returns the response
   * @param message - User prompt message
   * @param contextId - (Optional) contextId of the chat if available
   * @param abortTrigger$ - (Optional) An Observable that, when it emits, will cancel this request immediately.
   * Defaults to `NEVER` (request will not be cancelled externally).
   * @returns An Observable of the ChatResponse.
   */
  sendMessage(
    message: string,
    contextId?: string,
    abort$: Observable<void> = NEVER
  ): Observable<ChatResponse> {
    return this.httpClient
      .post<ChatResponse>(`${this.config.apiUrl}/message`, {
        contextId,
        message,
      })
      .pipe(takeUntil(abort$));
  }

  /**
   * Sends a polyline refresh request
   * @param model - ShipmentModel to refresh
   * @param routes - Array of ShipmentRoutes to refresh
   * @param abortTrigger$ - (Optional) An Observable that, when it emits, will cancel this request immediately.
   * Defaults to `NEVER` (request will not be cancelled externally).
   * @returns An Observable of the refreshed ShipmentRoutes.
   */
  refreshPolylines(
    model: IShipmentModel,
    routes: IShipmentRoute[],
    abort$: Observable<void> = NEVER
  ): Observable<RefreshResponse> {
    return this.httpClient
      .post<RefreshResponse>(`${this.config.apiUrl}/polylines/refresh`, {
        model,
        routes,
      })
      .pipe(takeUntil(abort$));
  }
}
