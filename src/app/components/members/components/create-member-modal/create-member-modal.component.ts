import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Member } from 'src/app/models/types/member';

@Component({
  selector: 'app-create-member-modal',
  templateUrl: './create-member-modal.component.html',
  styleUrls: ['./create-member-modal.component.scss']
})
export class CreateMemberModalComponent implements OnInit {
  public isEditing: boolean;

  public member: Member;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { isEditing: boolean, member: Member },
    private dialogRef: MatDialogRef<CreateMemberModalComponent>
  ) {
    if (data) {
      this.isEditing = data.isEditing;
      this.member = data.member;
    }
  }

  ngOnInit(): void {
  }

  close(): void {
    this.dialogRef.close();
  }
}
