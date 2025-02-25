import { Component, OnInit } from '@angular/core';
import { Goal } from 'src/app/models/types/goal';
import { GoalService } from 'src/app/services/goal.service';
import { isAdmin } from 'src/app/utils/auth';
import { CreateGoalModalComponent } from './components/create-goal-modal/create-goal-modal.component';
import { ConfirmModalComponent } from '../members/components/confirm-modal/confirm-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {
  public competitionGoals: Goal[];

  public managementGoals: Goal[];

  public goals: Goal[];

  public constructor(private goalService: GoalService, private dialog: MatDialog) {}

  public ngOnInit(): void {
    this.initGoals();
  }

  public initGoals() {
    this.goalService.getAllGoals().subscribe((goals: Goal[]) => {
      this.goals = goals.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase()));
      this.competitionGoals = this.goals.filter((goal: Goal) => goal.type === 'competition');
      this.managementGoals = this.goals.filter((goal: Goal) => goal.type === 'management');
    });
  }

  public createGoal() {
    this.dialog.open(CreateGoalModalComponent, { 
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      autoFocus: false, 
      disableClose: true 
    });
  }

  public editGoal(id: string, event: Event) {
    event.stopPropagation();

    this.dialog.open(CreateGoalModalComponent, { 
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      autoFocus: false, 
      disableClose: true, 
      data: {
        isEditing: true,
        goal: this.goals.find((goal) => goal.id === id)
      }
    });
  }

  public deleteGoal(id: string, event: Event) {
    event.stopPropagation();

    const goal = this.goals.find((goal) => goal.id === id)!;

    this.dialog.open(ConfirmModalComponent, { 
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      data: {
        text: `Você tem certeza que quer deletar o artigo <b>${goal.title}</b>?`,
        positiveCallback: async () => {
          await this.goalService.deleteGoal(id);
        },
        negativeCallback: async () => {}
      } 
    });
  }

  public isAdmin() {
    return isAdmin();
  }

  public isGoalAchieved(goal: Goal) {
    return goal.currentCount >= goal.totalCount;
  }
}
