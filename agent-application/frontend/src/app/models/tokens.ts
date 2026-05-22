import { InjectionToken } from '@angular/core';
import { Config } from './config';

export const APP_CONFIG = new InjectionToken<Config>('Config');
