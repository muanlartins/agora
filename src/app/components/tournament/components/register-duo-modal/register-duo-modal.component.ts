import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Participant } from 'src/app/models/types/participant';
import { ParticipantService } from 'src/app/services/participant.service';

@Component({
  selector: 'app-register-duo-modal',
  templateUrl: './register-duo-modal.component.html',
  styleUrls: ['./register-duo-modal.component.scss']
})
export class RegisterDuoModalComponent implements OnInit {
  public participants: Participant[];

  public participantsOne: Participant[] = [];

  public participantsTwo: Participant[] = [];

  constructor(
    private dialogRef: MatDialogRef<RegisterDuoModalComponent>,
    private participantService: ParticipantService
  ) {

  }

  public ngOnInit(): void {
    this.participantService.getAllParticipants().subscribe((participants) => {
      this.participants = [...participants];
    });
  }

  public drop(event: CdkDragDrop<Participant[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }

  public async registerDuos() {
    await this.participantService.registerDuos(this.participantsOne, this.participantsTwo);

    this.close();
  }

  public close() {
    this.dialogRef.close();
  }
}
