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
import { firstValueFrom, toArray } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_CONFIG } from '../models/tokens';
import { ChatStreamService, StreamChunk } from './chat-stream';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const API_URL = 'http://test.api';

/** Encodes one or more AgentStatusUpdate JSON objects into a streaming response.
 * Mocks response.body.getReader() directly to avoid ReadableStream (not in jsdom).
 */
function makeStreamResponse(payloads: object[], status = 200): Response {
  const encoder = new TextEncoder();
  const body = payloads.map((p, i) => (i === 0 ? '' : ',') + JSON.stringify(p)).join('');
  const encoded = encoder.encode(body);

  const mockReader = {
    read: vi
      .fn()
      .mockResolvedValueOnce({ done: false, value: encoded })
      .mockResolvedValueOnce({ done: true, value: undefined }),
  };

  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Server Error',
    body: { getReader: () => mockReader },
  } as unknown as Response;
}

/** Collects all StreamChunk values emitted before `complete`. */
async function collectChunks(service: ChatStreamService, message = 'hi'): Promise<StreamChunk[]> {
  return firstValueFrom(service.streamMessage(message, 'ctx-1').pipe(toArray()));
}

/** Stubs the global fetch with a mocked streaming response built from the given payloads. */
function stubFetch(...payloads: object[]): void {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamResponse(payloads)));
}

/** Minimal TASK_STATE_SUBMITTED payload. */
function submittedPayload(text: string, msgId = 'msg-1', ctxId = 'ctx-1') {
  return {
    statusUpdate: {
      contextId: ctxId,
      status: {
        state: 'TASK_STATE_SUBMITTED',
        message: { messageId: msgId, content: [{ text }] },
      },
    },
  };
}

/** Minimal TASK_STATE_WORKING plain-text payload. */
function workingTextPayload(text: string, thought = false, msgId = 'msg-w') {
  return {
    statusUpdate: {
      contextId: 'ctx-1',
      status: {
        state: 'TASK_STATE_WORKING',
        message: {
          messageId: msgId,
          content: [{ text, metadata: thought ? { thought: true } : {} }],
        },
      },
    },
  };
}

/** TASK_STATE_WORKING function_call payload. */
function functionCallPayload(toolName: string, msgId = 'msg-fc') {
  return {
    statusUpdate: {
      contextId: 'ctx-1',
      status: {
        state: 'TASK_STATE_WORKING',
        message: {
          messageId: msgId,
          content: [
            {
              data: { data: { name: toolName } },
              metadata: { adk_type: 'function_call' },
            },
          ],
        },
      },
    },
  };
}

