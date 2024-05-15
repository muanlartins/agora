import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Participant } from 'src/app/models/types/participant';

@Component({
  selector: 'app-create-participant-modal',
  templateUrl: './create-participant-modal.component.html',
  styleUrls: ['./create-participant-modal.component.scss']
})
export class CreateParticipantModalComponent {
  @Input()
  public participant: Participant;

  @Input()
  public isEditing: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { isEditing: boolean, participant: Participant }) {
    if (data) {
      this.isEditing = data.isEditing;
      this.participant = data.participant;
    }
  }

}
