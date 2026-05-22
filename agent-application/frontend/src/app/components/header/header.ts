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
