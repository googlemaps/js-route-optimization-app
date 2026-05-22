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

import { Injectable, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class BrowserNotificationService {
  private readonly titleService = inject(Title);

  // State to track if we currently have permission
  readonly permission = signal<NotificationPermission>('default');

  private flashIntervalId: number | null = null;
  private originalTitle = '';

  constructor() {
    if ('Notification' in window) {
      this.permission.set(Notification.permission);
    }
  }

  /**
   * Requests permission from the user.
   */
  async requestPermission(): Promise<void> {
    if (!('Notification' in window)) return;

    if (this.permission() === 'default') {
      const result = await Notification.requestPermission();
      this.permission.set(result);
    }
  }

  /**
   * Sends a system notification if permitted.
   */
  notify(title: string, body: string): void {
    if (this.permission() === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/BotIcon.png',
      });

      notification.onclick = () => {
        window.focus();
        this.stopFlashing();
        notification.close();
      };
    }
  }

  /**
   * Flashes the browser tab title until the user focuses the window.
   */
  startFlashing(notificationMessage: string): void {
    // Don't flash if already focused
    if (!document.hidden) return;

    this.originalTitle = this.titleService.getTitle();
    let isOriginal = true;

    this.stopFlashing();

    this.flashIntervalId = window.setInterval(() => {
      const newTitle = isOriginal ? notificationMessage : this.originalTitle;
      this.titleService.setTitle(newTitle);
      isOriginal = !isOriginal;
    }, 1000);

    window.addEventListener('focus', this.onWindowFocus, { once: true });
  }

  public stopFlashing(): void {
    if (this.flashIntervalId) {
      clearInterval(this.flashIntervalId);
      this.flashIntervalId = null;
      this.titleService.setTitle(this.originalTitle);
    }
  }

  private onWindowFocus = (): void => {
    this.stopFlashing();
  };
}
