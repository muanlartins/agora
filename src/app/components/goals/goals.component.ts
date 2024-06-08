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

    // this.competitionGoals = [
    //   {
    //     title: 'Ganhar 1 Título Major',
    //     currentCount: 2,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Realizar 3 Breaks Major',
    //     currentCount: 5,
    //     totalCount: 3,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Ganhar 3 Títulos Open',
    //     currentCount: 3,
    //     totalCount: 3,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Alcançar 10 Finais Open',
    //     currentCount: 11,
    //     totalCount: 10,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Realizar 10 Breaks Open',
    //     currentCount: 18,
    //     totalCount: 10,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Ganhar 3 Títulos Novice',
    //     currentCount: 2,
    //     totalCount: 3,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Alcançar 5 Finais Novice',
    //     currentCount: 4,
    //     totalCount: 5,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Realizar 5 Breaks Novice',
    //     currentCount: 4,
    //     totalCount: 5,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Participar de 5 CA Teams',
    //     currentCount: 4,
    //     totalCount: 5,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Realizar 10 Breaks de Juízes',
    //     currentCount: 9,
    //     totalCount: 10,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Alcançar 10 vezes Top 10 em campeonatos na categoria Open',
    //     currentCount: 17,
    //     totalCount: 10,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Alcançar 10 vezes Top 10 em campeonatos na categoria Novice',
    //     currentCount: 12,
    //     totalCount: 10,
    //     achieved: false,
    //   },
    // ];



    // this.managementGoals = [
    //   {
    //     title: 'Levar uma dupla da Sociedade de Debates da UFRJ para o WUDC Panamá 2024',
    //     currentCount: 0,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Possuir uma delegação em todos os campeonatos estaduais, regionais e nacional do ano',
    //     currentCount: 0,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Conseguir que a SDUFRJ se torne um Projeto de Extensão',
    //     currentCount: 0,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Realizar ao menos um Debate Misto com cada Sociedade de Debates registrada no Brasil',
    //     currentCount: 0,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Mínimo de 4 Equipes para o Nacional (2° Semestre)',
    //     currentCount: 0,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Patrocínio Particular para Campeonatos',
    //     currentCount: 0,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    //   {
    //     title: 'Banco de Case Files',
    //     currentCount: 0,
    //     totalCount: 1,
    //     achieved: false,
    //   },
    // ];
  }

  public createGoal() {
    this.dialog.open(CreateGoalModalComponent, { width: '70vw', maxHeight: '80vh', autoFocus: false, disableClose: true });
  }

  public editGoal(id: string, event: Event) {
    event.stopPropagation();

    this.dialog.open(CreateGoalModalComponent, { width: '70vw', maxHeight: '80vh', autoFocus: false, disableClose: true, data: {
      isEditing: true,
      goal: this.goals.find((goal) => goal.id === id)
    }});
  }

  public deleteGoal(id: string, event: Event) {
    event.stopPropagation();

    const goal = this.goals.find((goal) => goal.id === id)!;

    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você tem certeza que quer deletar o artigo <b>${goal.title}</b>?`,
      positiveCallback: async () => {
        await this.goalService.deleteGoal(id);
      }
    } });
  }

  public isAdmin() {
    return isAdmin();
  }

  public isGoalAchieved(goal: Goal) {
    return goal.currentCount >= goal.totalCount;
  }
}
