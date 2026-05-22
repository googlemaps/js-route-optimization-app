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

import { Component, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { ChatStore, WELCOME_MESSAGE_ID } from '../../services/data-access/chat-store';
import { HelpDialogService } from '../../services/help-dialog';

@Component({
  selector: 'app-header',
  imports: [MatButtonModule, MatIcon, MatTooltip],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  protected chatStore = inject(ChatStore);
  protected helpService = inject(HelpDialogService);

  messageId = '';
  contextId = '';

  constructor() {
    effect(() => {
      this.contextId = this.chatStore.contextId() || '';

      const lastMessageId = this.chatStore.lastMessage()?.id || '';
      this.messageId = lastMessageId === WELCOME_MESSAGE_ID ? '' : lastMessageId;
    });
  }

  startNewSession() {
    this.chatStore.startNewSession();
  }

  openHelpDocs() {
    this.helpService.openHelpDocs();
  }
}
