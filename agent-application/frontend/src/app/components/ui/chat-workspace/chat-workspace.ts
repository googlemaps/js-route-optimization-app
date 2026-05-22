import { Component, inject } from '@angular/core';
import { ChatWindowComponent } from '../chat-window/chat-window';
import { ChatbotStatus, ChatStore } from '../../../services/data-access/chat-store';
import { AngularSplitModule } from 'angular-split';
import { Map } from '../map/map';

@Component({
  selector: 'app-chat-workspace',
  imports: [ChatWindowComponent, AngularSplitModule, Map],
  templateUrl: './chat-workspace.html',
  styleUrl: './chat-workspace.scss',
})
export class ChatWorkspace {
  protected chatStore = inject(ChatStore);
  ChatbotStatus = ChatbotStatus;

  constructor() {
    this.chatStore.setStatus(ChatbotStatus.IDLE);
  }
}
