/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { by, element } from 'protractor';
import { AppPage } from '../app.po';
import { WelcomePage } from '../welcome/welcome.po';

export class UploadModal {
  readonly dialog = element(by.tagName('app-upload-dialog'));
  readonly cancelLink = this.dialog.element(by.linkText('Cancel'));
  readonly chooseFileButton = this.dialog.element(by.buttonText('Choose a File'));
  readonly dialogTitle = this.dialog.element(by.css('.mat-dialog-title'));
  readonly fileDisplay = this.dialog.element(by.css('.file-input input:not([type=file])'));
  readonly fileInput = this.dialog.element(by.css('.file-input input[type=file]'));
  readonly okButton = this.dialog.element(by.buttonText('OK'));

  private readonly appPage = new AppPage();
  private readonly welcomePage = new WelcomePage();

  navigateTo() {
    this.appPage.navigateTo();
    this.welcomePage.uploadScenarioButton.click();
  }

  error(text: string) {
    return this.dialog.all(by.tagName('mat-error')).filter(e => e.getText()
      .then(t => {
        return t === text || (t != null && t.includes(text));
      })).get(0);
  }
}
