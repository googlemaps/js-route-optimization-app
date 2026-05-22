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
