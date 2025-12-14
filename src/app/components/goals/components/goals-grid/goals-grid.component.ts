import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Goal } from 'src/app/models/types/goal';
import { GoalService } from 'src/app/services/goal.service';
import { isAdmin } from 'src/app/utils/auth';
import { CreateGoalModalComponent } from '../create-goal-modal/create-goal-modal.component';
import { GoalDetailModalComponent } from '../goal-detail-modal/goal-detail-modal.component';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-goals-grid',
  templateUrl: './goals-grid.component.html',
  styleUrls: ['./goals-grid.component.scss']
})
export class GoalsGridComponent implements OnInit {
  form: FormGroup;
  goals: Goal[] = [];
  filteredGoals: Goal[] = [];

  typeOptions = [
    { value: '', viewValue: 'Todos' },
    { value: 'competition', viewValue: 'Competição' },
    { value: 'management', viewValue: 'Gestão' }
  ];

  constructor(
    private formBuilder: FormBuilder,
    private goalService: GoalService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadGoals();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      type: ['']
    });

    this.form.controls['type'].valueChanges.subscribe((type) => {
      this.filterGoals(type);
    });
  }

  private loadGoals(): void {
    this.goalService.getAllGoals().subscribe((goals) => {
      this.goals = goals.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );
      this.filterGoals(this.form.controls['type'].value);
    });
  }

  private filterGoals(type: string): void {
    if (!type) {
      // If admin, show all. If not admin, only show competition goals
      if (this.isAdmin()) {
        this.filteredGoals = this.goals;
      } else {
        this.filteredGoals = this.goals.filter(g => g.type === 'competition');
      }
    } else {
      this.filteredGoals = this.goals.filter(g => g.type === type);
    }
  }

  get goalCount(): number {
    return this.filteredGoals.length;
  }

  get visibleTypeOptions() {
    if (this.isAdmin()) {
      return this.typeOptions;
    }
    // Non-admins only see competition goals, so no filter needed
    return [];
  }

  isAdmin(): boolean {
    return isAdmin();
  }

  createGoal(): void {
    this.dialog.open(CreateGoalModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      disableClose: true
    });
  }

  openGoalDetail(goal: Goal): void {
    this.dialog.open(GoalDetailModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: goal
    });
  }

  editGoal(id: string): void {
    const goal = this.goals.find(g => g.id === id);
    this.dialog.open(CreateGoalModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      autoFocus: false,
      disableClose: true,
      data: { isEditing: true, goal }
    });
  }

  deleteGoal(id: string): void {
    const goal = this.goals.find(g => g.id === id);
    if (!goal) return;

    this.dialog.open(ConfirmModalComponent, {
      width: '400px',
      maxWidth: '90vw',
      data: {
        text: `Você tem certeza que quer deletar a meta <b>${goal.title}</b>?`,
        positiveCallback: async () => {
          await this.goalService.deleteGoal(id);
        },
        negativeCallback: async () => {}
      }
    });
  }
}
