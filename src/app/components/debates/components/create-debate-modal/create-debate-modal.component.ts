import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Debate } from 'src/app/models/types/debate';

@Component({
  selector: 'app-create-debate-modal',
  templateUrl: './create-debate-modal.component.html',
  styleUrls: ['./create-debate-modal.component.scss']
})
export class CreateDebateModalComponent implements OnInit {
  public isEditing: boolean;

  public debate: Debate;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { isEditing: boolean, debate: Debate }) {
    if (data) {
      this.isEditing = data.isEditing;
      this.debate = data.debate;
    }
  }

  ngOnInit(): void {
  }

}
