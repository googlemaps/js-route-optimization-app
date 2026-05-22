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

import { TextFieldModule } from '@angular/cdk/text-field';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MarkdownComponent } from 'ngx-markdown';
import { BrowserNotificationService } from '../../../services/browser-notification';
import {
  ChatbotStatus,
  ChatMessage,
  ChatStore,
  UPSELL_DENIED_MESSAGE,
  UPSELL_MESSAGE,
} from '../../../services/data-access/chat-store';
import { ContentSegment } from '../../../models/chat';
import { HelpDialogService } from '../../../services/help-dialog';
import { extractCode, isCodeBlock } from '../../../util/json';
import { CodeBoxComponent } from '../code-box/code-box';
import { SuggestionChipsComponent } from '../suggestion-chips/suggestion-chips';
import { CsvParserService } from '../../../util/csvParser';
import { ThinkingLabelQueue } from './thinking-label-queue';
import { TypewriterController } from './typewriter';

interface PendingFile {
  fileName: string;
  rawText: string;
}

const SCROLL_THRESHOLD_PX = 80;

@Component({
  selector: 'app-chat-window',
  imports: [
    MatButtonModule,
    FormsModule,
    MarkdownComponent,
    MatIconModule,
    DatePipe,
    CodeBoxComponent,
    NgOptimizedImage,
    TextFieldModule,
    MatTooltip,
    SuggestionChipsComponent,
  ],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(click)': 'onClick($event)' },
})
export class ChatWindowComponent {
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browserNotificationService = inject(BrowserNotificationService);
  private readonly helpService = inject(HelpDialogService);
  private readonly csvParser = inject(CsvParserService);

  protected readonly chatStore = inject(ChatStore);
  protected readonly userMessage = signal<string>('');
  protected readonly expandedMessageIds = signal<Set<string>>(new Set());
  protected readonly IS_SUGGESTION_CHIP_TURNED_ON = false;
  protected readonly attachedFiles = signal<PendingFile[]>([]);
  protected readonly fileErrors = signal<string[]>([]);

  readonly defaultSuggestions = [
    'How do I use GMP Assist?',
    'What data can I use to create a request?',
  ];

  public readonly ChatbotStatus = ChatbotStatus;
  public readonly UPSELL_MESSAGE = UPSELL_MESSAGE;
  public readonly UPSELL_DENIED_MESSAGE = UPSELL_DENIED_MESSAGE;

  private readonly chatListContainer = viewChild.required<ElementRef>('chatListContainer');
  private userScrolledUp = false;

  /**
   * IDs of messages whose `animationPending` flag was consumed but whose
   * typewriter animation has not yet completed. Keeps `getDisplayedSegments`
   * returning `[]` in the render cycle(s) between the flag being cleared and
   * the first timer tick, preventing a flash of full unstyled content.
   */
  private readonly pendingAnimationIds = signal<Set<string>>(new Set());

  // Delegates that own all animation / queue logic.
  private readonly typewriter = new TypewriterController(
    () => this.scrollToBottomIfNeeded(),
    () => {
      this.userScrolledUp = false;
    }
  );
  private readonly labelQueue = new ThinkingLabelQueue();

  isCodeBlock = isCodeBlock;
  extractCode = extractCode;

  // ---------------------------------------------------------------------------
  // Template helpers
  // ---------------------------------------------------------------------------

  /**
   * Returns the segments the template should render for a given message:
   * - Empty array while streaming (content is buffered until the stream ends).
   * - Incrementally growing animated segments while the typewriter is running.
   * - The complete `contentSegments` from the store once animation finishes.
   *
   * Both `isAnimating()` and `pendingAnimationIds()` are signals, so the
   * template re-renders automatically whenever either changes.
   */
  protected getDisplayedSegments(message: ChatMessage): ContentSegment[] | undefined {
    if (this.typewriter.isAnimating(message.id) || this.pendingAnimationIds().has(message.id)) {
      return this.typewriter.getSegments(message.id);
    }
    if (message.isStreaming) {
      return [];
    }
    return message.contentSegments;
  }

  /** Returns the currently visible thinking-step label for a streaming message. */
  protected getCurrentStepLabel(message: ChatMessage): string {
    return this.labelQueue.getLabel(message.id);
  }

  /**
   * True while the server stream is still open and the typewriter has not yet
   * started animating. Used to show/hide the waiting indicator in the template.
   */
  protected isWaiting(message: ChatMessage): boolean {
    return !!message.isStreaming && !this.typewriter.isAnimating(message.id);
  }

  // ---------------------------------------------------------------------------
  // Scroll helpers
  // ---------------------------------------------------------------------------

  /**
   * Attaches a passive scroll listener to the message list so we can detect
   * when the user manually scrolls up, pausing auto-scroll during animation.
   * Should be called once after the view is first rendered.
   */
  private initScrollListener(): void {
    const el: HTMLElement = this.chatListContainer().nativeElement;
    el.addEventListener(
      'scroll',
      () => {
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        this.userScrolledUp = distFromBottom > SCROLL_THRESHOLD_PX;
      },
      { passive: true }
    );
  }

  /**
   * Scrolls the message list to the bottom on each typewriter tick,
   * unless the user has manually scrolled up to read earlier content.
   */
  private scrollToBottomIfNeeded(): void {
    if (this.userScrolledUp) return;
    const el: HTMLElement = this.chatListContainer().nativeElement;
    el.scrollTop = el.scrollHeight;
  }

