/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { describe, expect, test } from "@jest/globals";
import request from "supertest";

import { app } from "../app";
import { shortName, generateFileName } from "../services/storage";

describe("storage", () => {
  describe("api", () => {
    test("responds success to /healthz", async () => {
      const response = await request(app).get("/api/healthz");

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toMatch(/text/);
      expect(response.text).toContain("OK");
    });
  });

  describe("shortName", () => {
    test("expected pattern", async () => {
      const short = shortName("prefix/2006-01-02/blob.json");
      expect(short).toBe("2006-01-02/blob.json");
    });

    test("more folders", async () => {
      const short = shortName("prefix/with/more/folders/2006-01-02/blob.json");
      expect(short).toBe("with/more/folders/2006-01-02/blob.json");
    });

    test("fewer folders", async () => {
      const short = shortName("prefix/blob.json");
      expect(short).toBe("blob.json");
    });

    test("no folders", async () => {
      const short = shortName("file-name-without-folders.json");
      expect(short).toBe("file-name-without-folders.json");
    });
  });

  describe("generateFileName", () => {
    test("all params", async () => {
      const name = generateFileName("prefix", "blob.json", "2006-01-02");
      expect(name).toBe("prefix/2006-01-02/blob.json");
    });

    test("more folders in prefix", async () => {
      const name = generateFileName(
        "prefix/more/folders",
        "blob.json",
        "2006-01-02"
      );
      expect(name).toBe("prefix/more/folders/2006-01-02/blob.json");
    });

    test("adds .json when not present", async () => {
      const name = generateFileName("prefix", "blob", "2006-01-02");
      expect(name).toBe("prefix/2006-01-02/blob.json");
    });

    test("uses current date when not specified", async () => {
      const dateNow = new Date();

      const year = dateNow.getFullYear();
      const month = dateNow.getMonth() + 1;
      const day = dateNow.getDate().toString().padStart(2, "0");

      const name = generateFileName("prefix", "blob.json");
      expect(name).toBe(`prefix/${year}-${month}-${day}/blob.json`);
    });

    test("empty prefix", async () => {
      const name = generateFileName("", "blob.json", "2006-01-02");
      expect(name).toBe("/2006-01-02/blob.json");
    });
  });
});
