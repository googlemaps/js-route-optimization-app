/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable, RendererFactory2 } from '@angular/core';
import { from, Observable } from 'rxjs';
import * as jszip from 'jszip';

type FileData = string | number[] | Uint8Array | ArrayBuffer | Blob;

/**
 * Responsible for file operations
 */
@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private rendererFactory: RendererFactory2) {}

  /**
   * Downloads to a file
   * @param name name to give the file
   * @param data data to put in the file
   * @param type MIME type of the file
   */
  download(name: string, data: BlobPart[], type = ''): void {
    const blob = new Blob(data, { type });
    const url = URL.createObjectURL(blob);
    const renderer = this.rendererFactory.createRenderer(null, null);
    const a: HTMLAnchorElement = renderer.createElement('a');
    a.style.display = 'none';
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  readAsText(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  /**
   * Creates a zip file
   */
  zip(files: { [fileName: string]: FileData }): Observable<Blob> {
    const zip = new jszip();
    Object.keys(files || {}).forEach((name) => {
      zip.file(name, files[name]);
    });
    return from(zip.generateAsync({ type: 'blob' }));
  }

  /**
   * Unzips a file
   */
  unzip(file: Blob): Promise<jszip> {
    const zip = new jszip();
    return zip.loadAsync(file);
  }

  async getJSONFromZip(file: Blob): Promise<any> {
    const zip = new jszip();
    const contents = await zip.loadAsync(file);

    const results = [];
    for (const filename of Object.keys(contents.files)) {
      try {
        if (contents.files[filename].dir || filename.includes('__MACOSX/')) {
          continue;
        }
        const rootFilename = filename.replace(/^.*[\\/]/, '');
        results.push(
          await zip
            .file(filename)
            .async('text')
            .then((content) => ({ filename: rootFilename, content: JSON.parse(content) }))
        );
      } catch (e) {
        console.error(`Error opening JSON from zip: ${e}`);
      }
    }
    return results;
  }
}
