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
