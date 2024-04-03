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
