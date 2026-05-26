import { Injectable } from '@angular/core';

export interface ParsedJsonResult {
  fileName: string;
  rawText: string;
}

@Injectable({
  providedIn: 'root',
})
export class JsonParserService {
  private readonly MAX_SIZE_BYTES = 1000 * 1024;

  /**
   * Reads a JSON file, validates it by parsing, and returns the raw text for the prompt.
   */
  async parseFile(file: File): Promise<ParsedJsonResult> {
    if (file.size > this.MAX_SIZE_BYTES) {
      throw new Error(
        `File too large. Maximum allowed is ${this.MAX_SIZE_BYTES / 1024}KB, but got ${Math.round(file.size / 1024)}KB.`
      );
    }

    const rawText = await this.readFileAsText(file);

    try {
      JSON.parse(rawText);
    } catch (error: unknown) {
      const msg = error instanceof SyntaxError ? error.message : 'Unknown error';
      throw new Error(`Invalid JSON: ${msg}`);
    }

    return {
      fileName: file.name,
      rawText: rawText,
    };
  }

  /**
   * Helper method to use the browser's native FileReader API.
   */
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsText(file);
    });
  }
}
