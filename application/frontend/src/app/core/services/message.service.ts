/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

import { MessageSnackBarComponent } from '../components/message-snack-bar/message-snack-bar.component';
import { Store, select } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers';
import * as fromConfig from '../selectors/config.selectors';
import { MessagesConfig } from '../models';
import { map, filter, first, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface MessageOptions {
  duration?: number;
  panelClass?: string[];
  verticalPosition?: MatSnackBarVerticalPosition;
}

/**
 * Represents an interface to display messages to the user
 */
@Injectable({
  providedIn: 'root',
})
export class MessageService {
  readonly messages$: Observable<MessagesConfig>;

  get messages(): MessagesConfig {
    return this._messages;
  }
  private _messages: MessagesConfig = {
    grpcStatusCodes: {},
    unrecognizedError: 'Unrecognized error',
    unrecognizedErrorCode: 'Unrecognized error code',
    noChanges: 'No changes',
    downloadFailure: 'Download Failed',
  };

  constructor(private snackBar: MatSnackBar, private store: Store<fromRoot.State>) {
    this.messages$ = this.store.pipe(
      select(fromConfig.selectMessagesConfig),
      filter((messages) => messages != null),
      first(),
      map((messages) => Object.assign(this._messages, messages)),
      shareReplay(1)
    );

    this.messages$.subscribe();
  }

  error(
    message: string,
    { duration, panelClass, verticalPosition = 'top' }: MessageOptions = {}
  ): void {
    if (!message) {
      message = this._messages.unrecognizedError as string;
    }
    this.showMessage(
      message,
      duration,
      ['error-message'].concat(panelClass || []),
      verticalPosition
    );
  }

  info(
    message: string,
    { duration = 10000, panelClass, verticalPosition = 'bottom' }: MessageOptions = {}
  ): void {
    this.showMessage(
      message,
      duration,
      ['info-message'].concat(panelClass || []),
      verticalPosition
    );
  }

  warning(
    message: string,
    { duration = 10000, panelClass, verticalPosition = 'bottom' }: MessageOptions = {}
  ): void {
    this.showMessage(
      message,
      duration,
      ['warning-message'].concat(panelClass || []),
      verticalPosition
    );
  }

  dismiss(): void {
    this.snackBar.dismiss();
  }

  private showMessage(
    message: string,
    duration?: number,
    panelClass?: string[],
    verticalPosition?: MatSnackBarVerticalPosition
  ): MatSnackBarRef<any> {
    if (!message) {
      return;
    }
    return this.snackBar.openFromComponent(MessageSnackBarComponent, {
      data: message,
      duration,
      horizontalPosition: 'center',
      verticalPosition,
      panelClass,
    });
  }
}
