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

import { WritableSignal, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NEVER, Subject, of, takeUntil, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { ChatBotRole, ChatResponse, RefreshResponse } from '../../models/chat';
import { OptimizeToursRequest, OptimizeToursResponse } from '../../models/ro';
import { APP_CONFIG } from '../../models/tokens';
import { BrowserNotificationService } from '../browser-notification';
import { ChatGMApiService } from '../chat-gm-api';
import { ChatStreamService, StreamChunk } from '../chat-stream';
import {
  ChatStore,
  ChatbotStatus,
  LOADING_MESSAGES,
  UPSELL_MESSAGE,
  WELCOME_MESSAGE,
} from './chat-store';

describe('ChatStore', () => {
  let store: InstanceType<typeof ChatStore>;
  let apiService: {
    sendMessage: MockInstance;
    refreshPolylines?: MockInstance;
  } & Partial<ChatGMApiService>;
  let chatStreamService: { streamMessage: MockInstance } & Partial<ChatStreamService>;
  let notificationService: {
    permission: WritableSignal<NotificationPermission>;
    notify: MockInstance;
    startFlashing: MockInstance;
    stopFlashing: MockInstance;
  };

  const mockContextId = 'context-123';
  const mockResponse: ChatResponse = {
    message: {
      messageId: 'messageId-123',
      contextId: mockContextId,
      role: ChatBotRole.AGENT,
      content: [{ text: 'Hello User' }],
    },
  };

  const makeCompleteChunk = (
    messageId: string,
    finalMessage: ChatResponse = mockResponse
  ): StreamChunk => ({
    eventType: 'complete',
    done: true,
    finalMessage,
    contextId: mockContextId,
    messageId,
  });

  beforeEach(() => {
    vi.useFakeTimers();

    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'test-uuid'),
    });

    apiService = {
      sendMessage: vi.fn(),
      refreshPolylines: vi.fn(),
    };

    chatStreamService = {
      streamMessage: vi.fn().mockReturnValue(NEVER),
    };

    notificationService = {
      permission: signal('default'),
      notify: vi.fn(),
      startFlashing: vi.fn(),
      stopFlashing: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ChatStore,
        { provide: APP_CONFIG, useValue: { apiUrl: '/api' } },
        { provide: ChatGMApiService, useValue: apiService },
        { provide: ChatStreamService, useValue: chatStreamService },
        { provide: BrowserNotificationService, useValue: notificationService },
      ],
    });

    store = TestBed.inject(ChatStore);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  /** Initialization Tests */

  it('should initialize with default state', () => {
    expect(store.messages()).toEqual([WELCOME_MESSAGE]);
    expect(store.status()).toEqual(ChatbotStatus.IDLE);
    expect(store.contextId()).toBeUndefined();
    expect(store.optimizeRequest()).toBeUndefined();
  });

  it('should calculate computed signals correctly', () => {
    expect(store.messageCount()).toBe(1);
    expect(store.canSendMessage()).toBe(true);
    expect(store.lastMessage()).toEqual(WELCOME_MESSAGE);
  });

  /** Send Prompts Tests */

  it('should update state and call API when sending prompt', async () => {
    // Arrange
    chatStreamService.streamMessage.mockReturnValue(of(makeCompleteChunk('msg-123')));

    // Act
    const response = store.sendPrompt('Hello');

    // Assert - immediate state updates (before stream resolves)
    expect(store.status()).toBe(ChatbotStatus.IS_TYPING);
    expect(store.messages().length).toBe(3); // welcome + user + bot placeholder
    expect(store.messages()[1].content).toBe('Hello');
    expect(store.messages()[1].isUser).toBe(true);

    await response;

    // Assert - final state
    expect(store.status()).toBe(ChatbotStatus.ACTIVE);
    expect(store.messages().length).toBe(3); // welcome + user + final bot
    expect(store.messages()[2].content).toBe('Hello User');
    expect(store.contextId()).toBe(mockContextId);
  });

  /** Loading Messages Tests */

  it('should show upsell content on bot message if permission is default', async () => {
    // Arrange – stream never completes so the bot message stays in streaming state
    chatStreamService.streamMessage.mockReturnValue(NEVER);
    notificationService.permission.set('default');

    // Act
    store.sendPrompt('Wait for me');

    // Assert – upsell is embedded in bot streaming message, not a separate entry
    expect(store.messages().length).toBe(3); // welcome + user + bot
    const botMessage = store.messages().at(-1);
    expect(botMessage?.upsellContent).toBe(UPSELL_MESSAGE);

    // After 30 s the upsell is auto-dismissed
    vi.advanceTimersByTime(30000);
    expect(store.messages().at(-1)?.upsellContent).toBeUndefined();
  });

  it('should remain IS_TYPING while stream is in progress', () => {
    // Arrange – stream never completes
    chatStreamService.streamMessage.mockReturnValue(NEVER);

    // Act
    store.sendPrompt('Wait');

    // Assert – status stays IS_TYPING until the stream resolves
    expect(store.status()).toBe(ChatbotStatus.IS_TYPING);
  });

  /** RO Request/Response Test */

  it('should parse RO Request/Response JSON from content', async () => {
    // Arrange
    const jsonRequest = JSON.stringify({ visits: [] });
    const roResponse = {
      message: {
        ...mockResponse.message,
        content: [{ text: `Here is data: ${jsonRequest}` }],
      },
    };

    // Act
    chatStreamService.streamMessage.mockReturnValue(
      of(makeCompleteChunk('msg-ro', roResponse as ChatResponse))
    );

    await store.sendPrompt('request');

    // Assert
    expect(store.status()).toBe(ChatbotStatus.ACTIVE);
  });

  /** Error Handling */

  it('should handle API errors gracefully', async () => {
    // Arrange
    const errorMessage = 'error';
    chatStreamService.streamMessage.mockReturnValue(throwError(() => new Error(errorMessage)));

    // Act
    await store.sendPrompt('fail');

    // Assert
    expect(store.status()).toBe(ChatbotStatus.ERROR);
    const lastMessage = store.messages().at(-1);
    expect(lastMessage?.isUser).toBe(false);
    expect(lastMessage?.content).toContain('Error processing request');
    expect(lastMessage?.errorDetails).toContain(errorMessage);
  });

  /** Notifications */

  it('should trigger browser notification if document is hidden when response arrives', async () => {
    // Arrange
    chatStreamService.streamMessage.mockReturnValue(of(makeCompleteChunk('msg-notify')));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

    // Act
    await store.sendPrompt('trigger notification');

    // Assert
    expect(notificationService.notify).toHaveBeenCalledWith(
      'Response Ready',
      'Your request is ready'
    );
    expect(notificationService.startFlashing).toHaveBeenCalledWith('Ready!');
  });

  it('should NOT trigger notification if document is visible', async () => {
    // Arrange
    chatStreamService.streamMessage.mockReturnValue(of(makeCompleteChunk('msg-visible')));
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);

    // Act
    await store.sendPrompt('request');

    // Assert
    expect(notificationService.notify).not.toHaveBeenCalled();
    expect(notificationService.startFlashing).not.toHaveBeenCalled();
  });

  /** Refresh Routes Tests */

  describe('refreshRoutes', () => {
    const mockRoute = { routePolyline: { points: 'oldPolyline' } };
    const mockOptimizeRequest = OptimizeToursRequest.create({ model: {} });
    const mockOptimizeResponse = OptimizeToursResponse.create({ routes: [mockRoute] });
    const mockRefreshResponse: RefreshResponse = {
      routes: [{ routePolyline: { points: 'newPolyline' } }],
    };

    beforeEach(() => {
      store.setRequest(mockOptimizeRequest);
      store.setResponse(mockOptimizeResponse);
    });

    it('should set status to WAITING_FOR_GM immediately', () => {
      apiService.refreshPolylines!.mockReturnValue(NEVER);

      store.refreshRoutes();

      expect(store.status()).toBe(ChatbotStatus.WAITING_FOR_GM);
    });

    it('should show the first loading message immediately via the timer', () => {
      apiService.refreshPolylines!.mockReturnValue(NEVER);

      store.refreshRoutes();

      // timer(0, 30000) schedules via asyncScheduler – advance by 0 to flush it
      vi.advanceTimersByTime(0);
      expect(store.messages().some(m => m.isPlaceholder && m.content === LOADING_MESSAGES[0])).toBe(
        true
      );
    });

    it('should cycle through subsequent loading messages every 30 s', () => {
      apiService.refreshPolylines!.mockReturnValue(NEVER);

      store.refreshRoutes();

      vi.advanceTimersByTime(0);
      expect(store.messages().some(m => m.isPlaceholder && m.content === LOADING_MESSAGES[0])).toBe(
        true
      );

      vi.advanceTimersByTime(30000);
      expect(store.messages().some(m => m.isPlaceholder && m.content === LOADING_MESSAGES[1])).toBe(
        true
      );

      vi.advanceTimersByTime(30000);
      expect(store.messages().some(m => m.isPlaceholder && m.content === LOADING_MESSAGES[2])).toBe(
        true
      );
    });

    it('should update optimizeResponse polylines and set status to ACTIVE on success', async () => {
      apiService.refreshPolylines!.mockReturnValue(of(mockRefreshResponse));

      await store.refreshRoutes();

      expect(store.status()).toBe(ChatbotStatus.ACTIVE);
      expect(store.optimizeResponse()!.routes[0].routePolyline).toEqual({ points: 'newPolyline' });
    });

    it('should remove placeholder message on success', async () => {
      apiService.refreshPolylines!.mockReturnValue(of(mockRefreshResponse));

      await store.refreshRoutes();

      expect(store.messages().every(m => !m.isPlaceholder)).toBe(true);
    });

    it('should trigger browser notification if document is hidden on success', async () => {
      apiService.refreshPolylines!.mockReturnValue(of(mockRefreshResponse));
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

      await store.refreshRoutes();

      expect(notificationService.notify).toHaveBeenCalledWith(
        'Response Ready',
        'Your request is ready'
      );
      expect(notificationService.startFlashing).toHaveBeenCalledWith('Ready!');
    });

    it('should NOT trigger notification if document is visible on success', async () => {
      apiService.refreshPolylines!.mockReturnValue(of(mockRefreshResponse));
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);

      await store.refreshRoutes();

      expect(notificationService.notify).not.toHaveBeenCalled();
      expect(notificationService.startFlashing).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const errorMessage = 'refresh error';
      apiService.refreshPolylines!.mockReturnValue(throwError(() => new Error(errorMessage)));

      await store.refreshRoutes();

      expect(store.status()).toBe(ChatbotStatus.ERROR);
      const lastMessage = store.messages().at(-1);
      expect(lastMessage?.isUser).toBe(false);
      expect(lastMessage?.content).toContain('Error processing request');
      expect(lastMessage?.errorDetails).toContain(errorMessage);
    });

    it('should cancel pending refresh when startNewSession is called', async () => {
      // Use mockImplementation so the mock actually honours the abort$ observable
      const pendingSubject = new Subject<RefreshResponse>();
      apiService.refreshPolylines!.mockImplementation(
        (_model: unknown, _routes: unknown, abort$: Parameters<typeof takeUntil>[0]) =>
          pendingSubject.pipe(takeUntil(abort$))
      );

      const refreshPromise = store.refreshRoutes();
      store.startNewSession(); // fires cancelTrigger$.next() + .complete()

      // firstValueFrom throws EmptyError → caught and returns early
      await refreshPromise;

      expect(store.messages()).toEqual([WELCOME_MESSAGE]);
      expect(store.status()).toBe(ChatbotStatus.IDLE);
    });
  });

  /** Session Management Tests */

  it('should reset state when starting new session', async () => {
    // Arrange
    store.addOrReplaceMessage({ id: '1', content: 'foo', isUser: true, timestamp: new Date() });
    store.setStatus(ChatbotStatus.ACTIVE);

    // Act
    store.startNewSession();

    // Assert
    expect(store.messages()).toEqual([WELCOME_MESSAGE]);
    expect(store.status()).toBe(ChatbotStatus.IDLE);
    expect(notificationService.stopFlashing).toHaveBeenCalled();
  });

  it('should cancel pending request when starting new session', async () => {
    // Arrange – use a Subject so the stream stays open until cancelled
    const pendingSubject = new Subject<StreamChunk>();
    chatStreamService.streamMessage.mockReturnValue(pendingSubject.asObservable());

    // Act
    const sendPromise = store.sendPrompt('request');
    store.startNewSession(); // triggers cancelTrigger$.next() + .complete()

    // Await sendPrompt – it should resolve early after the takeUntil fires
    await sendPromise;

    // startNewSession resets state to initialState
    expect(store.messages()).toEqual([WELCOME_MESSAGE]);
    expect(store.status()).toBe(ChatbotStatus.IDLE);
  });
});
