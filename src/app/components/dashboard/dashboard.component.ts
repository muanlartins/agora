import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart } from 'chart.js';
import * as moment from 'moment';
import { combineLatest, lastValueFrom } from 'rxjs';
import { Society } from 'src/app/models/enums/society';
import { Debate } from 'src/app/models/types/debate';
import { Member } from 'src/app/models/types/member';
import { SelectOption } from 'src/app/models/types/select-option';
import { DebateService } from 'src/app/services/debate.service';
import { MemberService } from 'src/app/services/member.service';
import { MONTHS } from 'src/app/utils/constants';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  public form: FormGroup;

  public debates: Debate[];

  public members: Member[];

  public loading = false;

  @ViewChild('topSpeakersByAverageSps')
  public topSpeakersByAverageSps: ElementRef<HTMLCanvasElement>;

  @ViewChild('topMembersByFrequency')
  public topMembersByFrequency: ElementRef<HTMLCanvasElement>;

  public charts: Chart[] = [];

  public statistics: { title: string, value: string, img?: string, details?: { title: string, value: string }[] }[];

  public monthOptions: SelectOption[] = [];

  public month: number = moment(Date.now()).month()-1;

  public get MONTHS() {
    return MONTHS;
  }

  constructor(
    private memberService: MemberService,
    private debateService: DebateService,
    private formBuilder: FormBuilder
  ) {
    this.initForm();
    this.initOptions();
  }

  ngOnInit(): void {
    this.getData();
    this.subscribeToValueChanges();
  }

  ngAfterViewInit(): void {
    this.generateGraphs();
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }

  public initForm() {
    this.form = this.formBuilder.group({
      month: [moment(Date.now()).month()-1],
    });
  }

  public initOptions() {
    this.monthOptions = MONTHS.map((viewValue, value) => ({ value, viewValue })).filter((option) => option.value < moment(Date.now()).month());
  }

  public subscribeToValueChanges() {
    this.form.controls['month'].valueChanges.subscribe((month: number) => {
      this.month = month;
      this.getStatistics();
    });
  }

  public async getData() {
    this.loading = true;

    combineLatest([
      this.debateService.getAllDebates(),
      this.memberService.getAllMembers()
    ]).subscribe(([debates, members]) => {
      if (members && members.length && debates && debates.length) {
        this.debates = debates.filter((debate) => debate.date.length > 10);
        this.members = members;
        this.loading = false;

        this.generateGraphs();
        this.getStatistics();
      }
    });
  }

  public generateTopSpeakersByAverageSpsGraph() {
    const sp: { [id: string]: number } = {};
    const maxSp: { [id: string]: number } = {};
    const minSp: { [id: string]: number } = {};
    const participations: { [id: string]: number } = {};

    this.members.forEach((member) => {
      sp[member.id] = 0;
      maxSp[member.id] = 0;
      minSp[member.id] = Infinity;
    });

    this.members.forEach((member) => {
      let debatesParticipated = 0;

      this.debates.forEach((debate) => {
        if (!debate.debaters) return;
        const memberIndex = debate.debaters.findIndex((debater) => debater.id === member.id);

        if (memberIndex !== -1 && debate.sps) {
          sp[member.id] += debate.sps[memberIndex];
          maxSp[member.id] = Math.max(maxSp[member.id], debate.sps[memberIndex]);
          minSp[member.id] = Math.min(minSp[member.id], debate.sps[memberIndex]);
          debatesParticipated ++;
        }
      })

      participations[member.id] = debatesParticipated;

      if (debatesParticipated) sp[member.id] /= debatesParticipated;
    });

    const topSpeakers =
      Object.entries(sp).sort((a, b) => b[1] - a[1])
        .filter(([id, sp]) => participations[id] >= 3)
        .slice(0, 8);

    const labels = topSpeakers.map(([id, sp]) =>
      this.members.find((member) => member.id === id)!.name
        .split(' ').slice(0, 3).join(' ')
    );
    const data = topSpeakers.map(([id, sp]) => sp);
    const max = topSpeakers.map(([id, sp]) => maxSp[id]);
    const min = topSpeakers.map(([id, sp]) => minSp[id]);

    this.charts.push(new Chart(this.topSpeakersByAverageSps.nativeElement, {
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#D9D9D9'
            }
          }
        },
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
              stepSize: 2
            }
          }
        },
      },
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Maior SPs',
            data: max,
            backgroundColor: data.map(() => '#fb9344'),
            borderColor: data.map(() => '#fb9344')
          },
          {
            type: 'line',
            label: 'Menor SPs',
            data: min,
            backgroundColor: data.map(() => '#fbb394'),
            borderColor: data.map(() => '#fbb394')
          },
          {
            type: 'bar',
            label: 'Média de SPs',
            data: data,
            backgroundColor: data.map(() => '#fbb34460'),
            borderColor: data.map(() => '#fbb34460')
          },
        ],
      }
    }));
  }

  public generateTopMembersByFrequencyGraph() {
    const debatesParticipated: { [id: string]: number } = {};
    const debatesParticipatedAsDebater: { [id: string]: number } = {};
    const debatesParticipatedAsJudge: { [id: string]: number } = {};

    this.members.forEach((member) => {
      let debatesParticipatedByMemberAsDebater = 0;
      let debatesParticipatedByMemberAsJudge = 0;

      this.debates.forEach((debate) => {
        if (!debate.debaters) return;
        const memberIndex = debate.debaters.findIndex((debater) => debater.id === member.id);
        if (memberIndex !== -1) debatesParticipatedByMemberAsDebater ++;
      });

      this.debates.forEach((debate) => {
        if (member.id === debate.chair.id) debatesParticipatedByMemberAsJudge ++;

        if (!debate.wings) return;
        const memberIndex = debate.wings.findIndex((judge) => judge.id === member.id);
        if (memberIndex !== -1) debatesParticipatedByMemberAsJudge ++;
      })

      debatesParticipatedAsDebater[member.id] = debatesParticipatedByMemberAsDebater;
      debatesParticipatedAsJudge[member.id] = debatesParticipatedByMemberAsJudge;
      debatesParticipated[member.id] = debatesParticipatedByMemberAsDebater + debatesParticipatedByMemberAsJudge;
    });

    const topMembers = Object.entries(debatesParticipated).sort((a, b) => b[1] - a[1]).slice(0, 8);

    const labels = topMembers.map(([id, debatesParticipated]) =>
      this.members.find((member) => member.id === id)!.name
        .split(' ').slice(0, 3).join(' ')
    );
    const debaterFrequency = topMembers.map(([id, debatesParticipated]) => debatesParticipatedAsDebater[id]);
    const judgeFrequency = topMembers.map(([id, debatesParticipated]) => debatesParticipatedAsJudge[id]);

    this.charts.push(new Chart(this.topMembersByFrequency.nativeElement, {
      options: {
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: '#D9D9D9'
            },
            grid: {
              color: '#D9D9D920'
            }
          },
          y: {
            ticks: {
              stepSize: 1,
              color: '#D9D9D9'

            },
            stacked: true,
            grid: {
              color: '#D9D9D920'
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: '#D9D9D9'
            }
          }
        }
      },
      data: {
        labels,
        datasets: [
          {
            type: 'bar',
            label: 'Frequência em Debates (como debatedor)',
            data: debaterFrequency,
            backgroundColor: debaterFrequency.map(() => '#fbb394'),
            borderColor: debaterFrequency.map(() => '#fbb394'),
          },
          {
            type: 'bar',
            label: 'Frequência em Debates (como juíz)',
            data: judgeFrequency,
            backgroundColor: judgeFrequency.map(() => '#fb9344'),
            borderColor: judgeFrequency.map(() => '#fb9344')
          },
        ]
      }
    }));
  }

  public generateGraphs() {
    if (
      !this.members ||
      !this.debates ||
      !this.topSpeakersByAverageSps ||
      !this.topMembersByFrequency
    ) return;

    this.generateTopSpeakersByAverageSpsGraph();
    this.generateTopMembersByFrequencyGraph();
  }

  public async getStatistics() {
    const debates = this.debates.filter((debate) => moment(debate.date).month() === this.form.controls['month'].value);

    const winsByDebater: { [id: string]: number } = {};
    const duosByDebater: { [id: string]: string[]} = {};
    const bestSpByDebater: { [id: string]: { sp: number, debate: Debate } } = {}
    const debatesByJudge: { [id: string]: number } = {}
    const societyParticipations: { [society: string]: number } = {}
    const societyParticipants: { [society: string]: string[] } = {}

    this.members.forEach((member) => {
      winsByDebater[member.id] = 0;
      duosByDebater[member.id] = [];
      bestSpByDebater[member.id] = {
        sp: 0,
        debate: {} as Debate
      };
      debatesByJudge[member.id] = 0;
    });

    Object.entries(Society).forEach(([key, society]) => {
      societyParticipations[key] = 0;
      societyParticipants[key] = [];
    });

    debates.forEach((debate) => {
      debate.debaters?.forEach((debater) => {
        societyParticipations[debater.society] ++;
        societyParticipants[debater.society].push(debater.name);
      });
      societyParticipations[debate.chair.society] ++;
      societyParticipants[debate.chair.society].push(debate.chair.name);
      debate.wings?.forEach((wing) => {
        societyParticipations[wing.society] ++;
        societyParticipants[wing.society].push(wing.name);
      });
    });

    debates.forEach((debate) => {
      const winnerIndex = debate.points.findIndex((points) => points === 3);

      debate.debaters?.forEach((debater, index) => {
        if (bestSpByDebater[debater.id].sp < (debate.sps?.[index] ?? 0)) {
          bestSpByDebater[debater.id].sp = debate.sps?.[index] ?? 0;
          bestSpByDebater[debater.id].debate = debate;
        }
      });

      [0,1,4,5].forEach((i) => {
        if (winnerIndex === Math.floor(i/3) + (i%3)) {
          winsByDebater[debate.debaters![i].id]++;
          duosByDebater[debate.debaters![i].id].push(debate.debaters![i+2].name);

          if (debate.debaters![i].id !== debate.debaters![i+2].id){
            winsByDebater[debate.debaters![i+2].id]++;
            duosByDebater[debate.debaters![i+2].id].push(debate.debaters![i].name);
          }
        }
      });

      debatesByJudge[debate.chair.id] ++;
      debate.wings?.forEach((wing) => debatesByJudge[wing.id] ++);
    });

    const winnerId = Object.entries(winsByDebater).sort((a, b) => b[1] - a[1])[0][0];
    const winnerDebates = Object.entries(winsByDebater).sort((a, b) => b[1] - a[1])[0][1];
    const winner = this.members.find((member) => member.id === winnerId)!;

    const mostSpsId = Object.entries(bestSpByDebater).sort((a, b) => b[1].sp - a[1].sp)[0][0];
    const mostSpsDebate = Object.entries(bestSpByDebater).sort((a, b) => b[1].sp - a[1].sp)[0][1].debate;
    const mostSpsSp = Object.entries(bestSpByDebater).sort((a, b) => b[1].sp - a[1].sp)[0][1].sp;
    const mostSps = this.members.find((member) => member.id === mostSpsId)!;

    const mostDebatesByJudgeId = Object.entries(debatesByJudge).sort((a, b) => b[1] - a[1])[0][0];
    const mostDebatesByJudgeAmount = Object.entries(debatesByJudge).sort((a, b) => b[1] - a[1])[0][1];
    const mostDebatesByJudge = this.members.find((member) => member.id === mostDebatesByJudgeId)!;

    const mostParticipationsSociety = Object.entries(societyParticipations).sort((a, b) => b[1] - a[1])[1][0];
    const mostParticipationsParticipations = Object.entries(societyParticipations).sort((a, b) => b[1] - a[1])[1][1];
    const mostParticipationsParticipants = societyParticipants[mostParticipationsSociety];

    this.statistics = [
      {
        title: 'Debatedor com mais vitórias',
        value: `${winner.name} (${Society[winner.society]})`,
        img: await this.memberService.memberHasPfp(winnerId) ? this.memberService.getMemberPfpUrl(winnerId) : undefined,
        details: [
          {
            title: 'Vitórias',
            value: winnerDebates.toString(),
          },
          {
            title: 'Duplas',
            value: duosByDebater[winnerId].join(', '),
          }
        ]
      },
      {
        title: 'Debatedor com o maior speaker points',
        value: `${mostSps.name} (${Society[mostSps.society]})`,
        img: await this.memberService.memberHasPfp(mostSpsId) ? this.memberService.getMemberPfpUrl(mostSpsId) : undefined,
        details: [
          {
            title: 'SP',
            value: `${mostSpsSp}`
          },
          {
            title: 'Data',
            value: `${
                moment(mostSpsDebate?.date)
                  .hour(Number(mostSpsDebate.time.split(':')[0]))
                  .minute(Number(mostSpsDebate.time.split(':')[1]))
                  .locale('pt-br')
                  .format(`LLL`)
            }`
          },
          {
            title: 'Juíz',
            value: `${mostSpsDebate?.chair.name}`
          }
        ]
      },
      {
        title: 'Juíz com mais participações',
        value: `${mostDebatesByJudge.name} (${Society[mostDebatesByJudge.society]})`,
        img: await this.memberService.memberHasPfp(mostDebatesByJudgeId) ? this.memberService.getMemberPfpUrl(mostDebatesByJudgeId) : undefined,
        details: [
          {
            title: 'Debates',
            value: `${mostDebatesByJudgeAmount}`
          }
        ]
      },
      {
        title: 'Sociedade parceira',
        value: `${Society[mostParticipationsSociety as keyof typeof Society]}`,
        details: [
          {
            title: 'Participações',
            value: `${mostParticipationsParticipations}`,
          },
          {
            title: 'Participantes',
            value: `${[...new Set(mostParticipationsParticipants)].join(', ')}`
          }
        ]
      },
      {
        title: 'Treinos',
        value: `${debates.length}`
      }
    ];
  }
}
