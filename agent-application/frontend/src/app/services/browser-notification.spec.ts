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

import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { BrowserNotificationService } from './browser-notification';

interface MockNotificationInstance {
  title: string;
  options?: NotificationOptions;
  close: MockInstance;
  onclick: ((event: Event) => void) | null;
}

// Capture instance created by "new Notification()"
let notificationInstances: MockNotificationInstance[] = [];

class MockNotification implements MockNotificationInstance {
  static permission: NotificationPermission = 'default';
  static requestPermission = vi.fn();

  // Initialize as null to match the interface
  onclick: ((event: Event) => void) | null = null;
  close = vi.fn();

  constructor(
    public title: string,
    public options?: NotificationOptions
  ) {
    notificationInstances.push(this);
  }
}

describe('BrowserNotificationService', () => {
  let service: BrowserNotificationService;
  let titleServiceSpy: { getTitle: MockInstance; setTitle: MockInstance };

  function setupService(permission: NotificationPermission = 'default') {
    MockNotification.permission = permission;
    return TestBed.inject(BrowserNotificationService);
  }

  beforeEach(() => {
    vi.useFakeTimers();
    notificationInstances = [];

    MockNotification.permission = 'default';
    MockNotification.requestPermission.mockReset();

    vi.stubGlobal('Notification', MockNotification);

    vi.spyOn(window, 'focus').mockImplementation(() => undefined);

    titleServiceSpy = {
      getTitle: vi.fn().mockReturnValue('Original App Title'),
      setTitle: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [BrowserNotificationService, { provide: Title, useValue: titleServiceSpy }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  /* Initialization tests */

  it('should initialize permission signal from global Notification.permission', () => {
    // Arrange
    service = setupService('denied');

    // Assert
    expect(service.permission()).toBe('denied');
  });

  /* Request permission tests */

  it('should request permission if current state is default', async () => {
    // Arrange
    MockNotification.requestPermission.mockResolvedValue('granted');

    // Act
    service = setupService('default');

    await service.requestPermission();

    // Assert
    expect(MockNotification.requestPermission).toHaveBeenCalled();
    expect(service.permission()).toBe('granted');
  });

  it('should NOT request permission if already granted', async () => {
    // Arrange
    service = setupService('granted');

    // Act
    await service.requestPermission();

    // Assert
    expect(MockNotification.requestPermission).not.toHaveBeenCalled();
  });

  /* Notification tests */

  it('should send notification if permission is granted', () => {
    // Arrange
    service = setupService('granted');

    // Act
    service.notify('Test Title', 'Test Body');

    // Assert
    expect(notificationInstances.length).toBe(1);
    expect(notificationInstances[0].title).toBe('Test Title');
    expect(notificationInstances[0]?.options?.body).toBe('Test Body');
  });

  it('should NOT send notification if permission is denied', () => {
    // Arrange
    service = setupService('denied');

    // Act
    service.notify('Should not show', 'Body');

    // Assert
    expect(notificationInstances.length).toBe(0);
  });

  it('should focus window and stop flashing when notification is clicked', () => {
    // Arrange
    service = setupService('granted');
    const stopFlashingSpy = vi.spyOn(service, 'stopFlashing');

    // Act
    service.notify('Click Me', 'Body');
    const notificationInstance = notificationInstances[0];

    if (notificationInstance.onclick) {
      notificationInstance.onclick(new Event('click'));
    } else {
      throw new Error('onclick handler was not assigned');
    }

    // Assert
    expect(window.focus).toHaveBeenCalled();
    expect(notificationInstance.close).toHaveBeenCalled();
    expect(stopFlashingSpy).toHaveBeenCalled();
  });

  /* Flashing title logic tests */

  it('should start flashing title if document is hidden', () => {
    // Arrange
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    service = setupService('granted');

    // Act
    service.startFlashing('New Message!');

    // Assert
    expect(titleServiceSpy.getTitle).toHaveBeenCalled();

    // Act
    vi.advanceTimersByTime(1000);
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('New Message!');

    // Act
    vi.advanceTimersByTime(1000);
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('Original App Title');
  });

  it('should NOT flash if document is visible', () => {
    // Arrange
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    service = TestBed.inject(BrowserNotificationService);

    // Act
    service.startFlashing('New Message!');

    // Assert
    vi.advanceTimersByTime(1000);
    expect(titleServiceSpy.setTitle).not.toHaveBeenCalledWith('New Message!');
  });

  it('should stop flashing on window focus event', () => {
    // Arrange
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);

    service = TestBed.inject(BrowserNotificationService);
    service.startFlashing('Msg');

    vi.advanceTimersByTime(1000);
    expect(titleServiceSpy.setTitle).toHaveBeenCalledWith('Msg');

    // Act
    window.dispatchEvent(new Event('focus'));

    // Assert
    expect(titleServiceSpy.setTitle).toHaveBeenLastCalledWith('Original App Title');

    vi.advanceTimersByTime(1000);
    expect(titleServiceSpy.setTitle).toHaveBeenCalledTimes(2);
  });
});
