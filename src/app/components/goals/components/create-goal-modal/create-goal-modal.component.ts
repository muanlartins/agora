import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Goal } from 'src/app/models/types/goal';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-create-goal-modal',
  templateUrl: './create-goal-modal.component.html',
  styleUrls: ['./create-goal-modal.component.scss']
})
export class CreateGoalModalComponent {
  public isEditing: boolean;
  public goal: Goal;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { isEditing: boolean, goal: Goal },
    private dialog: MatDialog
  ) {
    if (data) {
      this.isEditing = data.isEditing;
      this.goal = data.goal;
    }
  }

  closeModal(): void {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        text: `Você <b>poderá perder</b> qualquer mudança <b>não salva</b>! Tem certeza que quer continuar?`,
        positiveCallback: () => {
          this.dialog.closeAll();
        },
      }
    });
  }
}
