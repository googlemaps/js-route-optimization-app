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
