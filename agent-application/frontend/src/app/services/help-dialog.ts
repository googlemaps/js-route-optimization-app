import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialog } from '../components/ui/help-dialog/help-dialog';

@Injectable({ providedIn: 'root' })
export class HelpDialogService {
  private readonly dialog = inject(MatDialog);

  openHelpDocs() {
    this.dialog.open(HelpDialog, {
      maxHeight: '100%',
      minWidth: '50vw',
      position: { right: '0' },
      panelClass: 'fly-out-dialog',
    });
  }
}
