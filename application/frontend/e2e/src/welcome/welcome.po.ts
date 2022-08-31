/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { browser, by, element } from 'protractor';
import { AppPage } from '../app.po';

export class WelcomePage extends AppPage {
  static readonly path = '/welcome';

  readonly page = element(by.tagName('app-welcome-page'));
  readonly buildScenarioButton = this.page.element(by.buttonText('Build a new scenario'));
  readonly pageTitle = this.page.element(by.css('.mat-title'));
  readonly uploadScenarioButton = this.page.element(by.buttonText('Upload existing scenario'));

  get path() { return WelcomePage.path; }

  navigateTo() {
    return browser.get(this.path);
  }
}
