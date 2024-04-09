import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  public text: string;

  public callback: () => {};

  public constructor(
    @Inject(MAT_DIALOG_DATA) data: { text: string, callback: () => {} },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ConfirmModalComponent>
  ) {
    this.text = data.text;

    this.callback = data.callback;
  }

  public async callCallback() {
    await this.callback();

    this.dialogRef.close();
  }
}
