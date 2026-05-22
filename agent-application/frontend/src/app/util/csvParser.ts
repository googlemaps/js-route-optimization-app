import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';

export interface ParsedCsvResult {
  fileName: string;
  rawText: string;
}

@Injectable({
  providedIn: 'root',
})
export class CsvParserService {
  private readonly MAX_ROWS = 100;

  /**
   * Reads a file, validates the row count using PapaParse,
   * and returns the raw text for the prompt.
   */
  async parseFile(file: File): Promise<ParsedCsvResult> {
    const rawText = await this.readFileAsText(file);

    return new Promise((resolve, reject) => {
      Papa.parse(rawText, {
        header: true,
        skipEmptyLines: true,
        complete: results => {
          const dataRowCount = results.data.length;

          if (dataRowCount > this.MAX_ROWS) {
            reject(
              new Error(
                `File too large. Maximum allowed is ${this.MAX_ROWS} rows, but got ${dataRowCount}.`
              )
            );
          } else {
            resolve({
              fileName: file.name,
              rawText: rawText,
            });
          }
        },
        error: (error: Error) => {
          reject(new Error(`CSV Parsing error: ${error.message}`));
        },
      });
    });
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
