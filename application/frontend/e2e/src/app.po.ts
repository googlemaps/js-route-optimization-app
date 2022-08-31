/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { browser, element, by } from 'protractor';

export class AppPage {
  readonly titleBar = element(by.tagName('app-title-bar'));
  readonly progressBar = element(by.css('app-progress-bar mat-progress-bar'));

  navigateTo() {
    return browser.get(browser.baseUrl);
  }
}
