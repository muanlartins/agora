import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import Chart from 'chart.js/auto';
import { reduce } from 'rxjs';
import { Debate } from 'src/app/models/debate';
import { Debater } from 'src/app/models/debater';
import { Duo } from 'src/app/models/duo';
import { Judge } from 'src/app/models/judge';
import { SelectOption } from 'src/app/models/select-option';
import { TabdebService } from 'src/app/services/tabdeb.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-graphs',
  templateUrl: './graphs.component.html',
  styleUrls: ['./graphs.component.scss']
})
export class GraphsComponent implements OnInit, AfterViewInit {
  @ViewChild('totalSpsBySpeaker')
  public totalSpsBySpeaker: ElementRef<HTMLCanvasElement>;

  @ViewChild('spsBySpeakerAndRound')
  public spsBySpeakerAndRound: ElementRef<HTMLCanvasElement>;

  @ViewChild('spsByJudgeAndRound')
  public spsByJudgeAndRound: ElementRef<HTMLCanvasElement>;

  @ViewChild('positionsByDuoAndRound')
  public positionsByDuoAndRound: ElementRef<HTMLCanvasElement>;

  public debates: Debate[];

  public debaters: Debater[];

  public judges: Judge[];

  public duos: Duo[];

  public form: FormGroup;

  public graphOptions: SelectOption[];

  public graph: string;

  public rounds: string[] = ['R1', 'R2', 'R3', 'R4', 'R5'];

  public motions: string[] = [
    'Esta Casa prefere viver em um mundo onde adultos têm a opção de se submeter ao Kolinahr',
    'EC apoia a filosofia de Darth Traya',
    'EC faria uma nova edição dos Jogos Vorazes com Snow e seus apoiadores.',
    'ECAQ é legítimo o uso das maldições imperdoaveis pelos membros da Ordem da Fênix na luta contra as trevas',
    'ECAQ nenhuma das duas opções é o Navio de Teseu'
  ];

  constructor(
    private tabdebService: TabdebService,
    private utilsService: UtilsService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.getAllDebates();
    this.getAllDebaters();
    this.getAllJudges();
    this.getAllDuos();
    this.initForm();
    this.initGraphOptions();
    this.subscribeToValueChanges();
  }

  public getAllDebates() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDebates(token).subscribe(
      (debates: Debate[]) => this.debates = debates
    );

