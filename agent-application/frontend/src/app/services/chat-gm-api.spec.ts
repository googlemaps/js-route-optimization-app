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

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ChatBotRole, ChatResponse } from '../models/chat';
import { APP_CONFIG } from '../models/tokens';
import { ChatGMApiService } from './chat-gm-api';

describe('ChatGMApiService', () => {
  let service: ChatGMApiService;
  let httpMock: HttpTestingController;

  const mockConfig = { apiUrl: 'https://api.test.com' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatGMApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_CONFIG, useValue: mockConfig },
      ],
    });

    service = TestBed.inject(ChatGMApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST the correct payload and return response', () => {
    // Arrange
    const mockResponse: ChatResponse = {
      message: {
        messageId: '123',
        contextId: 'context-123',
        role: ChatBotRole.AGENT,
        content: [{ text: 'Hello from API' }],
      },
    };

    // Act
    service.sendMessage('Test prompt', 'context-123').subscribe(response => {
      expect(response).toEqual(mockResponse);
      expect(response.message.content[0].text).toBe('Hello from API');
    });

    // Assert
    const request = httpMock.expectOne(`${mockConfig.apiUrl}/message`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      contextId: 'context-123',
      message: 'Test prompt',
    });

    // simulate server replying
    request.flush(mockResponse);
  });

  it('should cancel the HTTP request when abort$ emits', () => {
    // Arrange
    const abortSubject = new Subject<void>();

    // Act
    service.sendMessage('Test prompt', undefined, abortSubject).subscribe({
      next: () => expect.fail('Should have been cancelled'),
      error: () => expect.fail('Should not have errored'),
    });

    // Assert
    const req = httpMock.expectOne(`${mockConfig.apiUrl}/message`);

    // trigger the abort
    abortSubject.next();

    // Assert
    expect(req.cancelled).toBe(true);
  });
});
