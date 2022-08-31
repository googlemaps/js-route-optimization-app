/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as path from 'path';
import { browser, ExpectedConditions as EC, logging } from 'protractor';
import { AppPage } from '../app.po';
import { UploadModal } from '../upload/upload.po';

describe('Upload Modal', () => {
  let modal: UploadModal;
  let appPage: AppPage;

  beforeEach(() => {
    modal = new UploadModal();
    modal.navigateTo();
    browser.waitForAngular();
    browser.wait(EC.visibilityOf(modal.dialog), 5000);

    appPage = new AppPage();
  });

  it('Should display the dialog', () => {
    expect(modal.dialog.isDisplayed()).toBeTruthy();
  });

  it('Should have the dialog title', () => {
    expect(modal.dialogTitle.getText()).toContain('Upload an existing scenario');
  });

  it('Should display the file display', () => {
    expect(modal.fileDisplay.isDisplayed()).toBeTruthy();
  });

  it('Should have file required validation', () => {
    modal.chooseFileButton.click();
    browser.waitForAngular();

    browser.wait(EC.visibilityOf(modal.error('File is required')), 5000);
    expect(modal.error('File is required').isDisplayed()).toBeTruthy();
  });

  it('Should have invalid file format validation', () => {
    const absolutePath = path.resolve(process.cwd(), 'e2e/src/assets/invalid-file-format.request.json');
    modal.fileInput.sendKeys(absolutePath);
    modal.chooseFileButton.click();
    browser.waitForAngular();

    browser.wait(EC.visibilityOf(modal.error('Invalid file format')), 5000);
    expect(modal.error('Invalid file format').isDisplayed()).toBeTruthy();
  });

  it('Should have invalid request format validation', () => {
    const absolutePath = path.resolve(process.cwd(), 'e2e/src/assets/invalid-request-format.request.json');
    modal.fileInput.sendKeys(absolutePath);
    modal.chooseFileButton.click();
    browser.waitForAngular();

    browser.wait(EC.visibilityOf(modal.error('Invalid request format')), 5000);
    expect(modal.error('Invalid request format').isDisplayed()).toBeTruthy();
  });

  it('Should hide the file input', () => {
    expect(modal.fileInput.isDisplayed()).toBeFalsy();
  });

  it('Should display the choose file button', () => {
    expect(modal.chooseFileButton.isDisplayed()).toBeTruthy();
  });

  it('Should display the cancel link', () => {
    expect(modal.cancelLink.isDisplayed()).toBeTruthy();
  });

  it('Should enable the cancel link', () => {
    expect(modal.cancelLink.isEnabled()).toBeTruthy();
  });

  it('Should close after cancel link clicked', () => {
    modal.cancelLink.click();
    browser.waitForAngular();

    expect(modal.dialog.isPresent()).toBeFalsy();
  });

  it('Should display the OK button', () => {
    expect(modal.okButton.isDisplayed()).toBeTruthy();
  });

  it('Should disable the OK button', () => {
    expect(modal.okButton.isEnabled()).toBeFalsy();
  });

  it('Should close after OK clicked', () => {
    const absolutePath = path.resolve(process.cwd(), 'e2e/src/assets/minimal.request.json');
    modal.fileInput.sendKeys(absolutePath);
    browser.waitForAngular();

    browser.waitForAngularEnabled(false);
    modal.okButton.click();

    browser.wait(EC.not(EC.presenceOf(modal.dialog)), 5000);
    expect(modal.dialog.isPresent()).toBeFalsy()
      .finally(() => browser.waitForAngularEnabled(true));
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
