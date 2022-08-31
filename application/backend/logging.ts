/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { pino, Logger } from "pino";

// map pino level to google cloud logging severity
const levelToGoogleSeverity: { [level: string]: string } = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

const serviceContext = {
  service: process.env.npm_package_name,
  version: process.env.npm_package_version,
};

let options = {};

// log as google cloud structured JSON (default)
if (!process.env.LOG_FORMAT || process.env.LOG_FORMAT === "google") {
  options = {
    name: "fleet-routing-app",
    level: process.env.LOG_LEVEL || "info",
    messageKey: "message",
    formatters: {
      level: (label: string, number: number) => {
        // reformat severity label for cloud logging
        const object: { [key: string]: string } = {
          severity: levelToGoogleSeverity[label],
        };

        // set @type for cloud error reporting if error-level severity
        if (number >= 50) {
          object[
            "@type"
          ] = `type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent`;
        }

        return object;
      },
      log: (o: any) => {
        const { err, ...reshaped } = o;
        if (err) {
          reshaped.stack_trace = err.stack;
        }
        return { serviceContext, ...reshaped };
      },
    },
  };
}
// pretty print logs to console (for development use only)
else if (process.env.LOG_FORMAT === "pretty") {
  options = {
    level: process.env.LOG_LEVEL || "info",
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    },
  };
} else {
  console.warn(
    `Unknown log format (${process.env.LOG_FORMAT}), using Pino defaults`
  );
}

const p = pino(options);

export const log: Logger = p;
