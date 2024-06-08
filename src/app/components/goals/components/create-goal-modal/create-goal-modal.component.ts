import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Goal } from 'src/app/models/types/goal';

@Component({
  selector: 'app-create-goal-modal',
  templateUrl: './create-goal-modal.component.html',
  styleUrls: ['./create-goal-modal.component.scss']
})
export class CreateGoalModalComponent {
  public isEditing: boolean;

  public goal: Goal;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { isEditing: boolean, goal: Goal }) {
    if (data) {
      this.isEditing = data.isEditing;
      this.goal = data.goal;
    }
  }
}
