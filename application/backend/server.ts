// Load environment variables from .env file before any other imports
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

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

// Now import other modules that might use the loaded env variables
import { app } from "./app";
import { log } from "./logging";

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
app.listen(port, () => log.logger.info(`App listening at ${port}`));
