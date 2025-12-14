import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Chart, ChartConfiguration } from 'chart.js';
import { combineLatest, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Article } from 'src/app/models/types/article';
import { Debate } from 'src/app/models/types/debate';
import { Goal } from 'src/app/models/types/goal';
import { Member } from 'src/app/models/types/member';
import { SelectOption } from 'src/app/models/types/select-option';
import { ArticleService } from 'src/app/services/article.service';
import { DebateService } from 'src/app/services/debate.service';
import { GoalService } from 'src/app/services/goal.service';
import { LoadingService } from 'src/app/services/loading.service';
import { MemberService } from 'src/app/services/member.service';

import {
  DashboardFilters,
  DEFAULT_FILTERS,
  DASHBOARD_CONSTANTS,
  ACTIVITY_PERIOD_OPTIONS,
  ActivityPeriod,
  DebatePeriod
} from './models/dashboard-filter.model';
import { Rank, Statistic } from './models/ranking.model';
import { ChartService, CHART_COLORS } from './services/chart.service';
import { DashboardFilterService } from './services/dashboard-filter.service';
import { RankingService } from './services/ranking.service';

// Set Chart.js defaults
Chart.defaults.color = CHART_COLORS.text;
Chart.defaults.borderColor = CHART_COLORS.border;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // Form & Filters
  form: FormGroup;
  activityPeriodOptions = ACTIVITY_PERIOD_OPTIONS;
  debatePeriodOptions: SelectOption[] = [];
  societyOptions: SelectOption[] = [];
  selectiveProcessOptions: SelectOption[] = [];

  // Data
  private members: Member[] = [];
  private debates: Debate[] = [];
  private articles: Article[] = [];
  private goals: Goal[] = [];

  // Filtered data
  filteredMembers: Member[] = [];
  filteredDebates: Debate[] = [];

  // Display data
  ranks: Rank[] = [];
  statistics: Statistic[] = [];
  charts: Chart[] = [];

  // Chart references
  @ViewChildren('chart')
  chartRefs: QueryList<ElementRef<HTMLCanvasElement>>;

  // Cleanup
  private destroy$ = new Subject<void>();

  get loading() {
    return this.loadingService.loading$.value;
  }

  // Summary stats for header
  get totalDebates(): number {
    return this.filteredDebates.length;
  }

  get activeMembersCount(): number {
    const participations = this.filterService.calculateParticipations(
      this.filteredMembers,
      this.filteredDebates
    );
    return this.filteredMembers.filter(
      m => participations[m.id] >= DASHBOARD_CONSTANTS.MIN_PARTICIPATIONS_FOR_ACTIVE
    ).length;
  }

  get goalsAchieved(): number {
    return this.goals.filter(g => g.currentCount >= g.totalCount).length;
  }

  get totalGoals(): number {
    return this.goals.length;
  }

  constructor(
    private memberService: MemberService,
    private debateService: DebateService,
    private articleService: ArticleService,
    private goalService: GoalService,
    private loadingService: LoadingService,
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef,
    private filterService: DashboardFilterService,
    private rankingService: RankingService,
    private chartService: ChartService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  // Form initialization

  private initForm(): void {
    this.form = this.formBuilder.group({
      debatePeriod: [DEFAULT_FILTERS.debatePeriod],
      activityPeriod: [DEFAULT_FILTERS.activityPeriod],
      society: [DEFAULT_FILTERS.society],
      selectiveProcess: [DEFAULT_FILTERS.selectiveProcess]
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.onFiltersChange());
  }

  // Data fetching

  private getData(): void {
    combineLatest([
      this.memberService.getAllMembers(),
      this.debateService.getAllDebates(),
      this.articleService.getAllArticles(),
      this.goalService.getAllGoals(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([members, debates, articles, goals]) => {
        if (members?.length && debates?.length && articles?.length && goals?.length) {
          this.members = members;
          this.debates = debates;
          this.articles = articles;
          this.goals = goals;

          this.initFilterOptions();
          this.onFiltersChange();
        }
      });
  }

  // Filter options initialization

  private initFilterOptions(): void {
    // Debate period options (years from data)
    const years = this.filterService.getAvailableYears(this.debates);
    this.debatePeriodOptions = [
      { value: DebatePeriod.ALL_TIME, viewValue: 'Todo o tempo' },
      ...years.map(year => ({
        value: year.toString(),
        viewValue: year.toString()
      }))
    ];

    // Society options
    this.societyOptions = [...new Set(this.members.map(m => m.society))].map(society => ({
      value: society,
      viewValue: society
    }));

    // Selective process options
    this.selectiveProcessOptions = [
      ...new Set(this.members.filter(m => m.selectiveProcess).map(m => m.selectiveProcess!))
    ].map(process => ({
      value: process,
      viewValue: process
    }));
  }

  // Filter change handler

  private onFiltersChange(): void {
    const filters: DashboardFilters = {
      debatePeriod: this.form.get('debatePeriod')?.value || DebatePeriod.ALL_TIME,
      activityPeriod: this.form.get('activityPeriod')?.value || ActivityPeriod.ALL_TIME,
      society: this.form.get('society')?.value || null,
      selectiveProcess: this.form.get('selectiveProcess')?.value || null
    };

    // Apply filters - pass all debates for activity period filtering
    const { filteredDebates, filteredMembers } = this.filterService.applyFilters(
      this.debates,
      this.members,
      filters,
      this.debates // allDebates for activity period check
    );

    this.filteredDebates = filteredDebates;
    this.filteredMembers = filteredMembers;

    // Recalculate rankings and statistics
    this.updateRankings();
    this.updateStatistics();

    // Regenerate charts after DOM update
    setTimeout(() => this.generateCharts(), 100);
  }

  // Rankings

  private updateRankings(): void {
    this.ranks = this.rankingService.calculateAllRankings(
      this.filteredDebates,
      this.filteredMembers
    );
  }

  // Statistics

  private updateStatistics(): void {
    this.statistics = [
      {
        title: `Foram realizados <b>${this.filteredDebates.length} Treinos</b>`,
        fields: [
          { title: 'Frequência dos Treinos por <b>Horário</b>', chart: true },
          { title: 'Frequência dos Treinos por <b>Mês</b>', chart: true },
          { title: 'Proporção de Treinos <b>Presenciais</b>', chart: true },
          { title: 'Proporção de <b>Debatedores</b> por <b>Sociedade</b>', chart: true },
          { title: 'Proporção de <b>Juízes</b> por <b>Sociedade</b>', chart: true }
        ]
      },
      {
        title: `Temos <b>${this.activeMembersCount} membros ativos</b> atualmente`,
        fields: [
          { title: '<b>Atividade</b> dos Membros', chart: true, full: true }
        ]
      },
      {
        title: `Atingimos <b>${this.goalsAchieved} Metas</b> de <b>${this.totalGoals}</b>`,
        fields: [
          { title: 'Proporção de <b>Metas Atingidas</b>', chart: true, full: true }
        ]
      },
      {
        title: `Sociedades <b>Parceiras</b>`,
        fields: [
          { title: 'Frequência de Participação das Sociedades', chart: true, full: true }
        ]
      },
      {
        title: `Estatísticas <b>Gerais</b> dos Debates`,
        fields: [
          { title: 'Resultado dos Debates (por casa)', chart: true, full: true }
        ]
      }
    ];
  }

  // Charts

  private generateCharts(): void {
    if (!this.chartRefs?.length) return;

    this.destroyCharts();

    const debatePeriod = this.form.get('debatePeriod')?.value || DebatePeriod.ALL_TIME;
    const configs = this.chartService.generateAllCharts(
      this.filteredDebates,
      this.filteredMembers,
      this.goals,
      debatePeriod
    );

    this.chartRefs.toArray().forEach((ref, index) => {
      if (configs[index]) {
        this.charts.push(new Chart(ref.nativeElement, configs[index] as ChartConfiguration));
      }
    });
  }

  private destroyCharts(): void {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  // UI Helpers

  getPfpSizeByIndex(index: number): number {
    return 128 - 16 * index;
  }

  getIconNameByIndex(index: number): string | undefined {
    const icons = ['first.png', 'second.png', 'third.png'];
    return icons[index];
  }

  // Filter helpers for template

  clearFilters(): void {
    this.form.patchValue({
      debatePeriod: DEFAULT_FILTERS.debatePeriod,
      activityPeriod: DEFAULT_FILTERS.activityPeriod,
      society: DEFAULT_FILTERS.society,
      selectiveProcess: DEFAULT_FILTERS.selectiveProcess
    });
  }

  hasActiveFilters(): boolean {
    const current = this.form.value;
    return (
      current.debatePeriod !== DEFAULT_FILTERS.debatePeriod ||
      current.activityPeriod !== DEFAULT_FILTERS.activityPeriod ||
      current.society !== DEFAULT_FILTERS.society ||
      current.selectiveProcess !== DEFAULT_FILTERS.selectiveProcess
    );
  }
}
