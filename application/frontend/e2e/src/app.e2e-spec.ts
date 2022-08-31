/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AppPage } from './app.po';
import { browser, logging, ExpectedConditions as EC } from 'protractor';
import { WelcomePage } from './welcome/welcome.po';

describe('App', () => {
  let page: AppPage;
  let welcomePage: WelcomePage;

  beforeEach(() => {
    page = new AppPage();
    page.navigateTo();
    browser.waitForAngular();

    welcomePage = new WelcomePage();
    browser.wait(EC.visibilityOf(welcomePage.page), 5000);
  });

  it('Should redirect to the welcome page', () => {
    expect(welcomePage.page.isDisplayed()).toBeTruthy();
  });

  afterEach(() => {
    // Assert that there are no errors emitted from the browser
    const logs = browser.manage().logs().get(logging.Type.BROWSER)
      .then(entries => entries.filter(entry => !entry.message.includes('API without a key')));
    expect(logs).not.toContain(jasmine.objectContaining({
      level: logging.Level.SEVERE,
    } as logging.Entry));
  });
});
