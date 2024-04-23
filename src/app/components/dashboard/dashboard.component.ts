import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart, ChartType } from 'chart.js';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import { Article } from 'src/app/models/types/article';
import { Debate } from 'src/app/models/types/debate';
import { Member } from 'src/app/models/types/member';
import { Rank } from 'src/app/models/types/rank';
import { SelectOption } from 'src/app/models/types/select-option';
import { Statistic } from 'src/app/models/types/statistic';
import { ArticleService } from 'src/app/services/article.service';
import { DebateService } from 'src/app/services/debate.service';
import { MemberService } from 'src/app/services/member.service';
import { MONTHS, housesColors, placementColors } from 'src/app/utils/constants';
import { GoalService } from 'src/app/services/goals.service';
import { Goal } from 'src/app/models/types/goal';
import { NzNotificationPlacement, NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  public form: FormGroup;

  public monthOptions: SelectOption[] = [];

  public tournamentOptions: SelectOption[] = [];

  public charts: Chart[] = [];

  public members: Member[] = [];

  public debates: Debate[] = [];

  public filteredDebates: Debate[] = [];

  public articles: Article[] = [];

  public statistics: Statistic[] = [];

  public ranks: Rank[] = [];

  public loading: boolean = false;

  @ViewChild('chart0')
  public chart0Ref: ElementRef<Chart>;

  @ViewChild('chart1')
  public chart1Ref: ElementRef<Chart>;

  @ViewChild('chart2')
  public chart2Ref: ElementRef<Chart>;

  @ViewChild('chart3')
  public chart3Ref: ElementRef<Chart>;

  public get months() {
    return MONTHS;
  }

  constructor(
    private memberService: MemberService,
    private debateService: DebateService,
    private articleService: ArticleService,
    private goalService: GoalService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  ngAfterViewInit(): void {
    this.generateCharts();
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  public initForm() {
    this.form = this.formBuilder.group({
      month: [],
      tournament: [''],
      trainee: [false]
    });

    this.subscribeToValueChanges();
    this.filterDebates();
  }

  public subscribeToValueChanges() {
    this.form.valueChanges.subscribe(() => {
      this.filterDebates();
    });
  }

  public filterDebates() {
    const month = this.form.controls['month'].value;
    const tournament = this.form.controls['tournament'].value;
    const trainee = this.form.controls['trainee'].value;

    this.filteredDebates = [...this.debates];

    if (!!month || month === 0) this.filteredDebates = this.filteredDebates.filter((debate: Debate) =>
      moment(debate.date).month() - 1 === month
    );

    if (!!tournament) this.filteredDebates = this.filteredDebates.filter((debate: Debate) =>
      debate.tournament === tournament
    );

    if (trainee) this.filteredDebates = this.filteredDebates.filter((debate: Debate) =>
      debate.debaters.some((debater: Member) => debater.isTrainee)
    );

    this.generateRanks();
    this.generateStatistics();
    this.generateCharts();
  }

  public initOptions() {
    this.monthOptions = MONTHS.map((viewValue, value) => ({ value, viewValue })).filter((option) => option.value <= moment(Date.now()).month());

    this.tournamentOptions = [...new Set(this.debates.filter((debate: Debate) => debate.tournament).map((debate: Debate) => debate.tournament!))]
      .map((tournament) =>({
        value: tournament,
        viewValue: tournament
      }));
  }

  public getData() {
    this.loading = true;

    combineLatest([
      this.memberService.getAllMembers(),
      this.debateService.getAllDebates(),
      this.articleService.getAllArticles()
    ]).subscribe(([members, debates, articles]) => {
      if (members && members.length && debates && debates.length && articles && articles.length) {
        this.loading = false;

        this.members = members;
        this.debates = debates;
        this.filteredDebates = debates;
        this.articles = articles;
        this.initOptions();

        this.generateRanks();
        this.generateStatistics();
        this.generateCharts();
      }
    });
  }

  public generateRanks() {
    if (
      !this.debates.length ||
      !this.members.length ||
      !this.articles.length
    ) return;

    this.ranks = [];

    /*
      Auxiliary Variables
    */

    const uniqueDebaters = [... new Set(this.filteredDebates.map((debate: Debate) => debate.debaters).flat())]
      .filter((member: Member) => !member.blocked);

    const uniqueActiveDebaters = uniqueDebaters.filter((uniqueDebater: Member) => this.filteredDebates.filter((debate: Debate) =>
      debate.debaters.some((debater: Member) => debater.id === uniqueDebater.id) && debate.sps && debate.sps.length
    ).length > 2);

    const uniqueJudges = [... new Set(this.filteredDebates.map((debate: Debate) =>
      debate.wings ? [...debate.wings, debate.chair] : [debate.chair]).flat())
    ].filter((member: Member) => !member.blocked);

    const sum = (a: number[]) => a.reduce((prev, curr) => prev + curr, 0)
    const average = (a: number[]) => sum(a) / a.length;

    const pointsIndexes = [0,1,0,1,2,3,2,3];

    // Top Firsts by Debater

    const debatersFirsts = uniqueDebaters.map((uniqueDebater: Member) => this.filteredDebates.filter((debate: Debate) => {
      const debaterIndex = debate.debaters.findIndex((debater: Member) => debater.id === uniqueDebater.id);

      if (debaterIndex === -1) return false;

      return debate.points[pointsIndexes[debaterIndex]] === 3;
    }).length).map((amount, index) => ({
      member: uniqueDebaters[index],
      amount
    })).sort((a, b) => b.amount - a.amount);

    const debatersFirstsUniqueAmounts = [... new Set(debatersFirsts.map(({ member, amount }) => amount))];

    this.ranks.push({
      title: 'Debatedores que mais <b>primeiraram</b>',
      standings: debatersFirstsUniqueAmounts.slice(0, 3).map((uniqueAmount) => ({
        members: debatersFirsts.filter(({ member, amount }) => uniqueAmount === amount)
          .map(({ member, amount }) => member),
        value: uniqueAmount
      }))
    });

    // Top Wins by Debater

    const debatersWins = uniqueDebaters.map((uniqueDebater: Member) => this.filteredDebates.filter((debate: Debate) => {
      const debaterIndex = debate.debaters.findIndex((debater: Member) => debater.id === uniqueDebater.id);

      if (debaterIndex === -1) return false;

      return debate.points[pointsIndexes[debaterIndex]] >= 2;
    }).length).map((amount, index) => ({
      member: uniqueDebaters[index],
      amount
    })).sort((a, b) => b.amount - a.amount);

    const debatersWinsUniqueAmounts = [... new Set(debatersWins.map(({ member, amount }) => amount))];

    this.ranks.push({
      title: 'Debatedores que mais <b>ganharam</b>',
      standings: debatersWinsUniqueAmounts.slice(0, 3).map((uniqueAmount) => ({
        members: debatersWins.filter(({ member, amount }) => uniqueAmount === amount)
          .map(({ member, amount }) => member),
        value: uniqueAmount
      }))
    });

    // Top Active Debaters

    const debatersFrequency = uniqueDebaters.map((uniqueDebater: Member) => this.filteredDebates.filter((debate: Debate) =>
      debate.debaters.some((debater: Member) => debater.id === uniqueDebater.id)
    ).length).map((amount, index) => ({
      member: uniqueDebaters[index],
      amount
    })).sort((a, b) => b.amount - a.amount);

    const debatersFrequencyUniqueAmounts = [... new Set(debatersFrequency.map(({ member, amount }) => amount))];

    this.ranks.push({
      title: 'Debatedores mais <b>ativos</b>',
      standings: debatersFrequencyUniqueAmounts.slice(0, 3).map((uniqueAmount) => ({
        members: debatersFrequency.filter(({ member, amount }) => uniqueAmount === amount)
          .map(({ member, amount }) => member),
        value: uniqueAmount
      }))
    });

    // Best SPs Average

    const spsAverages = uniqueActiveDebaters.map((uniqueActiveDebater: Member) => this.filteredDebates.filter((debate: Debate) =>
      debate.debaters.some((debater: Member) => debater.id === uniqueActiveDebater.id) && debate.sps && debate.sps.length
    ).map(
      (debate: Debate) => debate.sps![debate.debaters.findIndex((debater: Member) => debater.id === uniqueActiveDebater.id)]
    )).map((amount, index) => ({
      member: uniqueActiveDebaters[index],
      amount: average(amount)
    })).sort((a, b) => b.amount - a.amount);

    const uniqueSpsAverages = [... new Set(spsAverages.map(({ member, amount }) => amount))];

    this.ranks.push({
      title: 'Maiores <b>médias de SPs</b>',
      standings: uniqueSpsAverages.slice(0, 3).map((uniqueAmount) => ({
        members: spsAverages.filter(({ member, amount }) => uniqueAmount === amount)
          .map(({ member, amount }) => member),
        value: uniqueAmount.toFixed(2)
      }))
    });

    // Best Absolute SPs

    const sps = uniqueActiveDebaters.map((uniqueActiveDebater: Member) => this.filteredDebates.filter((debate: Debate) =>
      debate.debaters.some((debater: Member) => debater.id === uniqueActiveDebater.id) && debate.sps && debate.sps.length
    ).map(
      (debate: Debate) => debate.sps![debate.debaters.findIndex((debater: Member) => debater.id === uniqueActiveDebater.id)]
    )).map((amount, index) => ({
      member: uniqueActiveDebaters[index],
      amount: amount.sort((a, b) => b - a)[0]
    })).sort((a, b) => b.amount - a.amount);

    const uniqueSps = [... new Set(sps.map(({ member, amount }) => amount))];

    this.ranks.push({
      title: 'Maiores <b>SPs absolutos</b>',
      standings: uniqueSps.slice(0, 3).map((uniqueAmount) => ({
        members: sps.filter(({ member, amount }) => uniqueAmount === amount)
          .map(({ member, amount }) => member),
        value: uniqueAmount
      }))
    });

    // Top Active Judges

    const judgesFrequency = uniqueJudges.map((uniqueJudge: Member) => this.filteredDebates.filter((debate: Debate) =>
      (debate.wings && debate.wings.some((debater: Member) => debater.id === uniqueJudge.id)) ||
      debate.chair.id === uniqueJudge.id
    ).length).map((amount, index) => ({
      member: uniqueJudges[index],
      amount
    })).sort((a, b) => b.amount - a.amount);

    const judgesFrequencyUniqueAmounts = [... new Set(judgesFrequency.map(({ member, amount }) => amount))];

    this.ranks.push({
      title: 'Juízes mais <b>ativos</b>',
      standings: judgesFrequencyUniqueAmounts.slice(0, 3).map((uniqueAmount) => ({
        members: judgesFrequency.filter(({ member, amount }) => uniqueAmount === amount)
          .map(({ member, amount }) => member),
        value: uniqueAmount
      }))
    });
  }

  public generateStatistics() {
    if (
      !this.debates.length ||
      !this.members.length ||
      !this.articles.length
    ) return;

    this.statistics = [];

    /*
      Auxiliary Variables
    */

    const uniqueActiveMembers = [... new Set(
      this.filteredDebates.map((debate: Debate) => debate.debaters).flat().concat(
        this.filteredDebates.filter((debate: Debate) => debate.wings && debate.wings.length).map((debate: Debate) => debate.wings!).flat()
      ).concat (
        this.filteredDebates.map((debate: Debate) => debate.chair).flat()
      )
    )]
    .filter((member: Member) => !member.blocked);

    const uniqueSocieties = [... new Set(uniqueActiveMembers.map((member: Member) => member.society))];

    // Total Debates

    this.statistics.push({
      title: 'Total de <b>Treinos</b>',
      value: this.filteredDebates.length
    });

    // Total Active Debaters

    this.statistics.push({
      title: 'Total de <b>Membros Ativos</b>',
      value: uniqueActiveMembers.length,
    });

    // Total Goals Achieved

    this.statistics.push({
      title: 'Total de <b>Metas Atingidas</b>',
      value: this.goalService.getAllGoals().filter((goal: Goal) => goal.achieved).length,
    });

    // Total Articles Written

    this.statistics.push({
      title: 'Total de <b>Artigos Escritos</b>',
      value: this.articles.length,
    });

    // Partner Society

    this.statistics.push({
      title: 'Sociedade <b>Parceira</b>',
      value: uniqueSocieties.filter((society: string) => society !== 'sdufrj').map((uniqueSociety: string) => ({
        society: uniqueSociety,
        amount: uniqueActiveMembers.filter((member: Member) => member.society === uniqueSociety).length
      })).sort((a, b) => b.amount - a.amount)[0].society
    })
  }

  public generateCharts() {
    if (
      !this.chart0Ref ||
      !this.chart1Ref ||
      !this.chart2Ref ||
      !this.chart3Ref ||
      !this.members ||
      !this.debates ||
      !this.articles
    )
      return;

    this.charts;

    if (this.charts.length) {
      this.charts.forEach((chart) => chart.destroy());
      this.charts = [];
    }

    /*
      Auxiliary Variables
    */

    const max = (a: number[]) => Math.max(...a);
    const sum = (a: number[]) => a.reduce((prev, curr) => prev + curr, 0);

    const motionTypes = this.filteredDebates.map((debate) => debate.motionType);
    const uniqueMotionTypes: string[] = [... new Set(motionTypes)];

    const motionThemes = this.filteredDebates.map((debate) => debate.motionTheme);
    const uniqueMotionThemes: string[] = [... new Set(motionThemes)];

    // Performance By House

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

    this.charts.push(new Chart(this.chart0Ref.nativeElement, {
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#D9D9D9'
            }
          }
        },
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9'
            }
          },
          y: {
            min: 0,
            max: max([sum(og), sum(oo), sum(cg), sum(co)]) + 1,
            stacked: true,
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9',
              stepSize: 1
            }
          }
        },
      },
      data: {
        labels: ['Primeiro', 'Segundo', 'Terceiro', 'Quarto'],
        datasets: [
          {
            type: 'bar',
            label: '1G',
            data: og,
            backgroundColor: housesColors[0]
          },
          {
            type: 'bar',
            label: '1O',
            data: oo,
            backgroundColor: housesColors[1]
          },
          {
            type: 'bar',
            label: '2G',
            data: cg,
            backgroundColor: housesColors[2]
          },
          {
            type: 'bar',
            label: '2O',
            data: co,
            backgroundColor: housesColors[3]
          },
        ],
      }
    }));

    // Performance By House

    const firsts = [og[0], oo[0], cg[0], co[0]];
    const seconds = [og[1], oo[1], cg[1], co[1]];
    const thirds = [og[2], oo[2], cg[2], co[2]];
    const fourths = [og[3], oo[3], cg[3], co[3]];

    this.charts.push(new Chart(this.chart1Ref.nativeElement, {
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#D9D9D9'
            }
          }
        },
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9'
            }
          },
          y: {
            min: 0,
            max: max([sum(firsts), sum(seconds), sum(thirds), sum(fourths)]) + 1,
            stacked: true,
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9',
              stepSize: 1
            }
          }
        },
      },
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

    // Motion Types Frequency

    const motionTypesFrequency = uniqueMotionTypes.map((uniqueMotionType) =>
      motionTypes.filter((motionType) => motionType === uniqueMotionType).length
    );

    this.charts.push(new Chart(this.chart2Ref.nativeElement, {
      type: 'doughnut' as ChartType,
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#D9D9D9'
            }
          }
        },
        maintainAspectRatio: false,
      },
      data: {
        labels: uniqueMotionTypes,
        datasets: [
          {
            label: 'Frequência em Debates',
            data: motionTypesFrequency,
          },
        ],
      }
    }));

    // Motion Themes Frequency

    const motionThemesFrequency = uniqueMotionThemes.map((uniqueMotionTheme) =>
      motionThemes.filter((motionTheme) => motionTheme === uniqueMotionTheme).length
    );

    this.charts.push(new Chart(this.chart3Ref.nativeElement, {
      type: 'doughnut' as ChartType,
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#D9D9D9'
            }
          }
        },
        maintainAspectRatio: false,
      },
      data: {
        labels: uniqueMotionThemes,
        datasets: [
          {
            label: 'Frequência em Debates',
            data: motionThemesFrequency,
          },
        ],
      }
    }));
  }

  public getPlacementIconUrl(index: number) {
    if (index === 0) return 'assets/first.png';
    if (index === 1) return 'assets/second.png';
    if (index === 2) return 'assets/third.png';

    return '';
  }

  public showCharts() {
    return this.charts && this.charts.length;
  }
}