    this.initGraphs();
  }

  public getAllDebaters() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDebaters(token).subscribe(
      (debaters: Debater[]) => this.debaters = debaters
    );

    this.initGraphs();
  }

  public getAllJudges() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllJudges(token).subscribe(
      (judges: Judge[]) => this.judges = judges
    );

    this.initGraphs();
  }

  public getAllDuos() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDuos(token).subscribe(
      (duos: Duo[]) => this.duos = duos
    );

    this.initGraphs();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      graph: ['']
    });
  }

  public initGraphOptions() {
    this.graphOptions = [
      {
        id: '0',
        value: 'Total de SPs por Debatedor',
      },
      {
        id: '1',
        value: 'SPs por Debatedor por Rodada',
      },
      {
        id: '2',
        value: 'Média de SPs por Debate',
      },
      {
        id: '3',
        value: 'Pontos por Dupla por Rodada',
      }
    ]
  }

  public subscribeToValueChanges() {
    this.form.controls['graph'].valueChanges.subscribe((graph: string) => this.graph = graph)
  }

  ngAfterViewInit(): void {
    this.initGraphs();
  }

  public initGraphs() {
    if (this.debaters && this.debates && this.judges && this.duos && this.totalSpsBySpeaker) {
      this.initTotalSpsBySpeakerGraph();
      this.initSpsBySpeakerAndRoundGraph();
      this.initSpsByJudgeAndRoundGraph();
      this.initPositionsByDuoAndRoundGraph();
    }
  }

  public initTotalSpsBySpeakerGraph() {
    const debatersSps: any = {};
    const maxSps: any = {};
    const minSps: any = {};

    this.debaters.forEach((debater: Debater) => {
      debatersSps[debater.id] = 0;
      maxSps[debater.id] = 0;
      minSps[debater.id] = 100;
    });

    this.debates.forEach((debate: Debate) => {
      debatersSps[debate.pm.id] += debate.pmSp;
      debatersSps[debate.lo.id] += debate.loSp;
      debatersSps[debate.dpm.id] += debate.dpmSp;
      debatersSps[debate.dlo.id] += debate.dloSp;
      debatersSps[debate.mg.id] += debate.mgSp;
      debatersSps[debate.mo.id] += debate.moSp;
      debatersSps[debate.gw.id] += debate.gwSp;
      debatersSps[debate.ow.id] += debate.owSp;

      maxSps[debate.pm.id] = Math.max(debate.pmSp, maxSps[debate.pm.id]);
      maxSps[debate.lo.id] = Math.max(debate.loSp, maxSps[debate.lo.id]);
      maxSps[debate.dpm.id] = Math.max(debate.dpmSp, maxSps[debate.dpm.id]);
      maxSps[debate.dlo.id] = Math.max(debate.dloSp, maxSps[debate.dlo.id]);
      maxSps[debate.mg.id] = Math.max(debate.mgSp, maxSps[debate.mg.id]);
      maxSps[debate.mo.id] = Math.max(debate.moSp, maxSps[debate.mo.id]);
      maxSps[debate.gw.id] = Math.max(debate.gwSp, maxSps[debate.gw.id]);
      maxSps[debate.ow.id] = Math.max(debate.owSp, maxSps[debate.ow.id]);

      minSps[debate.pm.id] = Math.min(debate.pmSp, minSps[debate.pm.id]);
      minSps[debate.lo.id] = Math.min(debate.loSp, minSps[debate.lo.id]);
      minSps[debate.dpm.id] = Math.min(debate.dpmSp, minSps[debate.dpm.id]);
      minSps[debate.dlo.id] = Math.min(debate.dloSp, minSps[debate.dlo.id]);
      minSps[debate.mg.id] = Math.min(debate.mgSp, minSps[debate.mg.id]);
      minSps[debate.mo.id] = Math.min(debate.moSp, minSps[debate.mo.id]);
      minSps[debate.gw.id] = Math.min(debate.gwSp, minSps[debate.gw.id]);
      minSps[debate.ow.id] = Math.min(debate.owSp, minSps[debate.ow.id]);

    });

    const graph = this.debaters.filter((debater: Debater) => debater.name !== 'Desconhecido')
      .map((debater: Debater) => ({
        label: debater.name,
        data: debatersSps[debater.id],
        max: maxSps[debater.id],
        min: minSps[debater.id]
      })).sort((a, b) => a.data - b.data);

    const labels = graph.map((data) => data.label);
    const data = graph.map((data) => data.data/5);
    const max = graph.map((data) => data.max);
    const min = graph.map((data) => data.min);

    new Chart(this.totalSpsBySpeaker.nativeElement, {
      options: {
        scales: {
          y: {
            min: 68,
            max: 77
          }
        }
      },
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Menor SP por Debatedor',
            data: min,
            backgroundColor: data.map(() => 'rgba(128,0,0,0.9)'),
            borderColor: data.map(() => 'rgba(128,0,0,0.9)')
          },
          {
            type: 'line',
            label: 'Maior SP por Debatedor',
            data: max,
            backgroundColor: data.map(() => 'rgba(255,127,80,0.9)'),
            borderColor: data.map(() => 'rgba(255,127,80,0.9)')
          },
          {
            type: 'bar',
            label: 'Total de SPs por Debatedor',
            data: data,
            backgroundColor: data.map(() => 'rgba(0,128,128,0.5)'),
            borderColor: data.map(() => 'rgba(0,128,128,0.5)')
          },
        ]
      }
    });
  }

  public initSpsBySpeakerAndRoundGraph() {
    const debatersSpsByRound: any = {};

    const roundByMotion: any = {
      'Esta Casa prefere viver em um mundo onde adultos têm a opção de se submeter ao Kolinahr': 'R1',
      'EC apoia a filosofia de Darth Traya': 'R2',
      'EC faria uma nova edição dos Jogos Vorazes com Snow e seus apoiadores.': 'R3',
      'ECAQ é legítimo o uso das maldições imperdoaveis pelos membros da Ordem da Fênix na luta contra as trevas': 'R4',
      'ECAQ nenhuma das duas opções é o Navio de Teseu': 'R5'
    }

    const rounds = ['R1', 'R2', 'R3', 'R4', 'R5'];

    this.debaters.forEach((debater: Debater) => debatersSpsByRound[debater.id] = {
      R1: 0,
      R2: 0,
      R3: 0,
      R4: 0,
      R5: 0,
    });

    this.debates.forEach((debate: Debate) => {
      debatersSpsByRound[debate.pm.id][roundByMotion[debate.motion]] += debate.pmSp;
      debatersSpsByRound[debate.lo.id][roundByMotion[debate.motion]] += debate.loSp;
      debatersSpsByRound[debate.dpm.id][roundByMotion[debate.motion]] += debate.dpmSp;
      debatersSpsByRound[debate.dlo.id][roundByMotion[debate.motion]] += debate.dloSp;
      debatersSpsByRound[debate.mg.id][roundByMotion[debate.motion]] += debate.mgSp;
      debatersSpsByRound[debate.mo.id][roundByMotion[debate.motion]] += debate.moSp;
      debatersSpsByRound[debate.gw.id][roundByMotion[debate.motion]] += debate.gwSp;
      debatersSpsByRound[debate.ow.id][roundByMotion[debate.motion]] += debate.owSp;
    });

    const debatersData = this.debaters.filter((debater: Debater) => debater.name !== 'Desconhecido')
      .map((debater: Debater) => ({
        label: debater.name,
        data: rounds.map((round: string) => debatersSpsByRound[debater.id][round])
      }));

    new Chart(this.spsBySpeakerAndRound.nativeElement, {
      type: 'line',
      options: {
        scales: {
          y: {
            min: 68,
            max: 77
          }
        }
      },
      data: {
        labels: rounds,
        datasets: debatersData.map((debaterData) => ({
          label: debaterData.label,
          data: debaterData.data,
          fill: false
        }))
      }
    });
  }

  public initSpsByJudgeAndRoundGraph() {
    const averageSpsByDebate: any = {};
    const maxSps: any = {};
    const minSps: any = {};

    this.debates.forEach((debate: Debate) => {
      const debateSpAverage =
        (debate.pmSp +
        debate.loSp +
        debate.dpmSp +
        debate.dloSp +
        debate.mgSp +
        debate.moSp +
        debate.gwSp +
        debate.owSp) / 8;

        averageSpsByDebate[debate.id] = debateSpAverage;
        maxSps[debate.id] = Math.max(
          debate.pmSp,
          debate.loSp,
          debate.dpmSp,
          debate.dloSp,
          debate.mgSp,
          debate.moSp,
          debate.gwSp,
          debate.owSp
        )

        minSps[debate.id] = Math.min(
          debate.pmSp,
          debate.loSp,
          debate.dpmSp,
          debate.dloSp,
          debate.mgSp,
          debate.moSp,
          debate.gwSp,
          debate.owSp
        )
    });

    const debatesData = this.debates
      .map((debate: Debate) => ({
        label: debate.chair.name,
        data: averageSpsByDebate[debate.id],
        max: maxSps[debate.id],
        min: minSps[debate.id]
      }));

    const labels = debatesData.map((debateData) => debateData.label);
    const data = debatesData.map((debateData) => debateData.data);
    const max = debatesData.map((debateData) => debateData.max);
    const min = debatesData.map((debateData) => debateData.min);

    new Chart(this.spsByJudgeAndRound.nativeElement, {
      options: {
        scales: {
          y: {
            min: 64,
            max: 77,
            ticks: {
              stepSize: 1
            }
          },

        }
      },
      data: {
        labels,
        datasets: [
          {
            type: 'line',
            label: 'Menor SP por Debatedor',
            data: min,
            backgroundColor: data.map(() => 'rgba(128,0,0,0.9)'),
            borderColor: data.map(() => 'rgba(128,0,0,0.9)')
          },
          {
            type: 'line',
            label: 'Maior SP por Debatedor',
            data: max,
            backgroundColor: data.map(() => 'rgba(255,127,80,0.9)'),
            borderColor: data.map(() => 'rgba(255,127,80,0.9)')
          },
          {
            type: 'bar',
            label: 'Total de SPs por Debatedor',
            data: data,
            backgroundColor: data.map(() => 'rgba(0,128,128,0.5)'),
            borderColor: data.map(() => 'rgba(0,128,128,0.5)')
          },
        ]
      }
    });
  }

  public initPositionsByDuoAndRoundGraph() {
    const positionsByRound: any = {};

    const roundByMotion: any = {
      'Esta Casa prefere viver em um mundo onde adultos têm a opção de se submeter ao Kolinahr': 'R1',
      'EC apoia a filosofia de Darth Traya': 'R2',
      'EC faria uma nova edição dos Jogos Vorazes com Snow e seus apoiadores.': 'R3',
      'ECAQ é legítimo o uso das maldições imperdoaveis pelos membros da Ordem da Fênix na luta contra as trevas': 'R4',
      'ECAQ nenhuma das duas opções é o Navio de Teseu': 'R5'
    }

    const rounds = ['R1', 'R2', 'R3', 'R4', 'R5'];
    const motions = [
      'Esta Casa prefere viver em um mundo onde adultos têm a opção de se submeter ao Kolinahr',
      'EC apoia a filosofia de Darth Traya',
      'EC faria uma nova edição dos Jogos Vorazes com Snow e seus apoiadores.',
      'ECAQ é legítimo o uso das maldições imperdoaveis pelos membros da Ordem da Fênix na luta contra as trevas',
      'ECAQ nenhuma das duas opções é o Navio de Teseu'
    ];

    this.duos.forEach((duo: Duo) => positionsByRound[duo.id] = {
      R1: 0,
      R2: 0,
      R3: 0,
      R4: 0,
      R5: 0,
    });

    this.debates.forEach((debate: Debate) => {
      const duosSps = {
        og: debate.pmSp + debate.dpmSp,
        oo: debate.loSp + debate.dloSp,
        cg: debate.mgSp + debate.gwSp,
        co: debate.moSp + debate.owSp
      };

      const order = Object.entries(duosSps).sort((a, b) => a[1] - b[1]);

      const duosPoints: any = {};

      order.forEach((position, index) => duosPoints[position[0]] = index);

      positionsByRound[debate.og.id][roundByMotion[debate.motion]] = duosPoints.og;
      positionsByRound[debate.oo.id][roundByMotion[debate.motion]] = duosPoints.oo;
      positionsByRound[debate.cg.id][roundByMotion[debate.motion]] = duosPoints.cg;
      positionsByRound[debate.co.id][roundByMotion[debate.motion]] = duosPoints.co;
    });

    const duosData = this.duos.filter((duo: Duo) => duo.a.name !== 'Desconhecido' && duo.b.name !== 'Desconhecido')
      .map((duo: Duo) => ({
        label: this.utilsService.getDuoName(duo),
        data: rounds.map((round: string) => positionsByRound[duo.id][round])
      }));

    new Chart(this.positionsByDuoAndRound.nativeElement, {
      type: 'line',
      options: {
        scales: {
          y: {
            min: 0,
            max: 3,
            ticks: {
              stepSize: 1
            }
          }
        },
      },
      data: {
        labels: rounds,
        datasets: duosData.map((duoData) => ({
          label: duoData.label,
          data: duoData.data,
          fill: false
        }))
      }
    });
  }
}
