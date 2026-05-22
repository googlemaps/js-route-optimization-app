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

import { IShipmentRoute } from './ro';

// ---------------------------------------------------------------------------
// Agent stream types (statusUpdate protocol)
// ---------------------------------------------------------------------------

export type TaskState = 'TASK_STATE_WORKING' | 'TASK_STATE_SUBMITTED';
export type AdkType = 'function_call' | 'function_response';

export interface AgentContent {
  text?: string;
  data?: {
    data: {
      name?: string;
      id?: string;
      args?: unknown;
      response?: unknown;
    };
  };
  metadata?: { adk_type?: AdkType; thought?: boolean; [key: string]: unknown };
}

export interface AgentMessage {
  messageId?: string;
  role?: string;
  content?: AgentContent[];
  metadata?: { author?: string };
}

export interface AgentStatusUpdate {
  statusUpdate: {
    taskId?: string;
    contextId?: string;
    status?: {
      state?: TaskState;
      message?: AgentMessage;
      timestamp?: string;
    };
  };
}

/**
 * A single step shown inside the "Thinking" panel.
 * type 'thought'       – coordinator's internal reasoning text
 * type 'tool_call'     – agent invoked a sub-agent / tool
 * type 'tool_response' – response from a sub-agent / tool
 */
export interface ThinkingStep {
  id: string;
  type: 'thought' | 'tool_call' | 'tool_response';
  text: string;
}

// ---------------------------------------------------------------------------
// Chat request / response models
// ---------------------------------------------------------------------------

/**
 * Represents the message payload for an initial chat request.
 */
export interface InitialChatRequest {
  message: {
    role: ChatBotRole;
    content: Content[];
  };
}

/**
 * Represents the message payload for a subsequent chat request.
 */
export interface SubsequentChatRequest {
  message: {
    contextId: string;
    role: ChatBotRole;
    content: Content[];
  };
}

/**
 * Represents a message received from the API.
 */
export interface ChatResponse {
  message: {
    messageId: string;
    contextId: string;
    role: ChatBotRole;
    content: Content[];
  };
}

/**
 * Represents the content of a message.
 */
export interface Content {
  text: string;
}

/**
 * A single rendered segment inside a chat message.
 * 'text' segments are rendered as markdown; 'code' segments go to app-code-box.
 */
export interface ContentSegment {
  type: 'text' | 'code';
  value: string;
}

export enum ChatBotRole {
  USER = 'ROLE_USER',
  AGENT = 'ROLE_AGENT',
}

export interface RefreshResponse {
  routes: IShipmentRoute[];
}
