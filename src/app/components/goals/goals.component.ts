import { Component, OnInit } from '@angular/core';
import { Goal } from 'src/app/models/types/goal';
import { isAdmin } from 'src/app/utils/auth';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {
  public competitiveGoals: Goal[];

  public managementGoals: Goal[];

  public constructor() {}

  public ngOnInit(): void {
    this.initGoals();
  }

  public initGoals() {
    this.competitiveGoals = [
      {
        title: 'Ganhar 1 Título Major',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
      {
        title: 'Realizar 3 Breaks Major',
        currentCount: 0,
        totalCount: 3,
        achieved: false,
      },
      {
        title: 'Ganhar 3 Títulos Open',
        currentCount: 1,
        totalCount: 3,
        achieved: false,
      },
      {
        title: 'Alcançar 10 Finais Open',
        currentCount: 6,
        totalCount: 10,
        achieved: false,
      },
      {
        title: 'Realizar 10 Breaks Open',
        currentCount: 8,
        totalCount: 10,
        achieved: false,
      },
      {
        title: 'Ganhar 3 Títulos Novice',
        currentCount: 1,
        totalCount: 3,
        achieved: false,
      },
      {
        title: 'Alcançar 5 Finais Novice',
        currentCount: 1,
        totalCount: 5,
        achieved: false,
      },
      {
        title: 'Realizar 5 Breaks Novice',
        currentCount: 1,
        totalCount: 5,
        achieved: false,
      },
      {
        title: 'Participar de 5 CA Teams',
        currentCount: 1,
        totalCount: 5,
        achieved: false,
      },
      {
        title: 'Realizar 10 Breaks de Juízes',
        currentCount: 3,
        totalCount: 10,
        achieved: false,
      },
      {
        title: 'Alcançar 10 vezes Top 10 em campeonatos na categoria Open',
        currentCount: 9,
        totalCount: 10,
        achieved: false,
      },
      {
        title: 'Alcançar 10 vezes Top 10 em campeonatos na categoria Novice',
        currentCount: 4,
        totalCount: 10,
        achieved: false,
      },
    ];

    this.managementGoals = [
      {
        title: 'Levar uma dupla da Sociedade de Debates da UFRJ para o WUDC Panamá 2024',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
      {
        title: 'Possuir uma delegação em todos os campeonatos estaduais, regionais e nacional do ano',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
      {
        title: 'Conseguir que a SDUFRJ se torne um Projeto de Extensão',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
      {
        title: 'Realizar ao menos um Debate Misto com cada Sociedade de Debates registrada no Brasil',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
      {
        title: 'Mínimo de 4 Equipes para o Nacional (2° Semestre)',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
      {
        title: 'Patrocínio Particular para Campeonatos',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
      {
        title: 'Banco de Case Files',
        currentCount: 0,
        totalCount: 1,
        achieved: false,
      },
    ];
  }

  public isAdmin() {
    return isAdmin();
  }
}
