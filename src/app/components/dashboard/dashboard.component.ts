import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { combineLatest, forkJoin, lastValueFrom, merge } from 'rxjs';
import { Debate } from 'src/app/models/types/debate';
import { Member } from 'src/app/models/types/member';
import { DebateService } from 'src/app/services/debate.service';
import { MemberService } from 'src/app/services/member.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  public debates: Debate[];

  public members: Member[];

  public loading = false;

  @ViewChild('topTenSpeakersByAverageSps')
  public topTenSpeakersByAverageSps: ElementRef<HTMLCanvasElement>;

  @ViewChild('topTenMembersByFrequency')
  public topTenMembersByFrequency: ElementRef<HTMLCanvasElement>;

  public charts: Chart[] = [];

  constructor(
    private memberService: MemberService,
    private debateService: DebateService,
  ) { }

  ngOnInit(): void {
    this.getData();
  }

  ngAfterViewInit(): void {
    this.generateGraphs();
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
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
      }
    });
  }

  public generateTopTenSpeakersByAverageSpsGraph() {
    const sp: { [id: string]: number } = {};
    const maxSp: { [id: string]: number } = {};
    const minSp: { [id: string]: number } = {};

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

      if (debatesParticipated) sp[member.id] /= debatesParticipated;
    });

    const topTenSpeakers = Object.entries(sp).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const labels = topTenSpeakers.map(([id, sp]) =>
      this.members.find((member) => member.id === id)!.name
        .split(' ').slice(0, 2).join(' ')
    );
    const data = topTenSpeakers.map(([id, sp]) => sp);
    const max = topTenSpeakers.map(([id, sp]) => maxSp[id]);
    const min = topTenSpeakers.map(([id, sp]) => minSp[id]);

    this.charts.push(new Chart(this.topTenSpeakersByAverageSps.nativeElement, {
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
            min: 65,
            max: 80,
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

  public generateTopTenMembersByFrequencyGraph() {
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

    const topTenMembers = Object.entries(debatesParticipated).sort((a, b) => b[1] - a[1]).slice(0, 10);

    const labels = topTenMembers.map(([id, debatesParticipated]) =>
      this.members.find((member) => member.id === id)!.name
        .split(' ').slice(0, 2).join(' ')
    );
    const debaterFrequency = topTenMembers.map(([id, debatesParticipated]) => debatesParticipatedAsDebater[id]);
    const judgeFrequency = topTenMembers.map(([id, debatesParticipated]) => debatesParticipatedAsJudge[id]);

    this.charts.push(new Chart(this.topTenMembersByFrequency.nativeElement, {
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
            min: 0,
            max: 3,
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
      !this.topTenSpeakersByAverageSps ||
      !this.topTenMembersByFrequency
    ) return;

    this.generateTopTenSpeakersByAverageSpsGraph();
    this.generateTopTenMembersByFrequencyGraph();
  }
}
