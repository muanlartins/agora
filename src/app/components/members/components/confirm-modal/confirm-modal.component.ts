import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent {
  public text: string;

  public positiveCallback: () => {};

  public negativeCallback: () => {};

  public constructor(
    @Inject(MAT_DIALOG_DATA) data: {
      text: string,
      positiveCallback: () => {},
      negativeCallback: () => {}
    },
    private dialogRef: MatDialogRef<ConfirmModalComponent>
  ) {
    this.text = data.text;

    this.positiveCallback = data.positiveCallback;
    this.negativeCallback = data.negativeCallback;
  }

  public async callPositiveCallback() {
    await this.positiveCallback();

    this.dialogRef.close();
  }

  public async callNegativeCallback() {
    await this.negativeCallback();

    this.dialogRef.close();
  }
}
