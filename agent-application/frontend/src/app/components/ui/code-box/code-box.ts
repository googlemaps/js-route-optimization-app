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

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { Highlight } from 'ngx-highlightjs';
import { ClipboardModule } from '@angular/cdk/clipboard';

@Component({
  selector: 'app-code-box',
  templateUrl: './code-box.html',
  styleUrls: ['./code-box.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgOptimizedImage,
    Highlight,
  ],
  host: {
    '[class.fullscreen]': 'isFullscreen()',
  },
})
export class CodeBoxComponent {
  code = input.required<string>();
  messageId = input.required<string>();

  private collapsed = signal(true);
  readonly isCollapsed = computed(() => this.collapsed());
  readonly isFullscreen = signal(false);
  protected copiedMessageId = signal<string | null>(null);

  fullScreenToggled = output<boolean>();

  toggleCollapse(): void {
    this.collapsed.update(prev => !prev);
  }

  toggleFullscreen(): void {
    this.isFullscreen.update(value => !value);

    this.fullScreenToggled.emit(this.isFullscreen());
  }

  /**
   * Copies messageId to local and sets timer to clear it
   * Allows for text message to change on click
   * @param messageId current copied message id
   */
  copyCode(messageId: string): void {
    this.copiedMessageId.set(messageId);

    setTimeout(() => {
      if (this.copiedMessageId() === messageId) {
        this.copiedMessageId.set(null);
      }
    }, 2000);
  }

  /**
   * Gets the displayable code. Truncates to 10 lines with "..."
   * only when collapsed, not fullscreen, and code exceeds the limit.
   */
  readonly visibleCode = computed(() => {
    const isCollapsed = this.isCollapsed();
    const isFullscreen = this.isFullscreen();
    const code = this.code();

    if (!isCollapsed || isFullscreen) {
      return code;
    }

    const lines = code.split('\n');
    const lineLimit = 10;

    if (lines.length > lineLimit) {
      return lines.slice(0, lineLimit).join('\n') + '\n...';
    }

    return code;
  });
}
