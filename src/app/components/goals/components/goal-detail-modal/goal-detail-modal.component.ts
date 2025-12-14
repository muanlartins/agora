import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Goal } from 'src/app/models/types/goal';
import { isAdmin } from 'src/app/utils/auth';
import { CreateGoalModalComponent } from '../create-goal-modal/create-goal-modal.component';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { GoalService } from 'src/app/services/goal.service';

@Component({
  selector: 'app-goal-detail-modal',
  templateUrl: './goal-detail-modal.component.html',
  styleUrls: ['./goal-detail-modal.component.scss']
})
export class GoalDetailModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public goal: Goal,
    private dialogRef: MatDialogRef<GoalDetailModalComponent>,
    private dialog: MatDialog,
    private goalService: GoalService
  ) {}

  get isAchieved(): boolean {
    return this.goal.currentCount >= this.goal.totalCount;
  }

  get typeBadgeText(): string {
    return this.goal.type === 'competition' ? 'Competição' : 'Gestão';
  }

  get percentage(): number {
    if (this.goal.totalCount === 0) return 0;
    return Math.min(Math.round((this.goal.currentCount / this.goal.totalCount) * 100), 100);
  }

  isAdmin(): boolean {
    return isAdmin();
  }

  close(): void {
    this.dialogRef.close();
  }

  editGoal(): void {
    this.dialogRef.close();
    this.dialog.open(CreateGoalModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      disableClose: true,
      data: { isEditing: true, goal: this.goal }
    });
  }

  deleteGoal(): void {
    this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: {
        text: `Você tem certeza que quer deletar a meta <b>${this.goal.title}</b>?`,
        positiveCallback: async () => {
          await this.goalService.deleteGoal(this.goal.id);
          this.dialogRef.close();
        },
        negativeCallback: async () => {}
      }
    });
  }
}
