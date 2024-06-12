import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Query, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart, ChartType, scales } from 'chart.js';
import { combineLatest } from 'rxjs';
import { Article } from 'src/app/models/types/article';
import { Debate } from 'src/app/models/types/debate';
import { Member } from 'src/app/models/types/member';
import { SelectOption } from 'src/app/models/types/select-option';
import { ArticleService } from 'src/app/services/article.service';
import { DebateService } from 'src/app/services/debate.service';
import { MemberService } from 'src/app/services/member.service';
import { GoalService } from 'src/app/services/goal.service';
import { Goal } from 'src/app/models/types/goal';
import { UtilService } from 'src/app/services/util.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MONTHS, placementColors } from 'src/app/utils/constants';
import * as moment from 'moment';

type Rank = {
  title: string;
  disclaimer?: string;
  placements: {
    title: string;
    members: Member[];
    value: number;
  }[];
};

type Statistic = {
  title: string;
  fields: {
    title: string;
    description?: string;
    chart?: boolean;
    full?: boolean;
  }[];
};

const options = {
  maintainAspectRatio: false,
};

const doughnutOptions = {
  maintainAspectRatio: false,
  scales: {
    x: {
      display: false
    },
    y: {
      display: false
    }
  }
};

Chart.defaults.color = '#D9D9D9';
Chart.defaults.borderColor = '#D9D9D920';