/** TASK_STATE_WORKING function_response payload. */
function functionResponsePayload(toolName: string, result: string, msgId = 'msg-fr') {
  return {
    statusUpdate: {
      contextId: 'ctx-1',
      status: {
        state: 'TASK_STATE_WORKING',
        message: {
          messageId: msgId,
          content: [
            {
              data: { data: { name: toolName, response: { result } } },
              metadata: { adk_type: 'function_response' },
            },
          ],
        },
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ChatStreamService', () => {
  let service: ChatStreamService;

  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'test-uuid') });

    TestBed.configureTestingModule({
      providers: [ChatStreamService, { provide: APP_CONFIG, useValue: { apiUrl: API_URL } }],
    });
    service = TestBed.inject(ChatStreamService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // HTTP / fetch mechanics
  // -------------------------------------------------------------------------

  describe('fetch error handling', () => {
    it('should error the observable on HTTP error status', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeStreamResponse([], 500)));

      await expect(collectChunks(service)).rejects.toThrow('HTTP 500');
    });

    it('should complete the observable on AbortError', async () => {
      const abortErr = Object.assign(new Error('aborted'), { name: 'AbortError' });
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(abortErr));

      const chunks = await collectChunks(service);
      expect(chunks).toHaveLength(0);
    });

    it('should error the observable on network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network fail')));

      await expect(collectChunks(service)).rejects.toThrow('network fail');
    });
  });

  // -------------------------------------------------------------------------
  // Simple SUBMITTED-only conversation (no tools)
  // -------------------------------------------------------------------------

  describe('SUBMITTED-only conversation', () => {
    it('should emit text_delta and complete for a single SUBMITTED payload', async () => {
      stubFetch(submittedPayload('Hello World'));

      const chunks = await collectChunks(service);

      const textChunks = chunks.filter(c => c.eventType === 'text_delta');
      expect(textChunks.length).toBeGreaterThan(0);
      expect(textChunks.map(c => c.delta).join('')).toContain('Hello World');

      const complete = chunks.find(c => c.eventType === 'complete');
      expect(complete).toBeDefined();
      expect(complete!.done).toBe(true);
      expect(complete!.finalMessage?.message.content[0]?.text).toContain('Hello World');
    });

    it('should propagate messageId and contextId on all chunks', async () => {
      stubFetch(submittedPayload('Hi', 'msg-42', 'ctx-99'));

      const chunks = await collectChunks(service);
      const nonComplete = chunks.filter(c => c.eventType !== 'complete');
      for (const c of nonComplete) {
        expect(c.messageId).toBe('msg-42');
        expect(c.contextId).toBe('ctx-99');
      }
    });

    it('should use the last SUBMITTED text when multiple SUBMITTED are present', async () => {
      stubFetch(
        submittedPayload('First snapshot', 'msg-1'),
        submittedPayload('Final answer', 'msg-2')
      );

      const chunks = await collectChunks(service);
      const complete = chunks.find(c => c.eventType === 'complete');
      expect(complete!.finalMessage?.message.content[0]?.text).toContain('Final answer');
      expect(complete!.finalMessage?.message.content[0]?.text).not.toContain('First snapshot');
    });

    it('should NOT include thought content from SUBMITTED in the user-facing text', async () => {
      // SUBMITTED message with mixed content: thought + user-facing text.
      // Only the non-thought text should be surfaced.
      const thoughtText = 'I am thinking about the parameters internally.';
      const userText = 'Here is your answer!';
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          makeStreamResponse([
            {
              statusUpdate: {
                contextId: 'ctx-1',
                status: {
                  state: 'TASK_STATE_SUBMITTED',
                  message: {
                    messageId: 'msg-1',
                    content: [
                      { text: thoughtText, metadata: { thought: true } },
                      { text: userText },
                    ],
                  },
                },
              },
            },
          ])
        )
      );

      const chunks = await collectChunks(service);
      const allText = chunks
        .filter(c => c.eventType === 'text_delta')
        .map(c => c.delta)
        .join('');

      expect(allText).toContain(userText);
      expect(allText).not.toContain(thoughtText);
    });

    it('should include SUBMITTED content without thought:true in the user-facing text', async () => {
      // Content with thought:false and no metadata should both pass through.
      stubFetch({
        statusUpdate: {
          contextId: 'ctx-1',
          status: {
            state: 'TASK_STATE_SUBMITTED',
            message: {
              messageId: 'msg-1',
              content: [
                { text: 'Visible answer.', metadata: { thought: false } },
                { text: ' More visible text.' },
              ],
            },
          },
        },
      });

      const chunks = await collectChunks(service);
      const allText = chunks
        .filter(c => c.eventType === 'text_delta')
        .map(c => c.delta)
        .join('');

      expect(allText).toContain('Visible answer.');
      expect(allText).toContain('More visible text.');
    });
  });

  // -------------------------------------------------------------------------
  // Thinking steps
  // -------------------------------------------------------------------------

  describe('thinking steps', () => {
    it('should emit a thinking chunk for WORKING content with thought:true', async () => {
      stubFetch(workingTextPayload('I am reasoning...', true, 'msg-t'), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const thinking = chunks.filter(c => c.eventType === 'thinking');
      expect(thinking.length).toBeGreaterThan(0);
      expect(thinking[0].thinkingStep?.type).toBe('thought');
      expect(thinking[0].thinkingStep?.text).toBe('I am reasoning...');
    });

    it('should NOT emit a thinking chunk for WORKING content without thought:true', async () => {
      stubFetch(workingTextPayload('streaming fragment', false), submittedPayload('Final answer'));

      const chunks = await collectChunks(service);
      const thinking = chunks.filter(c => c.eventType === 'thinking');
      expect(thinking).toHaveLength(0);
    });

    it('should emit tool_call thinking step for function_call', async () => {
      stubFetch(functionCallPayload('MySpecialTool'), submittedPayload('Answer'));

      const chunks = await collectChunks(service);
      const toolCall = chunks.find(
        c => c.eventType === 'thinking' && c.thinkingStep?.type === 'tool_call'
      );
      expect(toolCall).toBeDefined();
      expect(toolCall!.thinkingStep?.text).toContain('MySpecialTool');
    });

    it('should emit tool_response thinking step for function_response', async () => {
      stubFetch(functionResponsePayload('MyTool', 'some result'), submittedPayload('Answer'));

      const chunks = await collectChunks(service);
      const toolResp = chunks.find(
        c => c.eventType === 'thinking' && c.thinkingStep?.type === 'tool_response'
      );
      expect(toolResp).toBeDefined();
      expect(toolResp!.thinkingStep?.text).toContain('MyTool');
    });

    it('should invalidate SUBMITTED text when a function_call follows it', async () => {
      stubFetch(
        submittedPayload('coordinator snapshot'),
        functionCallPayload('Tool'),
        functionResponsePayload('Tool', 'real answer'),
        submittedPayload('Follow-up from coordinator')
      );

      const chunks = await collectChunks(service);
      const complete = chunks.find(c => c.eventType === 'complete');
      // The coordinator snapshot should have been invalidated by the function_call
      expect(complete!.finalMessage?.message.content[0]?.text).not.toBe('coordinator snapshot');
    });
  });

  // -------------------------------------------------------------------------
  // Fenced code block extraction (```json, ```textproto, etc.)
  // -------------------------------------------------------------------------

  describe('fenced code block extraction', () => {
    it('should emit code_block for ```json fence in function_response result', async () => {
      const result = '```json\n{"key": "value"}\n```';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlock = chunks.find(c => c.eventType === 'code_block');
      expect(codeBlock).toBeDefined();
      expect(codeBlock!.code).toBe('{"key": "value"}');
    });

    it('should emit code_block for ```textproto fence', async () => {
      const result = '```textproto\nmodel: {\n  global_start_time: {}\n}\n```';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlock = chunks.find(c => c.eventType === 'code_block');
      expect(codeBlock).toBeDefined();
      expect(codeBlock!.code).toContain('model:');
    });

    it('should emit code_block for any unknown language tag', async () => {
      const result = '```model\nsome model content\n```';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlock = chunks.find(c => c.eventType === 'code_block');
      expect(codeBlock).toBeDefined();
      expect(codeBlock!.code).toBe('some model content');
    });

    it('should split prose and fenced code into separate chunks', async () => {
      const result = 'Here is the result:\n```json\n{"answer": 42}\n```\nAll done.';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      const textDeltas = chunks.filter(c => c.eventType === 'text_delta');
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toBe('{"answer": 42}');
      const combinedText = textDeltas.map(c => c.delta).join('');
      expect(combinedText).toContain('Here is the result');
      expect(combinedText).toContain('All done');
    });
  });

  // -------------------------------------------------------------------------
  // Raw unfenced model blob detection
  // -------------------------------------------------------------------------

  describe('raw unfenced model blob detection', () => {
    it('should extract model:{} blob from plain text in function_response', async () => {
      const result = 'Here is the model:model: {global_start_time: {seconds: 123}}';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlock = chunks.find(c => c.eventType === 'code_block');
      expect(codeBlock).toBeDefined();
      expect(codeBlock!.code).toContain('model:');
      expect(codeBlock!.code).toContain('global_start_time');
    });

    it('should preserve prose before and after a raw model blob', async () => {
      const result = 'Intro text.model: {foo: {}}More text after.';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlock = chunks.find(c => c.eventType === 'code_block');
      const textDeltas = chunks.filter(c => c.eventType === 'text_delta');
      const combinedText = textDeltas.map(c => c.delta).join('');

      expect(codeBlock).toBeDefined();
      expect(combinedText).toContain('Intro text');
      expect(combinedText).toContain('More text after');
    });

    it('should handle nested braces in raw model blob correctly', async () => {
      const result = 'model: {outer: {inner: {deep: 1}}}trailing';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlock = chunks.find(c => c.eventType === 'code_block');
      expect(codeBlock).toBeDefined();
      // Should capture the entire nested blob, not stop at the first `}`
      expect(codeBlock!.code).toContain('outer');
      expect(codeBlock!.code).toContain('inner');
      expect(codeBlock!.code).toContain('deep');
    });

    it('should not treat normal prose containing braces as a model blob', async () => {
      const result = 'Some text with {curly} braces but no model keyword.';
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      expect(codeBlocks).toHaveLength(0);
    });
  });

  // -------------------------------------------------------------------------
  // Generalized textproto detection (identifier: { ... } patterns)
  // -------------------------------------------------------------------------

  describe('generalized textproto detection', () => {
    it('should detect full textproto with model, timeout, and search_mode', async () => {
      const textproto = `model: {
  global_start_time: { seconds: 1696924800 }
  global_end_time: { seconds: 1696957200 }
  vehicles: {
    label: "Vehicle_1"
    start_location: { latitude: 37.7749 longitude: -122.4194 }
    end_location: { latitude: 37.7749 longitude: -122.4194 }
    cost_per_traveled_hour: 3600.0
  }
  shipments: {
    label: "Shipment_1"
    pickups: {
      arrival_location: { latitude: 37.7849 longitude: -122.4094 }
    }
    deliveries: {
      arrival_location: { latitude: 37.7949 longitude: -122.3994 }
    }
    penalty_cost: 100000.0
  }
}
timeout: { seconds: 60 }
search_mode: CONSUME_ALL_AVAILABLE_TIME`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('model:');
      expect(codeBlocks[0].code).toContain('timeout:');
      expect(codeBlocks[0].code).toContain('search_mode: CONSUME_ALL_AVAILABLE_TIME');
      expect(codeBlocks[0].code).toContain('global_start_time');
      expect(codeBlocks[0].code).toContain('vehicles');
      expect(codeBlocks[0].code).toContain('shipments');
    });

    it('should detect model-only textproto as a single code block', async () => {
      const textproto = `model: {
  global_start_time: { seconds: 1696924800 }
  global_end_time: { seconds: 1696957200 }
  vehicles: {
    label: "Vehicle_1"
    start_location: { latitude: 37.7749 longitude: -122.4194 }
    end_location: { latitude: 37.7749 longitude: -122.4194 }
    cost_per_traveled_hour: 3600.0
  }
  shipments: {
    label: "Shipment_1"
    pickups: {
      arrival_location: { latitude: 37.7849 longitude: -122.4094 }
    }
    deliveries: {
      arrival_location: { latitude: 37.7949 longitude: -122.3994 }
    }
    penalty_cost: 100000.0
  }
}`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('model:');
      expect(codeBlocks[0].code).toContain('global_start_time');
    });

    it('should detect any identifier: { } pattern, not just model:', async () => {
      const textproto = `config: {
  timeout_seconds: 30
  retry_count: 3
}`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('config:');
    });

    it('should combine multiple consecutive brace blocks into one code segment', async () => {
      const textproto = `first_block: { value: 1 }
second_block: { value: 2 }
third_block: { nested: { deep: 3 } }`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('first_block:');
      expect(codeBlocks[0].code).toContain('second_block:');
      expect(codeBlocks[0].code).toContain('third_block:');
    });

    it('should include flat key-value lines after brace blocks', async () => {
      const textproto = `model: { foo: 1 }
search_mode: CONSUME_ALL_AVAILABLE_TIME
populate_polylines: true`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('model:');
      expect(codeBlocks[0].code).toContain('search_mode: CONSUME_ALL_AVAILABLE_TIME');
      expect(codeBlocks[0].code).toContain('populate_polylines: true');
    });

    it('should separate prose from textproto correctly', async () => {
      const result = `Here is the optimized request:

model: {
  vehicles: { label: "V1" }
}
timeout: { seconds: 60 }

Let me know if you need changes.`;
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      const textDeltas = chunks.filter(c => c.eventType === 'text_delta');
      const combinedText = textDeltas.map(c => c.delta).join('');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('model:');
      expect(codeBlocks[0].code).toContain('timeout:');
      expect(combinedText).toContain('Here is the optimized request');
      expect(combinedText).toContain('Let me know if you need changes');
    });

    it('should handle deeply nested textproto structures', async () => {
      const textproto = `request: {
  model: {
    shipments: {
      pickups: {
        arrival_location: {
          latitude: 37.7849
          longitude: -122.4094
        }
      }
    }
  }
}`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('request:');
      expect(codeBlocks[0].code).toContain('model:');
      expect(codeBlocks[0].code).toContain('arrival_location');
      expect(codeBlocks[0].code).toContain('latitude: 37.7849');
    });

    it('should detect flat textproto without braces when majority of lines match pattern', async () => {
      const textproto = `search_mode: CONSUME_ALL_AVAILABLE_TIME
populate_polylines: true
consider_road_traffic: false`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('search_mode');
      expect(codeBlocks[0].code).toContain('populate_polylines');
    });

    it('should NOT treat prose with occasional colons as textproto', async () => {
      const prose = `Here is the summary:
The optimization completed successfully.
Note: this took 5 minutes.`;
      stubFetch(functionResponsePayload('Tool', prose), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(0);
    });

    it('should handle mixed prose and multiple textproto blocks', async () => {
      const result = `First block:
config: { value: 1 }

Some prose in between.

second_config: { value: 2 }
mode: ACTIVE`;
      stubFetch(functionResponsePayload('Tool', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      const textDeltas = chunks.filter(c => c.eventType === 'text_delta');
      const combinedText = textDeltas.map(c => c.delta).join('');

      // First code block: config + nothing more (prose breaks it)
      // Second code block: second_config + mode
      expect(codeBlocks.length).toBeGreaterThanOrEqual(1);
      expect(combinedText).toContain('First block');
      expect(combinedText).toContain('Some prose in between');
    });

    it('should handle textproto with quoted string values', async () => {
      const textproto = `model: {
  vehicles: {
    label: "Vehicle_1"
    display_name: "My Vehicle"
  }
}`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('"Vehicle_1"');
      expect(codeBlocks[0].code).toContain('"My Vehicle"');
    });

    it('should handle textproto with numeric and boolean values', async () => {
      const textproto = `model: {
  cost_per_traveled_hour: 3600.0
  max_distance_meters: 50000
  use_geodesic_distances: true
}`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('3600.0');
      expect(codeBlocks[0].code).toContain('50000');
      expect(codeBlocks[0].code).toContain('true');
    });

    it('should handle quoted strings containing braces', async () => {
      const textproto = `model: {
  label: "Value with { braces } inside"
  description: "Another {nested} value"
}
timeout: { seconds: 60 }`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('label: "Value with { braces } inside"');
      expect(codeBlocks[0].code).toContain('timeout: { seconds: 60 }');
    });

    it('should handle escaped quotes inside quoted strings', async () => {
      const textproto = `model: {
  label: "Vehicle \\"Primary\\""
  notes: "Contains \\"nested\\" quotes"
}`;
      stubFetch(functionResponsePayload('Tool', textproto), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');

      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toContain('\\"Primary\\"');
      expect(codeBlocks[0].code).toContain('\\"nested\\"');
    });
  });

  // -------------------------------------------------------------------------
  // Raw JSON wrapping in function_response results
  // -------------------------------------------------------------------------

  describe('raw JSON wrapping in function_response', () => {
    it('should emit code_block for a raw JSON object response', async () => {
      const result = '{"routes": [{"vehicleIndex": 0}]}';
      stubFetch(functionResponsePayload('OptimizeTours', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      expect(codeBlocks.length).toBeGreaterThan(0);
      // Raw JSON is emitted directly — code value is the unwrapped JSON
      expect(codeBlocks[0].code).toBe(result);
      expect(codeBlocks[0].code).not.toContain('```');
    });

    it('should NOT wrap already-fenced content a second time', async () => {
      const result = '```json\n{"routes": []}\n```';
      stubFetch(functionResponsePayload('OptimizeTours', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      expect(codeBlocks.length).toBeGreaterThan(0);
      // Content should be unwrapped — no fence markers inside the code value
      expect(codeBlocks[0].code).not.toContain('```');
    });

    it('should deduplicate code_block emissions when the same JSON appears in both function_response and SUBMITTED', async () => {
      const json = '{"routes": [{"vehicleIndex": 0}]}';
      const fencedJson = `\`\`\`json\n${json}\n\`\`\``;
      stubFetch(
        functionResponsePayload('OptimizeTours', json),
        submittedPayload(`${fencedJson}\nOptimization complete.`)
      );

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      // Should appear exactly once, not twice
      expect(codeBlocks).toHaveLength(1);
      expect(codeBlocks[0].code).toBe(json);
    });

    it('should NOT wrap plain text as a code block', async () => {
      const result = 'Optimization complete, no routes returned.';
      stubFetch(functionResponsePayload('OptimizeTours', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      const textDeltas = chunks.filter(c => c.eventType === 'text_delta');
      expect(codeBlocks).toHaveLength(0);
      expect(textDeltas.some(c => c.delta?.includes('Optimization complete'))).toBe(true);
    });

    it('should NOT wrap a malformed brace-delimited string that is not valid JSON', async () => {
      const result = '{this is not valid json}';
      stubFetch(functionResponsePayload('OptimizeTours', result), submittedPayload('Done'));

      const chunks = await collectChunks(service);
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      expect(codeBlocks).toHaveLength(0);
    });

    it('should NOT repeat prose when SUBMITTED echoes the full function_response text', async () => {
      const json = '{"routes": [{"vehicleIndex": 0}]}';
      const prose = 'Optimization complete.\n\nHow would you like to proceed?';
      const fencedJson = `\`\`\`json\n${json}\n\`\`\``;
      stubFetch(
        functionResponsePayload('OptimizeTours', `${fencedJson}\n${prose}`),
        submittedPayload(`${fencedJson}\n${prose}`)
      );

      const chunks = await collectChunks(service);
      const allText = chunks
        .filter(c => c.eventType === 'text_delta')
        .map(c => c.delta)
        .join('');
      const count = (allText.match(/Optimization complete/g) ?? []).length;
      expect(count).toBe(1);
    });

    it('should emit NEW prose from SUBMITTED even after function_response ran', async () => {
      // This tests the delta computation: when SUBMITTED has new content after
      // what was already emitted via function_response, that new content SHOULD
      // be surfaced to the user.
      const json = '{"routes": [{"vehicleIndex": 0}]}';
      const fencedJson = `\`\`\`json\n${json}\n\`\`\``;
      const followUp = 'Would you like a summary of the routes?';
      // function_response sends FENCED json (same format as SUBMITTED) so delta works
      stubFetch(
        functionResponsePayload('OptimizeTours', fencedJson),
        submittedPayload(`${fencedJson}\n${followUp}`)
      );

      const chunks = await collectChunks(service);
      const allText = chunks
        .filter(c => c.eventType === 'text_delta')
        .map(c => c.delta)
        .join('');
      // NEW prose after function_response SHOULD be emitted
      expect(allText).toContain(followUp);
    });

    it('should emit prose from SUBMITTED when function_response sent completely different code', async () => {
      // Production scenario: function_response sends textproto, SUBMITTED sends prose.
      // These are NOT prefixes of each other — both should be surfaced.
      const textproto = 'model: {\n  global_start_time: { seconds: 1728579600 }\n}';
      const prose = 'The request has been successfully built and validated.';
      stubFetch(
        functionResponsePayload('OperationsResearch_RequestSpecialist', textproto),
        submittedPayload(prose)
      );

      const chunks = await collectChunks(service);

      // Code block from function_response should be emitted
      const codeBlocks = chunks.filter(c => c.eventType === 'code_block');
      expect(codeBlocks.length).toBeGreaterThan(0);
      expect(codeBlocks.some(c => c.code?.includes('global_start_time'))).toBe(true);

      // Prose from SUBMITTED should ALSO be emitted (not dropped)
      const allText = chunks
        .filter(c => c.eventType === 'text_delta')
        .map(c => c.delta)
        .join('');
      expect(allText).toContain('successfully built');
    });
  });

  // -------------------------------------------------------------------------
  // Agent error handling
  // -------------------------------------------------------------------------

  describe('agent_error events', () => {
    function agentErrorPayload(text: string, msgId = 'msg-err', ctxId = 'ctx-1') {
      return {
        statusUpdate: {
          contextId: ctxId,
          // status intentionally has no `state` field
          status: {
            message: {
              messageId: msgId,
              role: 'ROLE_AGENT',
              content: [{ text }],
            },
          },
        },
      };
    }

    it('should emit an agent_error chunk when status has no state', async () => {
      stubFetch(
        agentErrorPayload('Error: Internal error: Failed to call tool: Request_FixerAgent'),
        submittedPayload('Recovered')
      );

      const chunks = await collectChunks(service);
      const errorChunk = chunks.find(c => c.eventType === 'agent_error');
      expect(errorChunk).toBeDefined();
      expect(errorChunk!.errorText).toContain('Internal error');
    });

    it('should carry messageId and contextId on the agent_error chunk', async () => {
      stubFetch(agentErrorPayload('Some error', 'msg-e1', 'ctx-e1'), submittedPayload('Recovered'));

      const chunks = await collectChunks(service);
      const errorChunk = chunks.find(c => c.eventType === 'agent_error');
      expect(errorChunk!.messageId).toBe('msg-e1');
      expect(errorChunk!.contextId).toBe('ctx-e1');
    });

    it('should still emit complete after an agent_error when the stream continues', async () => {
      stubFetch(agentErrorPayload('Some error'), submittedPayload('Recovered after error'));

      const chunks = await collectChunks(service);
      const complete = chunks.find(c => c.eventType === 'complete');
      expect(complete).toBeDefined();
      expect(complete!.finalMessage?.message.content[0]?.text).toContain('Recovered after error');
    });

    it('should use a fallback message when the error payload content is empty', async () => {
      stubFetch(
        {
          statusUpdate: {
            contextId: 'ctx-1',
            status: { message: { messageId: 'msg-x', content: [] } },
          },
        },
        submittedPayload('Done')
      );

      const chunks = await collectChunks(service);
      const errorChunk = chunks.find(c => c.eventType === 'agent_error');
      expect(errorChunk).toBeDefined();
      expect(errorChunk!.errorText).toBe('Internal agent error');
    });

    it('should NOT include thought content in the agent_error text', async () => {
      // Error message with mixed content: thought + user-facing error text.
      // Only the non-thought text should appear in errorText.
      const thoughtText = 'I was reasoning about the request.';
      const errorUserText = 'Error: Failed to call tool.';
      stubFetch(
        {
          statusUpdate: {
            contextId: 'ctx-1',
            status: {
              // no state — triggers the agent_error path
              message: {
                messageId: 'msg-err',
                content: [
                  { text: thoughtText, metadata: { thought: true } },
                  { text: errorUserText },
                ],
              },
            },
          },
        },
        submittedPayload('Recovered')
      );

      const chunks = await collectChunks(service);
      const errorChunk = chunks.find(c => c.eventType === 'agent_error');
      expect(errorChunk).toBeDefined();
      expect(errorChunk!.errorText).toContain(errorUserText);
      expect(errorChunk!.errorText).not.toContain(thoughtText);
    });
  });

  // -------------------------------------------------------------------------
  // complete chunk
  // -------------------------------------------------------------------------

  describe('complete chunk', () => {
    it('should always emit exactly one complete chunk as the last event', async () => {
      stubFetch(submittedPayload('Answer'));

      const chunks = await collectChunks(service);
      const completes = chunks.filter(c => c.eventType === 'complete');
      expect(completes).toHaveLength(1);
      expect(chunks[chunks.length - 1].eventType).toBe('complete');
    });

    it('complete chunk should have done:true', async () => {
      stubFetch(submittedPayload('Answer'));

      const chunks = await collectChunks(service);
      const complete = chunks.find(c => c.eventType === 'complete')!;
      expect(complete.done).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // abort
  // -------------------------------------------------------------------------

  describe('abort', () => {
    it('should abort the fetch when the observable is unsubscribed', () => {
      const abortSpy = vi.fn();
      // Never-resolving fetch so the observable stays open
      vi.stubGlobal(
        'fetch',
        vi.fn().mockReturnValue(
          new Promise<Response>((_resolve, _reject) => {
            /* never resolves */
          })
        )
      );
      vi.spyOn(AbortController.prototype, 'abort').mockImplementation(abortSpy);

      const sub = service.streamMessage('hi').subscribe();
      sub.unsubscribe();

      expect(abortSpy).toHaveBeenCalled();
    });
  });
});
