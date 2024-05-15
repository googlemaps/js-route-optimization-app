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

import { WelcomePage } from './welcome.po';
import { browser, logging, ExpectedConditions as EC } from 'protractor';
import { UploadModal } from '../upload/upload.po';

describe('Welcome Page', () => {
  let page: WelcomePage;
  let uploadModal: UploadModal;

  beforeEach(() => {
    page = new WelcomePage();
    page.navigateTo();
    browser.waitForAngular();

    uploadModal = new UploadModal();
  });

  it('Should display the page', () => {
    browser.wait(EC.visibilityOf(page.page), 5000);
    expect(page.page.isDisplayed()).toBeTruthy();
  });

  it('Should have the page title', () => {
    expect(page.pageTitle.getText()).toContain('Cloud Fleet Routing API');
  });

  it('Should display the upload scenario button', () => {
    expect(page.uploadScenarioButton.isDisplayed()).toBeTruthy();
  });

  it('Should display the build scenario button', () => {
    expect(page.buildScenarioButton.isDisplayed()).toBeTruthy();
  });

  it('Should display the upload dialog after upload scenario is clicked', () => {
    page.uploadScenarioButton.click();
    browser.waitForAngular();

    browser.wait(EC.visibilityOf(uploadModal.dialog), 5000);
    expect(uploadModal.dialog.isDisplayed()).toBeTruthy();
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
