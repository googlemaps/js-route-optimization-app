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

export function isCodeBlock(content: string): boolean {
  return content.startsWith('```');
}

/**
 * Extracts code from a fenced code block. Supports any language tag (e.g. ```json, ```textproto) or untagged fences (```).
 * @param content The raw content of the code block, including fences.
 * @returns The extracted code with fences stripped, or an empty string if the content is not a valid fenced code block.
 */
export function extractCode(content: string): string {
  const match = content.match(/^```\w*\n?([\s\S]*?)```$/);
  return match ? match[1].trim() : '';
}
