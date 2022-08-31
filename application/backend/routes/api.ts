/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import url from "url";

import express, { Response, Request } from "express";
export const router = express.Router();

import { generateFileName, shortName, storage } from "../services/storage";
import { log } from "../logging";

router.get("/healthz", async (req: Request, res: Response) => {
  log.debug("Health check (API)");
  res.status(200).send("OK");
});

/**
 * Check if the file exists
 * takes a prefix as a parameter
 */
router.get("/status/:date?/:name", async (req: Request, res: Response) => {
  const parsedQuery = url.parse(req.url, true).query;

  if (!parsedQuery.prefix) {
    res.status(400).send({ error: "Missing required query parameter: prefix" });
    return;
  }

  const fileName = generateFileName(
    parsedQuery.prefix as string,
    req.params.name,
    req.params.date
  );
  log.debug(fileName);

  const status = (await storage.bucket.file(fileName).exists())[0];
  const result = {
    status,
    name: shortName(fileName),
  };

  res.status(200).send(result);
});

/**
 * Get a list of all files in a scenario bucket
 */
router.get("/scenarios", async (req: Request, res: Response) => {
  const queryObject = url.parse(req.url, true).query;

  const options: { [k: string]: any } = {};

  if ("limit" in queryObject) {
    options.maxResults = parseInt(queryObject.limit as string);
    options.autoPaginate = false;
  }
  if ("pageToken" in queryObject) {
    options.pageToken = queryObject.pageToken;
  }

  if ("startsWith" in queryObject) {
    options.prefix = "scenarios/" + queryObject.startsWith;
  } else {
    options.prefix = "scenarios/2";
  }

  const scenarios = await storage.listFiles(options, ".json$");
  res.status(200).send(scenarios);
});

/**
 * Get a list of all files in a solutions bucket
 */
router.get("/solutions", async (req: Request, res: Response) => {
  const queryObject = url.parse(req.url, true).query;

  const options: { [k: string]: any } = {};

  if ("limit" in queryObject || "pageToken" in queryObject) {
    options.maxResults = parseInt(queryObject.limit as string);
    options.autoPaginate = true;

    if ("pageToken" in queryObject) {
      options.pageToken = queryObject.pageToken;
    }
  }

  options.prefix = "solutions/" + (queryObject.startsWith || "2");

  const solutions = await storage.listFiles(options, ".json$");
  res.status(200).send(solutions);
});

/**
 * Get metadata of a file in a bucket(scenario or solution)
 */
router.get("/scenarios/:date?/:name", async (req: Request, res: Response) => {
  const fileName = generateFileName(
    "scenarios",
    req.params.name,
    req.params.date
  );

  if (await storage.bucket.file(fileName).exists()) {
    const file = await storage.bucket.file(fileName).download();
    const result = {
      name: shortName(fileName),
      fileContent: JSON.parse(file[0].toString("utf8")),
    };

    res.status(200).send(result);
  } else {
    res.status(404).send({ error: "File doesn't exist" });
  }
});

/**
 * Get metadata of a file in a bucket(scenario or solution)
 */
router.get("/solutions/:date?/:name", async (req: Request, res: Response) => {
  const fileName = generateFileName(
    "solutions",
    req.params.name,
    req.params.date
  );

  if (await storage.bucket.file(fileName).exists()) {
    const file = await storage.bucket.file(fileName).download();

    const body = JSON.parse(file[0].toString());

    const result = {
      name: shortName(fileName),
      scenario: body.scenario,
      solution: body.solution,
    };

    res.status(200).send(result);
  } else {
    res.status(404).send({ error: "File doesn't exist" });
  }
});

/**
 * Upload scenarios file to bucket
 */
router.post("/scenarios/:date?/:name", async (req: Request, res: Response) => {
  try {
    const file = req.body;

    const uploadName = generateFileName(
      "scenarios",
      req.params.name,
      req.params.date
    );

    const fileUrl = await storage.uploadJson(file, uploadName);
    res.status(201).json({
      message: "Upload was successful",
      data: fileUrl,
    });
  } catch (error) {
    log.error(error);
    return res.sendStatus(500);
  }
});

/**
 * Upload solutions file to bucket
 */
router.post("/solutions/:date?/:name", async (req: Request, res: Response) => {
  try {
    const scenario = req.body.scenario;
    const solution = req.body.solution;

    const uploadName = generateFileName(
      "solutions",
      req.params.name,
      req.params.date
    );

    const fileUrl = await storage.uploadJson({ scenario, solution }, uploadName);
    res.status(201).json({
      message: "Upload was successful",
      data: fileUrl,
    });
  } catch (error) {
    log.error(error);
    return res.sendStatus(500);
  }
});

/**
 * Update a scenario
 */
router.put("/scenarios/:date?/:name", async (req: Request, res: Response) => {
  const file = req.body;
  try {
    const uploadName = generateFileName(
      "scenarios",
      req.params.name,
      req.params.date
    );
    const fileUrl = await storage.uploadJson(file, uploadName);

    res.status(200).json({
      message: "Update was successful",
      data: fileUrl,
    });
  } catch (error) {
    log.error(error);
    return res.sendStatus(500);
  }
});

/**
 * Update a solution
 */
router.put("/solutions/:date?/:name", async (req: Request, res: Response) => {
  try {
    const scenario = req.body.scenario;
    const solution = req.body.solution;

    const uploadName = generateFileName(
      "solutions",
      req.params.name,
      req.params.date
    );

    const fileUrl = await storage.uploadJson({ scenario, solution }, uploadName);

    res.status(200).json({
      message: "Update was successful",
      data: fileUrl,
    });
  } catch (error) {
    log.error(error);
    return res.sendStatus(500);
  }
});

/**
 * Delete a scenario
 */
router.delete(
  "/scenarios/:date?/:name",
  async (req: Request, res: Response) => {
    const fileName = generateFileName(
      "scenarios",
      req.params.name,
      req.params.date
    );

    await storage.bucket.file(fileName).delete();
    res.send(`${fileName} deleted.`);
  }
);

/**
 * Delete a solution
 */
router.delete(
  "/solutions/:date?/:name",
  async (req: Request, res: Response) => {
    const fileName = generateFileName(
      "solutions",
      req.params.name,
      req.params.date
    );

    await storage.bucket.file(fileName).delete();
    res.send(`${fileName} deleted.`);
  }
);
