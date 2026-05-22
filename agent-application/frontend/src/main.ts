/*
Copyright 2026 Google LLC

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

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { APP_CONFIG } from './app/models/tokens';
import { configureProtobuf } from './app/util/configure-protobuf';

async function startApp() {
  const config = await fetch('./config.json').then(res => res.json());

  appConfig.providers.push({ provide: APP_CONFIG, useValue: config });

  configureProtobuf();

  bootstrapApplication(App, appConfig).catch(err => console.error(err));
}

startApp();
