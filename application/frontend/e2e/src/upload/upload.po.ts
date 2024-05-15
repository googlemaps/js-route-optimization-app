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
