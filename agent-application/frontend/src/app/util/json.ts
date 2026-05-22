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