  /**
   * Smoothly scrolls the most recent user message into view.
   * Called once when a new message pair is added to the list.
   */
  private scrollToLastUserMessage(): void {
    const container: HTMLElement = this.chatListContainer().nativeElement;
    const userMessages = container.querySelectorAll('.user-message-container');
    const last = userMessages[userMessages.length - 1];
    last?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------------------------------------------------------------------------
  // Lifecycle / effects
  // ---------------------------------------------------------------------------

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.labelQueue.destroy();
    });

    afterNextRender(() => this.initScrollListener(), { injector: this.injector });

    // Detect messages ready for typewriter animation via the store's
    // animationPending flag. The flag is cleared immediately after handing
    // the message to TypewriterController so subsequent messages() emissions
    // (e.g. streaming chunks for the next turn) don't re-trigger animation
    // on already-started or completed messages.
    effect(
      () => {
        const msgs = this.chatStore.messages();
        untracked(() => {
          for (const msg of msgs) {
            if (!msg.animationPending) continue;
            const id = msg.id;
            if (this.pendingAnimationIds().has(id) || this.typewriter.isAnimating(id)) continue;
            if (msg.contentSegments?.length) {
              this.pendingAnimationIds.update(s => new Set(s).add(id));
              this.chatStore.clearAnimationPending(id);
              this.typewriter.start(id, msg.contentSegments, () => {
                this.pendingAnimationIds.update(s => {
                  const n = new Set(s);
                  n.delete(id);
                  return n;
                });
              });
            }
          }
        });
      },
      { injector: this.injector }
    );

    // Push new thinking-step labels into the FIFO queue.
    effect(
      () => {
        const msgs = this.chatStore.messages();
        untracked(() => {
          for (const msg of msgs) {
            if (!msg.isStreaming || !msg.thinkingSteps?.length) continue;
            const last = msg.thinkingSteps[msg.thinkingSteps.length - 1];
            this.labelQueue.push(msg.id, last.text);
          }
        });
      },
      { injector: this.injector }
    );

    // Scroll to the latest user message only when a new message pair is added,
    // not on every streaming chunk (which would interrupt reading in progress).
    const seenIds = new Set<string>();
    effect(() => {
      const msgs = this.chatStore.messages();
      const hasNew = msgs.some(m => !seenIds.has(m.id));
      msgs.forEach(m => seenIds.add(m.id));
      if (hasNew) {
        afterNextRender(() => setTimeout(() => this.scrollToLastUserMessage(), 0), {
          injector: this.injector,
        });
      }
    });
  }

  // ---------------------------------------------------------------------------
  // UI event handlers
  // ---------------------------------------------------------------------------

  /** Returns whether the expandable section with the given ID is currently open. */
  protected isMessageExpanded(id: string): boolean {
    return this.expandedMessageIds().has(id);
  }

  /** Toggles the expanded state of the section with the given ID. */
  protected toggleMessageExpansion(id: string): void {
    this.expandedMessageIds.update(set => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  /** Populates the input with the selected suggestion chip text and sends it immediately. */
  onSuggestionClick(chipMessage: string): void {
    this.userMessage.set(chipMessage);
    this.sendMessage();
  }

  /**
   * Handles file input changes. Parses each selected CSV file and adds valid
   * ones to the attachment list. Invalid files produce per-file error messages.
   */
  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.fileErrors.set([]);
    const validFiles: PendingFile[] = [];
    const newErrors: string[] = [];

    await Promise.all(
      Array.from(input.files).map(async file => {
        try {
          const parsed = await this.csvParser.parseFile(file);
          validFiles.push({ fileName: file.name, rawText: parsed.rawText });
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : 'Failed to parse.';
          newErrors.push(`${file.name}: ${msg}`);
        }
      })
    );

    if (validFiles.length) this.attachedFiles.update(cur => [...cur, ...validFiles]);
    if (newErrors.length) this.fileErrors.set(newErrors);
    input.value = '';
  }

  /** Removes the attached file at the given index from the pending list. */
  protected removeAttachment(index: number): void {
    this.attachedFiles.update(files => files.filter((_, i) => i !== index));
  }

  /** Suppresses the default newline on Enter and delegates to {@link sendMessage}. */
  protected onEnterKey(event: Event): void {
    event.preventDefault();
    this.sendMessage();
  }

  /**
   * Builds the final prompt (appending any attached file contents) and dispatches
   * it to the store. Clears the input, attachments, and file errors on success.
   */
  protected sendMessage(): void {
    if (!this.canSendMessage()) return;

    const text = this.userMessage().trim();
    const files = this.attachedFiles();

    const fileContexts = files.map(
      f =>
        `\n\n--- [Attached File: ${f.fileName}] ---\n${f.rawText}\n--- [End of ${f.fileName}] ---`
    );
    const finalPrompt = text + fileContexts.join('');

    this.browserNotificationService.requestPermission();
    this.chatStore.sendPrompt(
      finalPrompt,
      files.map(f => f.fileName)
    );

    this.userMessage.set('');
    this.attachedFiles.set([]);
    this.fileErrors.set([]);
  }

  /** Returns true when the store is ready and the user has typed text or attached a file. */
  protected canSendMessage(): boolean {
    return (
      this.chatStore.canSendMessage() &&
      (!!this.userMessage().trim() || this.attachedFiles().length > 0)
    );
  }

  /** Requests browser notification permission from the notification service. */
  enableNotifications(): void {
    this.browserNotificationService.requestPermission();
  }

  /**
   * Intercepts clicks on anchor tags with `href="#open-help-docs"` and opens
   * the help panel via the service instead of following the link.
   */
  onClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('a');
    if (anchor?.getAttribute('href') === '#open-help-docs') {
      event.preventDefault();
      this.helpService.openHelpDocs();
    }
  }
}
