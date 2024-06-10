import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Chart, ChartType } from 'chart.js';
import * as removeAccents from 'remove-accents';
import { combineLatest } from 'rxjs';
import { MotionTheme } from 'src/app/models/enums/motion-theme';
import { Article } from 'src/app/models/types/article';
import { Debate } from 'src/app/models/types/debate';
import { Member } from 'src/app/models/types/member';
import { SelectOption } from 'src/app/models/types/select-option';
import { ArticleService } from 'src/app/services/article.service';
import { DebateService } from 'src/app/services/debate.service';
import { MemberService } from 'src/app/services/member.service';
import { housesColors, placementColors } from 'src/app/utils/constants';

type Statistic = {
  title: any;
  value: any;
};

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy, AfterViewInit {
  public form: FormGroup;

  public memberOptions: SelectOption[];

  public loading: boolean = false;

  public member: Member;

  public members: Member[];

  public filteredMembers: Member[];

  public debates: Debate[];

  public articles: Article[];

  public debaterStatistics: Statistic[];

  public judgeStatistics: Statistic[];

  public charts: Chart[] = [];

  @ViewChild('chart0')
  public chart0Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart1')
  public chart1Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart2')
  public chart2Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart3')
  public chart3Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart4')
  public chart4Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart5')
  public chart5Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart6')
  public chart6Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart7')
  public chart7Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart8')
  public chart8Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart9')
  public chart9Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart10')
  public chart10Ref: ElementRef<HTMLCanvasElement>;

  @ViewChild('chart11')
  public chart11Ref: ElementRef<HTMLCanvasElement>;

  public get id() {
    return this.form.controls['member'].value;
  }

  public constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private debateService: DebateService,
    private articleService: ArticleService
  ) {
  }

  public ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  public ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  public ngAfterViewInit(): void {
    this.generateGraphs();
  }

  public initForm() {
    this.form =this.formBuilder.group({
      member: [''],
      memberFilter: ['']
    });


    this.subscribeToValueChanges();
  }

  public subscribeToValueChanges() {
    this.route.params.subscribe((params: any) => {
      if (params && params.id) {
        this.form.controls['member'].patchValue(params.id);
      } else {
        this.form.controls['member'].patchValue('');
      }
    });

    this.form.controls['member'].valueChanges.subscribe((id: string) => {
      if (id) {
        this.generateStatistics();
        this.generateGraphs();
        this.router.navigate(['/member/' + id]);
      } else
        this.router.navigate(['/member']);
    });

    this.form.controls['memberFilter'].valueChanges.subscribe((name: string) => {
      this.filteredMembers = this.members.filter((member: Member) =>
        removeAccents(member.name.toLowerCase()).includes(removeAccents(name.toLowerCase()))
      );

      this.initOptions();
    })
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
        this.filteredMembers = members;
        this.debates = debates;
        this.articles = articles;
        this.initOptions();

        if (this.id) {
          this.generateStatistics();
          this.generateGraphs();
        }
      }
    });
  }

  public initOptions() {
    this.memberOptions = this.filteredMembers.map((member) => ({
      value: member.id,
      viewValue: member.name
    }));
  }

  public generateStatistics() {
    this.member = this.members.find((member: Member) => member.id === this.id)!;

    this.debaterStatistics = [];
    this.judgeStatistics = [];

    // Participations in Debates as Debater
    const participationsInDebatesAsDebater = this.debates.filter((debate: Debate) =>
      debate.debaters.findIndex((member: Member) => member.id === this.member.id) !== -1
    ).length;

    this.debaterStatistics.push({
      title: 'Participações em Debates',
      value: participationsInDebatesAsDebater
    });

    const sps = this.debates.filter((debate: Debate) =>
      debate.debaters && debate.debaters.findIndex((member: Member) => member.id === this.member.id) !== -1
    ).map((debate) => {
      const index = debate.debaters.findIndex((debater) => debater.id === this.member.id)!;

      return debate.sps![index];
    });

    // Max SPs

    const max = (a: number[]) => Math.max(...a);
    const maxSp = max(sps);

    if (sps && sps.length) this.debaterStatistics.push({
      title: 'Maior SPs',
      value: maxSp
    });

    // Min SPs

    const min = (a: number[]) => Math.min(...a);
    const minSp = min(sps);

    if (sps && sps.length) this.debaterStatistics.push({
      title: 'Menor SPs',
      value: minSp
    });

    // SPs average

    const average = (a: number[]) => a.reduce((prev, curr) => prev + curr, 0) / a.length;
    const spAverage = average(sps).toFixed(2);

    if (sps && sps.length) this.debaterStatistics.push({
      title: 'Média de SPs',
      value: spAverage
    });

    // Participations in Debates as Judge

    const participationsInDebatesAsJudge = this.debates.filter((debate: Debate) =>
      (debate.wings && debate.wings.findIndex((member: Member) => member.id === this.member.id) !== -1)  ||
      debate.chair.id === this.member.id
    ).length;

    this.judgeStatistics.push({
      title: 'Participações em Debates',
      value: participationsInDebatesAsJudge
    });

    const spsAsJudge = this.debates.filter((debate: Debate) =>
      (debate.wings && debate.wings.findIndex((member: Member) => member.id === this.member.id) !== -1)  ||
      debate.chair.id === this.member.id
    ).map((debate) => debate.sps!).flat();

    // Max SPs as Judge

    const maxSpsAsJudge = max(spsAsJudge);

    if (spsAsJudge && spsAsJudge.length) this.judgeStatistics.push({
      title: 'Maior SPs',
      value: maxSpsAsJudge
    });

    // Min SPs as Judge

    const minSpsAsJudge = min(spsAsJudge);

    if (spsAsJudge && spsAsJudge.length) this.judgeStatistics.push({
      title: 'Menor SPs',
      value: minSpsAsJudge
    });

    // Average SPs as Judge

    const spAverageAsJudge = average(sps).toFixed(2);

    if (spsAsJudge && spsAsJudge.length) this.judgeStatistics.push({
      title: 'Média de SPs',
      value: spAverageAsJudge
    });
  }

  public generateGraphs() {
    if (
      !this.chart0Ref ||
      !this.chart1Ref ||
      !this.chart2Ref ||
      !this.chart3Ref ||
      !this.chart4Ref ||
      !this.chart5Ref ||
      !this.chart6Ref ||
      !this.chart7Ref ||
      !this.chart8Ref ||
      !this.chart9Ref ||
      !this.chart10Ref ||
      !this.chart11Ref ||
      !this.members ||
      !this.debates ||
      !this.articles ||
      !this.id ||
      !this.member
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
    const min = (a: number[]) => Math.min(...a);
    const sum = (a: number[]) => a.reduce((prev, curr) => prev + curr, 0);
    const average = (a: number[]) => sum(a) / a.length;
    const abs = (a: number) => Math.abs(a);

    const pointsIndexes = [0,1,0,1,2,3,2,3];

    const debatesAsDebater: Debate[] = this.debates.filter((debate: Debate) =>
      debate.debaters && debate.debaters.findIndex((member: Member) => member.id === this.member.id) !== -1
    );

    const debatesAsJudge: Debate[] = this.debates.filter((debate: Debate) =>
      (debate.wings && debate.wings.findIndex((member: Member) => member.id === this.member.id) !== -1)  ||
      debate.chair.id === this.member.id
    );

    const debatesAsOg: Debate[] = debatesAsDebater.filter((debate: Debate) =>
      debate.debaters && (debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 0
        || debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 2)
    );

    const debatesAsOo: Debate[] = debatesAsDebater.filter((debate: Debate) =>
      debate.debaters && (debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 1
        || debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 3));

    const debatesAsCg: Debate[] = debatesAsDebater.filter((debate: Debate) =>
      debate.debaters && (debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 4
        || debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 6));

    const debatesAsCo: Debate[] = debatesAsDebater.filter((debate: Debate) =>
      debate.debaters && (debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 5
        || debate.debaters.findIndex((member: Member) => member.id === this.member.id) === 7));

    const duoIndexes = [2,3,0,1,6,7,4,5];

    const duos: Member[] = debatesAsDebater.map((debate: Debate) => {
      const debaterIndex = debate.debaters.findIndex((debater: Member) => debater.id === this.member.id);

      return debate.debaters[duoIndexes[debaterIndex]];
    });

    const uniqueDuos: Member[] = [... new Set(duos)];

    const debatesByDuo: { [id: string]: Debate[] } = {};
    uniqueDuos.forEach((uniqueDuo: Member) => {
      debatesByDuo[uniqueDuo.id] = debatesAsDebater.filter((debate: Debate) => {
        const debaterIndex = debate.debaters.findIndex((debater: Member) => debater.id === this.member.id);
        const duoIndex = debate.debaters.findIndex((debater: Member) => debater.id === uniqueDuo.id);

        return debaterIndex !== -1 && duoIndex !== -1 && abs(debaterIndex - duoIndex) === 2
      });
    });

    const motionTypesAsDebater: string[] = debatesAsDebater.map((debate) => debate.motionType);

    const uniqueMotionTypesAsDebater: string[] = [... new Set(motionTypesAsDebater)];

    const motionThemesAsDebater: string[] = debatesAsDebater.map((debate) => debate.motionTheme);

    const uniqueMotionThemesAsDebater: string[] = [... new Set(motionThemesAsDebater)];

    const motionTypesAsJudge: string[] = debatesAsJudge.map((debate) => debate.motionType);

    const uniqueMotionTypesAsJudge: string[] = [... new Set(motionTypesAsJudge)];

    const motionThemesAsJudge: string[] = debatesAsJudge.map((debate) => debate.motionTheme);

    const uniqueMotionThemesAsJudge: string[] = [... new Set(motionThemesAsJudge)];

    // SPs

    const sps = debatesAsDebater.map((debate) => {
      const index = debate.debaters.findIndex((debater) => debater.id === this.member.id)!;

      return debate.sps![index];
    });

    const maxSp = max(sps);
    const minSp = min(sps);
    const spAverage = average(sps);

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
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9'
            }
          },
          y: {
            min: 60,
            max: 84,
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9',
              stepSize: 3
            }
          }
        },
      },
      data: {
        labels: [this.member.name],
        datasets: [
          {
            type: 'line',
            label: 'Maior SPs',
            data: [maxSp],
          },
          {
            type: 'line',
            label: 'Menor SPs',
            data: [minSp],
          },
          {
            type: 'bar',
            label: 'Média de SPs',
            data: [spAverage],
          },
        ],
      }
    }));

    // Houses

    const housesWon = [
      debatesAsOg.filter((debate: Debate) => debate.points[0] >= 2).length,
      debatesAsOo.filter((debate: Debate) => debate.points[1] >= 2).length,
      debatesAsCg.filter((debate: Debate) => debate.points[2] >= 2).length,
      debatesAsCo.filter((debate: Debate) => debate.points[3] >= 2).length,
    ];

    const housesLost = [
      debatesAsOg.filter((debate: Debate) => debate.points[0] <= 1).length,
      debatesAsOo.filter((debate: Debate) => debate.points[1] <= 1).length,
      debatesAsCg.filter((debate: Debate) => debate.points[2] <= 1).length,
      debatesAsCo.filter((debate: Debate) => debate.points[3] <= 1).length,
    ];

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
            max: max([0,1,2,3].map((i) => housesLost[i] + housesWon[i])) + 1,
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
            label: 'Vitórias (1º e 2º)',
            data: housesWon,
          },
          {
            type: 'bar',
            label: 'Derrotas (3º e 4º)',
            data: housesLost,
          },
        ],
      }
    }));

    // Placements

    const placements = [
      debatesAsOg.filter((debate: Debate) => debate.points[0] == 3).length +
      debatesAsOo.filter((debate: Debate) => debate.points[1] == 3).length +
      debatesAsCg.filter((debate: Debate) => debate.points[2] == 3).length +
      debatesAsCo.filter((debate: Debate) => debate.points[3] == 3).length,

      debatesAsOg.filter((debate: Debate) => debate.points[0] == 2).length +
      debatesAsOo.filter((debate: Debate) => debate.points[1] == 2).length +
      debatesAsCg.filter((debate: Debate) => debate.points[2] == 2).length +
      debatesAsCo.filter((debate: Debate) => debate.points[3] == 2).length,

      debatesAsOg.filter((debate: Debate) => debate.points[0] == 1).length +
      debatesAsOo.filter((debate: Debate) => debate.points[1] == 1).length +
      debatesAsCg.filter((debate: Debate) => debate.points[2] == 1).length +
      debatesAsCo.filter((debate: Debate) => debate.points[3] == 1).length,

      debatesAsOg.filter((debate: Debate) => debate.points[0] == 0).length +
      debatesAsOo.filter((debate: Debate) => debate.points[1] == 0).length +
      debatesAsCg.filter((debate: Debate) => debate.points[2] == 0).length +
      debatesAsCo.filter((debate: Debate) => debate.points[3] == 0).length,
    ];

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
        labels: ['Primeiro', 'Segundo', 'Terceiro', 'Quarto'],
        datasets: [
          {
            label: 'Colocação',
            data: placements,
          },
        ],
      }
    }));

    // Duos Frequency

    const duosNames = uniqueDuos.map((duo) => duo.name);
    const duosAmounts = uniqueDuos.map((uniqueDuo) => duos.filter((duo) => duo.id === uniqueDuo.id).length);

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
        labels: duosNames,
        datasets: [
          {
            label: 'Frequência',
            data: duosAmounts,
          },
        ],
      }
    }));

    // Wins and Losses by Duo

    const debatesWonByDuo = uniqueDuos.map((duo: Member) => debatesByDuo[duo.id].filter((debate: Debate) =>
      debate.points[pointsIndexes[debate.debaters.findIndex((debater: Member) => debater.id === duo.id)]] >= 2
    ).length);

    const debatesLostByDuo = uniqueDuos.map((duo: Member) => debatesByDuo[duo.id].filter((debate: Debate) =>
      debate.points[pointsIndexes[debate.debaters.findIndex((debater: Member) => debater.id === duo.id)]] <= 1
    ).length);

    this.charts.push(new Chart(this.chart4Ref.nativeElement, {
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
            max: max(debatesWonByDuo.map((amount, i) => amount + debatesLostByDuo[i])) + 1,
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
        labels: uniqueDuos.map((duo: Member) => duo.name),
        datasets: [
          {
            type: 'bar',
            label: 'Vitórias (1º e 2º)',
            data: debatesWonByDuo,
          },
          {
            type: 'bar',
            label: 'Derrotas (3º e 4º)',
            data: debatesLostByDuo,
          },
        ],
      }
    }));

    // Performance by Motion Type

    const debatesWonByMotionType = uniqueMotionTypesAsDebater.map((motionType: string) => debatesAsDebater.filter((debate: Debate) =>
      debate.motionType === motionType &&
      debate.points[pointsIndexes[debate.debaters.findIndex((debater: Member) => debater.id === this.member.id)]] >= 2
    ).length);

    const debatesLostByMotionType = uniqueMotionTypesAsDebater.map((motionType: string) => debatesAsDebater.filter((debate: Debate) =>
      debate.motionType === motionType &&
      debate.points[pointsIndexes[debate.debaters.findIndex((debater: Member) => debater.id === this.member.id)]] <= 1
    ).length);

    this.charts.push(new Chart(this.chart5Ref.nativeElement, {
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
            max: max(debatesWonByMotionType.map((amount, i) => amount + debatesLostByMotionType[i])) + 1,
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
        labels: uniqueMotionTypesAsDebater,
        datasets: [
          {
            type: 'bar',
            label: 'Vitórias (1º e 2º)',
            data: debatesWonByMotionType,
          },
          {
            type: 'bar',
            label: 'Derrotas (3º e 4º)',
            data: debatesLostByMotionType,
          },
        ],
      }
    }));

    // Performance by Motion Theme

    const debatesWonByMotionTheme = uniqueMotionThemesAsDebater.map((motionTheme: string) => debatesAsDebater.filter((debate: Debate) =>
      debate.motionTheme === motionTheme &&
      debate.points[pointsIndexes[debate.debaters.findIndex((debater: Member) => debater.id === this.member.id)]] >= 2
    ).length);

    const debatesLostByMotionTheme = uniqueMotionThemesAsDebater.map((motionTheme: string) => debatesAsDebater.filter((debate: Debate) =>
      debate.motionTheme === motionTheme &&
      debate.points[pointsIndexes[debate.debaters.findIndex((debater: Member) => debater.id === this.member.id)]] <= 1
    ).length);

    this.charts.push(new Chart(this.chart6Ref.nativeElement, {
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
            max: max(debatesWonByMotionTheme.map((amount, i) => amount + debatesLostByMotionTheme[i])) + 1,
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
        labels: uniqueMotionThemesAsDebater.map((motionTheme: string) => MotionTheme[motionTheme as keyof typeof MotionTheme]),
        datasets: [
          {
            type: 'bar',
            label: 'Vitórias (1º e 2º)',
            data: debatesWonByMotionTheme,
          },
          {
            type: 'bar',
            label: 'Derrotas (3º e 4º)',
            data: debatesLostByMotionTheme,
          },
        ],
      }
    }));

    // Max/Min/Average SP given by Judge

    const spsAsJudge = debatesAsJudge.map((debate) => debate.sps!).flat();

    const maxSpsAsJudge = max(spsAsJudge);

    const minSpsAsJudge = min(spsAsJudge);

    const spAverageAsJudge = Number(average(sps).toFixed(2));

    this.charts.push(new Chart(this.chart7Ref.nativeElement, {
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
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9'
            }
          },
          y: {
            min: 60,
            max: 84,
            grid: {
              color: '#D9D9D920'
            },
            ticks: {
              color: '#D9D9D9',
              stepSize: 3
            }
          }
        },
      },
      data: {
        labels: [this.member.name],
        datasets: [
          {
            type: 'line',
            label: 'Maior SPs',
            data: [maxSpsAsJudge],
          },
          {
            type: 'line',
            label: 'Menor SPs',
            data: [minSpsAsJudge],
          },
          {
            type: 'bar',
            label: 'Média de SPs',
            data: [spAverageAsJudge],
          },
        ],
      }
    }));

    // Placements as Judge

    // Performance By House

    const og = [0, 0, 0, 0];
    const oo = [0, 0, 0, 0];
    const cg = [0, 0, 0, 0];
    const co = [0, 0, 0, 0];

    debatesAsJudge.forEach((debate) => {
      og[3 - debate.points[0]] ++;
      oo[3 - debate.points[1]] ++;
      cg[3 - debate.points[2]] ++;
      co[3 - debate.points[3]] ++;
    });

    this.charts.push(new Chart(this.chart8Ref.nativeElement, {
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

    this.charts.push(new Chart(this.chart9Ref.nativeElement, {
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

    // Motion Type as Judge

    const motionTypesAmountAsJudge = uniqueMotionTypesAsJudge.map((uniqueMotionType) =>
      motionTypesAsJudge.filter((motionType) => motionType === uniqueMotionType).length
    );

    this.charts.push(new Chart(this.chart10Ref.nativeElement, {
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
        labels: uniqueMotionTypesAsJudge,
        datasets: [
          {
            label: 'Frequência em Debates',
            data: motionTypesAmountAsJudge,
          },
        ],
      }
    }));

    // Temas de Moção por Juíz

    const motionThemesAmountAsJudge = uniqueMotionThemesAsJudge.map((uniqueMotionTheme) =>
      motionThemesAsJudge.filter((motionTheme) => motionTheme === uniqueMotionTheme).length
    );

    this.charts.push(new Chart(this.chart11Ref.nativeElement, {
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
        labels: uniqueMotionThemesAsJudge.map((theme: string) => MotionTheme[theme as keyof typeof MotionTheme]),
        datasets: [
          {
            label: 'Frequência em Debates',
            data: motionThemesAmountAsJudge,
          },
        ],
      }
    }));
  }

  public showDebaterStatistics() {
    if (!this.debates || !this.member) return false;

    return this.debates.filter((debate: Debate) =>
      debate.debaters && debate.debaters.findIndex((member: Member) => member.id === this.member.id) !== -1
    ).length;
  }

  public showJudgeStatistics() {
    if (!this.debates || !this.member) return false;

    return this.debates.filter((debate: Debate) =>
      (debate.wings && debate.wings.findIndex((member: Member) => member.id === this.member.id) !== -1)  ||
      debate.chair.id === this.member.id
    ).length;
  }
}
