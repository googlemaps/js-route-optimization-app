/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { app } from "./app"
import { log } from "./logging";

const port = process.env.PORT ? parseInt(process.env.PORT) : 8080;
app.listen(port, () => log.info(`App listening at ${port}`));
