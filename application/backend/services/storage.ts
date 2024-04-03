/*
Copyright 2024 Google LLC

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

import fs, { constants } from "fs";
import path from "path";
import stream from "stream";

import {
  Bucket,
  GetFilesOptions,
  Storage,
  StorageOptions,
} from "@google-cloud/storage";

import { log } from "../logging";

interface FileListEntry {
  name: string;
  dateModified: Date;
  dateCreated: Date;
  pageToken?: unknown;
}

class StorageSerivce {
  private readonly _bucket: Bucket | undefined;

  public get bucket(): Bucket {
    if (!this._bucket) {
      throw new Error("Bucket not initialized");
    }
    return this._bucket;
  }

  constructor() {
    if (!process.env.STORAGE_BUCKET_NAME) {
      log.warn(
        "Missing environment variable `STORAGE_BUCKET_NAME`, storage operations will not work"
      );
      return;
    }

    const projectId = process.env.STORAGE_PROJECT_ID || process.env.PROJECT_ID;
    log.debug(`Storage project:  ${projectId}`);

    const storageOptions: StorageOptions = {
      projectId,
    };

    // attempt to load service account credentials from disk
    if (
      process.env.STORAGE_PROJECT_ID &&
      process.env.STORAGE_PROJECT_ID !== process.env.PROJECT_ID
    ) {
      const keyFilename =
        process.env.STORAGE_CREDENTIALS || path.join(__dirname, "keys.json");
      log.debug(`Storage keyFilename:  ${keyFilename}`);

      try {
        fs.accessSync(keyFilename, constants.R_OK);
        storageOptions.keyFilename = keyFilename;
      } catch {
        log.warn(
          "STORAGE_PROJECT_ID set, but no credentials file found. Will use default application credentials."
        );
      }
    }

    // initialize client and bucket
    try {
      const client = new Storage(storageOptions);
      this._bucket = client.bucket(process.env.STORAGE_BUCKET_NAME);
    } catch (err) {
      log.error(err, "Failed to initialize storage client");
    }
  }

  /**
   * Upload file to bucket
   *
   * @param content - Content to upload (JSON.stringify() will be called to convert to JSON)
   * @param uploadName - Full name of the object to write
   *
   * @returns Short name of blob that was written as string
   */
  async uploadJson(content: unknown, uploadName: string): Promise<string> {
    if (!this._bucket) {
      throw new Error("Storage bucket not initialized");
    }

    const file = this._bucket.file(uploadName);

    const writeStream = file.createWriteStream({
      resumable: false,
      validation: false,
      metadata: { "Cache-Control": "public, max-age=31536000" },
    });

    const dataStream = new stream.PassThrough();
    dataStream.push(JSON.stringify(content));
    dataStream.push(null);

    await dataStream.pipe(writeStream);

    return shortName(uploadName);
  }

  /**
   * List all files in a bucket, paginated
   * @param {dictionary} options - Options passed to GCS bucket getFiles()
   * @param {string} ext - File extension to filter by
   */
  async listFiles(
    options: GetFilesOptions,
    ext: string
  ): Promise<FileListEntry[]> {
    if (!this._bucket) {
      throw new Error("Storage bucket not initialized");
    }

    const [files, nextPageQuery] = await this._bucket.getFiles(options);

    const results: FileListEntry[] = [];
    files.forEach((file) => {
      if (file.name.match(ext)) {
        log.debug("File name is: " + file.name);

        const result: FileListEntry = {
          name: shortName(file.name),
          dateModified: file.metadata.updated,
          dateCreated: file.metadata.timeCreated,
        };

        if (nextPageQuery) {
          result.pageToken = nextPageQuery;
        }

        results.push(result);
      }
    });

    return results;
  }
}

export const storage = new StorageSerivce();

/**
 * Generate full name for a JSON blob in GCS
 *
 * @param prefix - GCS path prefix
 * @param filename - File name (*.json). ".json" will be appended if not already present.
 * @param date - Optional date string of the form "YYYY-MM-DD". If not specified, the current date will be used.
 * @returns
 */
export function generateFileName(
  prefix: string,
  filename: string,
  date: string | undefined = undefined
): string {
  const name = filename.endsWith(".json") ? filename : `${filename}.json`;

  if (!date) {
    const dateNow = new Date();

    const year = dateNow.getFullYear();
    const month = dateNow.getMonth() + 1;
    const day = dateNow.getDate().toString().padStart(2, "0");

    date = `${year}-${month}-${day}`;
  }

  return `${prefix}/${date}/${name}`;
}

/**
 * Return shorthand version of file name
 * (expected to be of the form "prefix/YYYY-MM-DD/filename.json")
 */
export function shortName(filename: string) {
  return filename.substring(filename.indexOf("/") + 1);
}