const barBackgroundColor = '#906E2E';
const doughnutBackgroundColor = ['#FFC040', '#906E2E']

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  public form: FormGroup;

  public charts: Chart[] = [];

  public members: Member[] = [];

  public filteredMembers: Member[] = [];

  public debates: Debate[] = [];

  public filteredDebates: Debate[] = [];

  public articles: Article[] = [];

  public goals: Goal[] = [];

  public societyOptions: SelectOption[] = [];

  public psOptions: SelectOption[] = [];

  public ranks: Rank[] = [];

  public statistics: Statistic[] = [];

  @ViewChildren('chart')
  public chartRefs: QueryList<ElementRef<HTMLCanvasElement>>;

  public get loading() {
    return this.loadingService.loading$.value;
  }

  constructor(
    private memberService: MemberService,
    private debateService: DebateService,
    private articleService: ArticleService,
    private goalService: GoalService,
    private utilService: UtilService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
  }

  public initForm() {
    this.form = this.formBuilder.group({
      society: ['SDUFRJ'],
      ps: ['']
    });

    this.subscribeToValueChanges();
  }

  public subscribeToValueChanges() {
    this.form.valueChanges.subscribe(() => {
      this.filterDebatesAndMembers();
    });
  }

  public filterDebatesAndMembers() {
    const society = this.form.controls['society'].value;
    const ps = this.form.controls['ps'].value;

    this.filteredDebates = this.debates;
    this.filteredMembers = this.members.filter((member) => !member.blocked);

    if (society) {
      this.filteredDebates = this.utilService.getDebatesWithSociety(this.filteredDebates, society);
      this.filteredMembers = this.utilService.getMembersFromSociety(this.filteredMembers, society);
    }

    if (ps) {
      this.filteredDebates = this.utilService.getDebatesWithPs(this.filteredDebates, ps);
      this.filteredMembers = this.utilService.getMembersFromPs(this.filteredMembers, ps);
    }

    this.initRanks();
    this.initStatistics();
    setTimeout(() => this.generateCharts(), 1000);
  }

  public initOptions() {
    this.societyOptions = [...new Set(this.members.map((member) => member.society))].map((society) => ({
      value: society,
      viewValue: society
    }));

    this.psOptions = [{
      value: '2024.1',
      viewValue: '2024.1'
    }];
  }

  public generateCharts() {
    if (!this.chartRefs) return;
    this.ngOnDestroy();

    // Trainings Venue Pie Chart

    this.charts.push(new Chart(this.chartRefs.toArray()[0].nativeElement, {
      options: doughnutOptions,
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Remoto', 'Presencial'],
        datasets: [
          {
            type: 'doughnut',
            label: 'Quantidade',
            data: [
              this.filteredDebates.filter((debate) => debate.venue === 'remote').length,
              this.filteredDebates.filter((debate) => debate.venue === 'inPerson').length
            ],
            backgroundColor: doughnutBackgroundColor
          },
        ],
      }
    }));

    // Trainings Frequency By Time Bar Chart

    const uniqueTimeValues = [...new Set(this.filteredDebates.map((debate) => debate.time))]
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    this.charts.push(new Chart(this.chartRefs.toArray()[1].nativeElement, {
      options,
      type: 'bar' as ChartType,
      data: {
        labels: uniqueTimeValues,
        datasets: [
          {
            label: 'Quantidade',
            data: uniqueTimeValues.map((time) => this.filteredDebates.filter((debate) => debate.time === time).length),
            backgroundColor: barBackgroundColor
          },
        ],
      }
    }));

    // Trainings Frequency By Month Bar Chart

    const debatesFrequencyByMonth: number[] = [];
    MONTHS.forEach(() => debatesFrequencyByMonth.push(0));

    this.filteredDebates.forEach((debate) => debatesFrequencyByMonth[moment(debate.date).month()]++);

    this.charts.push(new Chart(this.chartRefs.toArray()[2].nativeElement, {
      options,
      type: 'bar' as ChartType,
      data: {
        labels: MONTHS.slice(0, new Date().getMonth()+1),
        datasets: [
          {
            label: 'Quantidade',
            data: debatesFrequencyByMonth,
            backgroundColor: barBackgroundColor,
          },
        ],
      }
    }));

    // Proportion of Debaters By Scoiety Doughnut Chart

    const debatersFrequencyBySociety: { [society: string]: number } = {};
    debatersFrequencyBySociety['SDUFRJ'] = 0;
    debatersFrequencyBySociety['Outras'] = 0;

    this.filteredDebates.forEach((debate) => debate.debaters.forEach((debater) =>
      debatersFrequencyBySociety[debater.society === 'SDUFRJ' ? 'SDUFRJ' : 'Outras']++
    ));

    this.charts.push(new Chart(this.chartRefs.toArray()[3].nativeElement, {
      options: doughnutOptions,
      type: 'doughnut' as ChartType,
      data: {
        labels: ['SDUFRJ', 'Outras'],
        datasets: [
          {
            label: 'Quantidade',
            data: [debatersFrequencyBySociety['SDUFRJ'], debatersFrequencyBySociety['Outras']],
            backgroundColor: doughnutBackgroundColor,
          },
        ],
      }
    }));

    // Proportion of Judges By Society Doughnut Chart

    const judgesFrequencyBySociety: { [society: string]: number } = {};
    judgesFrequencyBySociety['SDUFRJ'] = 0;
    judgesFrequencyBySociety['Outras'] = 0;

    this.filteredDebates.forEach((debate) => {
      if (debate.wings && debate.wings.length)
        debate.wings.forEach((wing) =>
          judgesFrequencyBySociety[wing.society === 'SDUFRJ' ? 'SDUFRJ' : 'Outras']++
        );
      judgesFrequencyBySociety[debate.chair.society === 'SDUFRJ' ? 'SDUFRJ' : 'Outras']++
    });

    this.charts.push(new Chart(this.chartRefs.toArray()[4].nativeElement, {
      options: doughnutOptions,
      type: 'doughnut' as ChartType,
      data: {
        labels: ['SDUFRJ', 'Outras'],
        datasets: [
          {
            label: 'Quantidade',
            data: [judgesFrequencyBySociety['SDUFRJ'], judgesFrequencyBySociety['Outras']],
            backgroundColor: doughnutBackgroundColor,
          },
        ],
      }
    }));

    // Active Members Bar Chart

    const participations: { [id: string]: number } = {};

    this.filteredMembers.forEach((member) => participations[member.id] = this.filteredDebates.reduce((prev, curr) =>
      prev + (
        curr.debaters.some((debater) => debater.id === member.id) ||
        curr.chair.id === member.id ||
        (curr.wings && curr.wings.length && curr.wings.some((wing) => wing.id === member.id))
        ? 1 : 0
      ), 0
    ));

    const activeMembers = this.filteredMembers.filter((member) => participations[member.id] >= 5);

    this.filteredMembers.forEach((member) => {
      if (participations[member.id] < 5) delete participations[member.id]
    });

    const labels = Object.entries(participations).sort((a, b) => b[1] - a[1]).map((entry) => activeMembers.find((member) => member.id === entry[0])!.name);
    const data = Object.entries(participations).sort((a, b) => b[1] - a[1]).map((entry) => entry[1]);

    this.charts.push(new Chart(this.chartRefs.toArray()[5].nativeElement, {
      options,
      type: 'bar' as ChartType,
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Quantidade',
            data: data,
            backgroundColor: barBackgroundColor,
          },
        ],
      }
    }));

    // Goals Achieved Proportion Doughnut Chart

    const goalsAchievedFrequency: { [id: string]: number } = {};
    goalsAchievedFrequency['achieved'] = 0;
    goalsAchievedFrequency['non-achieved'] = 0;

    this.goals.forEach((goal) => {
      if (goal.currentCount >= goal.totalCount) goalsAchievedFrequency['achieved']++;
      else goalsAchievedFrequency['non-achieved']++;
    });

    this.charts.push(new Chart(this.chartRefs.toArray()[6].nativeElement, {
      options: doughnutOptions,
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Atingidas', 'Não Atingidas'],
        datasets: [
          {
            label: 'Quantidade',
            data: [goalsAchievedFrequency['achieved'], goalsAchievedFrequency['non-achieved']],
            backgroundColor: doughnutBackgroundColor,
          },
        ],
      }
    }));

    // Partner Societies Bar Chart

    const frequencyBySociety: { [society: string]: number } = {};

    [...new Set(this.members.map((member) => member.society))].forEach((society) => frequencyBySociety[society] = 0);

    this.filteredDebates.forEach((debate) => {
      if (debate.wings && debate.wings.length)
        debate.wings.forEach((wing) =>
          frequencyBySociety[wing.society]++
        );
      frequencyBySociety[debate.chair.society]++;
      debate.debaters.forEach((debater) => frequencyBySociety[debater.society]++);
    });

    this.charts.push(new Chart(this.chartRefs.toArray()[7].nativeElement, {
      options,
      type: 'bar' as ChartType,
      data: {
        labels: Object.entries(frequencyBySociety).filter((entry) => entry[0] !== 'SDUFRJ').sort((a, b) => b[1]-a[1]).map((entry) => entry[0]),
        datasets: [
          {
            label: 'Quantidade',
            data: Object.entries(frequencyBySociety).filter((entry) => entry[0] !== 'SDUFRJ').sort((a, b) => b[1]-a[1]).map((entry) => entry[1]),
            backgroundColor: barBackgroundColor,
          },
        ],
      }
    }));

    // Results By House Bar Chart

    const og = [0, 0, 0, 0];
    const oo = [0, 0, 0, 0];
    const cg = [0, 0, 0, 0];
    const co = [0, 0, 0, 0];

    this.filteredDebates.forEach((debate) => {
      og[3 - debate.points[0]] ++;
      oo[3 - debate.points[1]] ++;
      cg[3 - debate.points[2]] ++;
      co[3 - debate.points[3]] ++;
    });

    const firsts = [og[0], oo[0], cg[0], co[0]];
    const seconds = [og[1], oo[1], cg[1], co[1]];
    const thirds = [og[2], oo[2], cg[2], co[2]];
    const fourths = [og[3], oo[3], cg[3], co[3]];

    this.charts.push(new Chart(this.chartRefs.toArray()[8].nativeElement, {
      options,
      data: {
        labels: ['1G', '1O', '2G', '2O'],
        datasets: [
          {
            type: 'bar',
            label: 'Primeiros',
            data: firsts,
            backgroundColor: placementColors[0]
          },
          {
            type: 'bar',
            label: 'Segundos',
            data: seconds,
            backgroundColor: placementColors[1]
          },
          {
            type: 'bar',
            label: 'Terceiros',
            data: thirds,
            backgroundColor: placementColors[2]
          },
          {
            type: 'bar',
            label: 'Quartos',
            data: fourths,
            backgroundColor: placementColors[3]
          },
        ],
      }
    }));
  }

  public getData() {
    combineLatest([
      this.memberService.getAllMembers(),
      this.debateService.getAllDebates(),
      this.articleService.getAllArticles(),
      this.goalService.getAllGoals()
    ]).subscribe(([members, debates, articles, goals]) => {
      if (
        members && members.length &&
        debates && debates.length &&
        articles && articles.length &&
        goals && goals.length
      ) {
        this.members = members;
        this.debates = debates;
        this.filteredDebates = debates;
        this.articles = articles;
        this.goals = goals;

        this.initOptions();
        this.filterDebatesAndMembers();
        setTimeout(() => this.generateCharts(), 1000);
      }
    });
  }

  public initRanks() {
    this.ranks = [];

    // Most Firsts

    const firsts: { [id: string]: number } = {};
    this.filteredMembers.forEach((member) => firsts[member.id] = 0);

    this.filteredDebates.forEach((debate) => {
      const winnerIndex = debate.points.findIndex((point) => point === 3);

      firsts[debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(winnerIndex)].id] ++;
      if (
        debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(winnerIndex)].id !==
        debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(winnerIndex) + 2].id
      )
        firsts[debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(winnerIndex) + 2].id] ++;
    });

    const uniqueFirstsValues = [...new Set(Object.values(firsts))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Debatedores que mais <b>primeiraram</b>',
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com <b>${uniqueFirstsValues[0]}</b> primeiro${uniqueFirstsValues[0] !== 1 ? 's' : ''}`,
          members: this.filteredMembers.filter((member) => firsts[member.id] === uniqueFirstsValues[0]),
          value: uniqueFirstsValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com <b>${uniqueFirstsValues[1]}</b> primeiro${uniqueFirstsValues[1] !== 1 ? 's' : ''}`,
          members: this.filteredMembers.filter((member) => firsts[member.id] === uniqueFirstsValues[1]),
          value: uniqueFirstsValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com <b>${uniqueFirstsValues[2]}</b> primeiro${uniqueFirstsValues[2] !== 1 ? 's' : ''}`,
          members: this.filteredMembers.filter((member) => firsts[member.id] === uniqueFirstsValues[2]),
          value: uniqueFirstsValues[2]
        },
      ]
    });

    // Higher Firsts Average

    const participationsAsDebater: { [id: string]: number } = {};

    this.filteredMembers.forEach((member) => participationsAsDebater[member.id] = this.filteredDebates.reduce((prev, curr) =>
      prev + (curr.debaters.some((debater) => debater.id === member.id) ? 1 : 0), 0
    ));

    const activeMembers = this.filteredMembers.filter((member) => participationsAsDebater[member.id] >= 5);

    const firstsAverage: { [id: string]: number } = {}
    activeMembers.forEach((member) => {
      firstsAverage[member.id] = firsts[member.id]/participationsAsDebater[member.id];
    });

    const uniqueFirstsAverageValues = [...new Set(Object.values(firstsAverage))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Debatedores com a maior <b>média</b>¹ de <b>primeiros</b>',
      disclaimer: '<b>¹</b> Apenas membros com <b>5</b> ou mais debates registrados entram para esse ranking',
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com uma média de <b>${Number(uniqueFirstsAverageValues[0].toFixed(2))*100}%</b> de primeiros`,
          members: activeMembers.filter((member) => firstsAverage[member.id] === uniqueFirstsAverageValues[0]),
          value: uniqueFirstsAverageValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com uma média de <b>${Number(uniqueFirstsAverageValues[1].toFixed(2))*100}%</b> de primeiros`,
          members: activeMembers.filter((member) => firstsAverage[member.id] === uniqueFirstsAverageValues[1]),
          value: uniqueFirstsAverageValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com uma média de <b>${Number(uniqueFirstsAverageValues[2].toFixed(2))*100}%</b> de primeiros`,
          members: activeMembers.filter((member) => firstsAverage[member.id] === uniqueFirstsAverageValues[2]),
          value: uniqueFirstsAverageValues[2]
        },
      ]
    });

    // Most Wins (firsts and seconds)

    const wins: { [id: string]: number } = {};
    this.filteredMembers.forEach((member) => wins[member.id] = 0);

    this.filteredDebates.forEach((debate) => {
      const firstPlaceIndex = debate.points.findIndex((point) => point === 3);
      const secondPlaceIndex = debate.points.findIndex((point) => point === 2);

      wins[debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(firstPlaceIndex)].id] ++;
      if (
        debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(firstPlaceIndex)].id !==
        debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(firstPlaceIndex) + 2].id
      )
        wins[debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(firstPlaceIndex) + 2].id] ++;
      wins[debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(secondPlaceIndex)].id] ++;
      if (
        debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(secondPlaceIndex)].id !==
        debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(secondPlaceIndex) + 2].id
      )
      wins[debate.debaters[this.utilService.getFirstDebaterIndexByHouseIndex(secondPlaceIndex) + 2].id] ++;
    });

    const uniqueWinsValues = [...new Set(Object.values(wins))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Debatedores que mais <b>ganharam</b>¹',
      disclaimer: '<b>¹</b> Ganhar é <b>primeirar ou segundar</b>',
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com <b>${uniqueWinsValues[0]}</b> vitória${uniqueWinsValues[0] !== 1 ? 's' : ''}`,
          members: this.filteredMembers.filter((member) => wins[member.id] === uniqueWinsValues[0]),
          value: uniqueWinsValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com <b>${uniqueWinsValues[1]}</b> vitória${uniqueWinsValues[1] !== 1 ? 's' : ''}`,
          members: this.filteredMembers.filter((member) => wins[member.id] === uniqueWinsValues[1]),
          value: uniqueWinsValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com <b>${uniqueWinsValues[2]}</b> vitória${uniqueWinsValues[2] !== 1 ? 's' : ''}`,
          members: this.filteredMembers.filter((member) => wins[member.id] === uniqueWinsValues[2]),
          value: uniqueWinsValues[2]
        },
      ]
    });

    // Higher Wins Average

    const winsAverage: { [id: string]: number } = {}
    activeMembers.forEach((member) => {
      winsAverage[member.id] = wins[member.id]/participationsAsDebater[member.id];
    });

    const uniqueWinsAverageValues = [...new Set(Object.values(winsAverage))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Debatedores com a maior <b>média</b>¹ de <b>vitórias</b>²',
      disclaimer: `
        <b>¹</b> Apenas membros com <b>5</b> ou mais debates registrados entram para esse ranking<br>
        <b>²</b> Ganhar é <b>primeirar ou segundar</b>
      `,
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com uma média de <b>${Number(uniqueWinsAverageValues[0].toFixed(2))*100}%</b> de vitórias`,
          members: activeMembers.filter((member) => winsAverage[member.id] === uniqueWinsAverageValues[0]),
          value: uniqueWinsAverageValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com uma média de <b>${Number(uniqueWinsAverageValues[1].toFixed(2))*100}%</b> de vitórias`,
          members: activeMembers.filter((member) => winsAverage[member.id] === uniqueWinsAverageValues[1]),
          value: uniqueWinsAverageValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com uma média de <b>${Number(uniqueWinsAverageValues[2].toFixed(2))*100}%</b> de vitórias`,
          members: activeMembers.filter((member) => winsAverage[member.id] === uniqueWinsAverageValues[2]),
          value: uniqueWinsAverageValues[2]
        },
      ]
    });

    // Most Active Debaters

    const uniqueParticipationsAsDebaterValues = [...new Set(Object.values(participationsAsDebater))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Debatedores mais <b>ativos</b>¹',
      disclaimer: `
        <b>¹</b> Participação nos debates
      `,
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com <b>${uniqueParticipationsAsDebaterValues[0]}</b> ${uniqueParticipationsAsDebaterValues[0] !== 1 ? 'participações' : 'participação'}`,
          members: this.filteredMembers.filter((member) => participationsAsDebater[member.id] === uniqueParticipationsAsDebaterValues[0]),
          value: uniqueParticipationsAsDebaterValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com <b>${uniqueParticipationsAsDebaterValues[1]}</b> ${uniqueParticipationsAsDebaterValues[1] !== 1 ? 'participações' : 'participação'}`,
          members: this.filteredMembers.filter((member) => participationsAsDebater[member.id] === uniqueParticipationsAsDebaterValues[1]),
          value: uniqueParticipationsAsDebaterValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com <b>${uniqueParticipationsAsDebaterValues[2]}</b> ${uniqueParticipationsAsDebaterValues[2] !== 1 ? 'participações' : 'participação'}`,
          members: this.filteredMembers.filter((member) => participationsAsDebater[member.id] === uniqueParticipationsAsDebaterValues[2]),
          value: uniqueParticipationsAsDebaterValues[2]
        },
      ]
    });

    // Most Active Judges

    const participationsAsJudge: { [id: string]: number } = {};

    this.filteredMembers.forEach((member) => participationsAsJudge[member.id] = this.filteredDebates.reduce((prev, curr) =>
      prev + ((curr.wings && curr.wings.some((debater) => debater.id === member.id)) || curr.chair.id === member.id ? 1 : 0), 0
    ));

    const uniqueParticipationsAsJudgeValues = [...new Set(Object.values(participationsAsJudge))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Juízes mais <b>ativos</b>¹',
      disclaimer: `
        <b>¹</b> Participação nos debates
      `,
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com <b>${uniqueParticipationsAsJudgeValues[0]}</b> ${uniqueParticipationsAsJudgeValues[0] !== 1 ? 'participações' : 'participação'}`,
          members: this.filteredMembers.filter((member) => participationsAsJudge[member.id] === uniqueParticipationsAsJudgeValues[0]),
          value: uniqueParticipationsAsJudgeValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com <b>${uniqueParticipationsAsJudgeValues[1]}</b> ${uniqueParticipationsAsJudgeValues[1] !== 1 ? 'participações' : 'participação'}`,
          members: this.filteredMembers.filter((member) => participationsAsJudge[member.id] === uniqueParticipationsAsJudgeValues[1]),
          value: uniqueParticipationsAsJudgeValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com <b>${uniqueParticipationsAsJudgeValues[2]}</b> ${uniqueParticipationsAsJudgeValues[2] !== 1 ? 'participações' : 'participação'}`,
          members: this.filteredMembers.filter((member) => participationsAsJudge[member.id] === uniqueParticipationsAsJudgeValues[2]),
          value: uniqueParticipationsAsJudgeValues[2]
        },
      ]
    });

    // Highest SPs Average

    const participationsAsDebaterIncludingIron: { [id: string]: number } = {};
    Object.keys(participationsAsDebater).forEach((id) => participationsAsDebaterIncludingIron[id] = participationsAsDebater[id]);

    this.filteredDebates.forEach((debate) => [...new Set(debate.debaters)].forEach((debater) => {
      if (this.utilService.isDebaterIronOnDebate(debate, debater)) participationsAsDebaterIncludingIron[debater.id] ++;
    }));

    const spsAverage: { [id: string]: number } = {};

    activeMembers.forEach((member) => spsAverage[member.id] = 0);

    this.filteredDebates.forEach((debate) => debate.debaters.forEach((debater, index) => {
      if (debate.sps && debate.sps.length) {
        if (index-2 >= 0 && debate.debaters[index-2].id === debate.debaters[index].id) return;

        spsAverage[debater.id] += debate.sps[index];
      }
    }));

    activeMembers.forEach((member) => spsAverage[member.id] /= participationsAsDebater[member.id]);

    const uniqueSpsAverageValues = [...new Set(Object.values(spsAverage))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Maiores <b>médias</b>¹ de <b>Speaker Points</b>',
      disclaimer: `
        <b>¹</b> Apenas membros com <b>5</b> ou mais debates registrados entram para esse ranking
      `,
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com uma média de <b>${uniqueSpsAverageValues[0].toFixed(2)}</b> speaker points`,
          members: activeMembers.filter((member) => spsAverage[member.id] === uniqueSpsAverageValues[0]),
          value: uniqueSpsAverageValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com uma média de <b>${uniqueSpsAverageValues[1].toFixed(2)}</b> speaker points`,
          members: activeMembers.filter((member) => spsAverage[member.id] === uniqueSpsAverageValues[1]),
          value: uniqueSpsAverageValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com uma média de <b>${uniqueSpsAverageValues[2].toFixed(2)}</b> speaker points`,
          members: activeMembers.filter((member) => spsAverage[member.id] === uniqueSpsAverageValues[2]),
          value: uniqueSpsAverageValues[2]
        },
      ]
    });

    // Highest Highest SPs

    const highestSps: { [id: string]: number } = {};

    activeMembers.forEach((member) => highestSps[member.id] = 0);

    this.filteredDebates.forEach((debate) => debate.debaters.forEach((debater, index) => {
      if (debate.sps && debate.sps.length)
        highestSps[debater.id] = Math.max(debate.sps[index], highestSps[debater.id]);
    }));

    const uniqueHighestSpsValues = [...new Set(Object.values(highestSps))].sort((a, b) => b-a);

    this.ranks.push({
      title: 'Maiores¹ <b>Speaker Points absolutos</b>',
      disclaimer: `
        <b>¹</b> Apenas membros com <b>5</b> ou mais debates registrados entram para esse ranking
      `,
      placements: [
        {
          title: `Em <b>primeiro</b> lugar, com <b>${uniqueHighestSpsValues[0]}</b> speaker points`,
          members: activeMembers.filter((member) => highestSps[member.id] === uniqueHighestSpsValues[0]),
          value: uniqueHighestSpsValues[0]
        },
        {
          title: `Em <b>segundo</b> lugar, com <b>${uniqueHighestSpsValues[1]}</b> speaker points`,
          members: activeMembers.filter((member) => highestSps[member.id] === uniqueHighestSpsValues[1]),
          value: uniqueHighestSpsValues[1]
        },
        {
          title: `Em <b>terceiro</b> lugar, com <b>${uniqueHighestSpsValues[2]}</b> speaker points`,
          members: activeMembers.filter((member) => highestSps[member.id] === uniqueHighestSpsValues[2]),
          value: uniqueHighestSpsValues[2]
        },
      ]
    });

    this.ranks.forEach((rank) => rank.placements = rank.placements.filter((placement) => !!placement.value))
  }

  public initStatistics() {
    this.statistics = [];

    // Trainings

    this.statistics.push({
      title: `Foram realizados <b>${this.filteredDebates.length} Treinos</b>`,
      fields: [
        {
          title: 'Frequência dos Treinos por <b>Horário</b>',
          chart: true,
        },
        {
          title: 'Frequência dos Treinos por <b>Mês</b>',
          chart: true,
        },
        {
          title: 'Proporção de Treinos <b>Presenciais</b>',
          chart: true,
        },
        {
          title: 'Proporção de <b>Debatedores</b> por <b>Sociedade</b>',
          chart: true,
        },
        {
          title: 'Proporção de <b>Juízes</b> por <b>Sociedade</b>',
          chart: true,
        }
      ]
    });

    // Active Members

    this.statistics.push({
      title: `Temos <b>${
        this.filteredMembers.filter((member) => this.filteredDebates.reduce((prev, curr) =>
          prev + (
            curr.debaters.some((debater) => debater.id === member.id) ||
            curr.chair.id === member.id ||
            (curr.wings && curr.wings.length && curr.wings.some((wing) => wing.id === member.id))
            ? 1 : 0
          ), 0) >= 5
        ).length
      } membros ativos</b> atualmente`,
      fields: [
        {
          title: '<b>Atividade</b> dos Membros',
          chart: true,
          full: true
        },
      ]
    });

    // Goals

    this.statistics.push({
      title: `Atingimos <b>${this.goals.filter((goal) => goal.currentCount >= goal.totalCount).length} Metas</b> de <b>${this.goals.length}</b>`,
      fields: [
        {
          title: 'Proporção de <b>Metas Atingidas</b>',
          chart: true,
          full: true
        }
      ]
    });

    // Partner Society

    this.statistics.push({
      title: `Sociedades <b>Parceiras</b>`,
      fields: [
        {
          title: 'Frequência de Participação das Sociedades',
          chart: true,
          full: true
        }
      ]
    });

    // General Statistics

    this.statistics.push({
      title: `Estatísticas <b>Gerais</b> dos Debates`,
      fields: [
        {
          title: 'Resultado dos Debates (por casa)',
          chart: true,
          full: true
        },
      ]
    });
  }

  public getPfpSizeByIndex(index: number) {
    return 128 - 16*index;
  }

  public getIconNameByIndex(index: number) {
    if (index === 0) return 'first.png';
    if (index === 1) return 'second.png';
    if (index === 2) return 'third.png';

    return;
  }
}
