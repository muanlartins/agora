import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SelectOption } from 'src/app/models/types/select-option';
import { TournamentService } from 'src/app/services/tournament.service';

// ==========================================================================
// TYPE DEFINITIONS
// ==========================================================================

type Institution = {
  id: string;
  name: string;
};

type Participant = {
  id: string;
  name: string;
  society: string;
  speakerCategories?: string[];
};

type Adjudicator = Omit<Participant, 'speakerCategories'>;
type Speaker = Required<Participant>;

type Team = {
  id: string;
  name: string;
  speakers: Speaker[];
};

type Motion = {
  id: string;
  motion: string;
};

type Venue = {
  id: string;
  venue: string;
};

type SpeakerCategory = {
  id: string;
  speakerCategory: string;
};

type BreakCategory = {
  id: string;
  breakCategory: string;
};

type DebateSide = {
  sideTeam: {
    id: string;
    name: string;
    speakers: Speaker[];
    breakCategories: string[];
  };
  sideSpeakers: {
    speechSpeaker: Speaker;
    speechSps: string;
  }[];
  sideSps: string;
  sideRank: string;
};

type Debate = {
  debateId: string;
  debateWings: Adjudicator[];
  debateChair: Adjudicator;
  debateVenue: string;
  debateMotion: string;
  debateSides: DebateSide[];
};

type Round = {
  roundName: string;
  roundAbbreviation: string;
  isEliminationRound: boolean;
  breakCategory?: string;  // e.g., "BC1", "BC2" - for elimination rounds
  debates: Debate[];
};

type TabbyData = {
  institutions?: Institution[];
  adjudicators?: Adjudicator[];
  speakers?: Speaker[];
  participants?: Participant[];
  teams?: Team[];
  motions?: Motion[];
  venues?: Venue[];
  speakerCategories?: SpeakerCategory[];
  breakCategories?: BreakCategory[];
  tournamentName: string;
  rounds?: Round[];
};

type SpeakerStats = {
  average: number;
  sd: number;
  [round: string]: number;
};

type TeamStats = {
  total: number;
  firsts: number;
  seconds: number;
  [round: string]: number;
};

// ==========================================================================
// COMPONENT
// ==========================================================================

@Component({
  selector: 'app-tabby-archive',
  templateUrl: './tabby-archive.component.html',
  styleUrls: ['./tabby-archive.component.scss']
})
export class TabbyArchiveComponent implements OnInit {
  form: FormGroup;
  tournamentOptions: SelectOption[] = [];
  data: TabbyData | null = null;
  isLoading = false;
  error: string | null = null;

  sps: { [id: string]: SpeakerStats } = {};
  points: { [id: string]: TeamStats } = {};

  // Searchable dropdown
  tournamentFilter = new FormControl('');
  filteredTournaments$: Observable<SelectOption[]> = new Observable();

  // Cached computed values (to avoid infinite change detection loops)
  tournamentWinner: { team: Team | null; speakers: string[] } = { team: null, speakers: [] };
  finalists: Team[] = [];
  speakerCategories: string[] = [];
  eliminationRounds: Round[] = [];
  motionsByRound: { round: Round; motion: string }[] = [];
  topSpeakersByCategory: Map<string, Speaker[]> = new Map();
  topSpeakersByCategoryLimited: Map<string, Speaker[]> = new Map();

  // Per-category cached data
  speakersByCategoryCached: Map<string, Speaker[]> = new Map();
  teamsByCategoryCached: Map<string, Team[]> = new Map();

  // Full data cached
  topSpeakersOpenCached: Speaker[] = [];
  teamStandingsOpenCached: Team[] = [];
  nonEliminationRoundsCached: Round[] = [];

  // Per-category winners and finalists
  winnersByCategory: Map<string, { team: Team | null; speakers: string[] }> = new Map();
  finalistsByCategory: Map<string, Team[]> = new Map();
  breakToSpeakerCategoryMap: Map<string, string> = new Map();

  // Sanitized HTML cache for motions
  private sanitizedMotions: Map<string, SafeHtml> = new Map();

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.form = this.formBuilder.group({
      tournament: ['']
    });
  }

  ngOnInit(): void {
    this.initOptions();
    this.setupTournamentFilter();
  }

  private setupTournamentFilter(): void {
    this.filteredTournaments$ = this.tournamentFilter.valueChanges.pipe(
      startWith(''),
      map(value => this.filterTournaments(value || ''))
    );
  }

  private filterTournaments(value: string): SelectOption[] {
    const filterValue = value.toLowerCase();
    return this.tournamentOptions.filter(opt =>
      opt.viewValue.toLowerCase().includes(filterValue)
    );
  }

  onTournamentSelected(event: any): void {
    const selectedValue = event.option.value;
    const selected = this.tournamentOptions.find(opt => opt.viewValue === selectedValue);
    if (selected) {
      this.getTournamentTabbyData(String(selected.value));
    }
  }

  // ==========================================================================
  // DATA LOADING
  // ==========================================================================

  initOptions(): void {
    this.tournamentService.getAllTournamentOptions().subscribe({
      next: (options: string[]) => {
        this.tournamentOptions = options?.map((option: string) => ({
          value: option.split('.')[0],
          viewValue: option.split('.')[0]
        })) ?? [];
      },
      error: () => {
        this.tournamentOptions = [];
      }
    });
  }

  getTournamentTabbyData(tournament: string): void {
    this.isLoading = true;
    this.error = null;

    this.tournamentService.getTournamentTabbyData(tournament).subscribe({
      next: (data: any) => {
        if (this.validateTabbyData(data)) {
          this.data = data;
          this.calculateStatistics();
          this.sortData();
          this.updateCachedValues();
        } else {
          this.error = 'Dados do torneio inválidos ou incompletos.';
          this.data = null;
          this.clearCachedValues();
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Erro ao carregar dados do torneio.';
        this.data = null;
        this.clearCachedValues();
        this.isLoading = false;
      }
    });
  }

  private updateCachedValues(): void {
    this.tournamentWinner = this.computeTournamentWinner();
    this.finalists = this.computeFinalists();
    this.speakerCategories = this.computeSpeakerCategories();
    this.eliminationRounds = this.computeEliminationRounds();
    this.motionsByRound = this.computeMotionsByRound();

    // Cache full lists for "Todos" tabs
    this.topSpeakersOpenCached = this.getTopSpeakersOpen();
    this.teamStandingsOpenCached = this.getTeamStandingsOpen();
    this.nonEliminationRoundsCached = this.getNonEliminationRounds();

    // Cache top speakers by category (full and limited to 3)
    this.topSpeakersByCategory.clear();
    this.topSpeakersByCategoryLimited.clear();
    this.speakersByCategoryCached.clear();
    this.teamsByCategoryCached.clear();

    for (const cat of this.speakerCategories) {
      this.topSpeakersByCategory.set(cat, this.computeTopSpeakersByCategory(cat));
      this.topSpeakersByCategoryLimited.set(cat, this.computeTopSpeakersByCategory(cat, 3));
      this.speakersByCategoryCached.set(cat, this.computeSpeakersForCategory(cat));
      this.teamsByCategoryCached.set(cat, this.computeTeamsForCategory(cat));
    }

    // Compute winners and finalists by category
    this.breakToSpeakerCategoryMap = this.computeBreakToSpeakerCategoryMap();
    this.winnersByCategory.clear();
    this.finalistsByCategory.clear();
    for (const breakCat of this.data?.breakCategories ?? []) {
      const winner = this.computeWinnerByCategory(breakCat.id);
      const finalists = this.computeFinalistsByCategory(breakCat.id);
      const speakerCategory = this.breakToSpeakerCategoryMap.get(breakCat.id);
      if (speakerCategory) {
        this.winnersByCategory.set(speakerCategory, winner);
        this.finalistsByCategory.set(speakerCategory, finalists);
      }
    }

    // Clear sanitized motions cache for new tournament
    this.sanitizedMotions.clear();
  }

  private clearCachedValues(): void {
    this.tournamentWinner = { team: null, speakers: [] };
    this.finalists = [];
    this.speakerCategories = [];
    this.eliminationRounds = [];
    this.motionsByRound = [];
    this.topSpeakersOpenCached = [];
    this.teamStandingsOpenCached = [];
    this.nonEliminationRoundsCached = [];
    this.topSpeakersByCategory.clear();
    this.topSpeakersByCategoryLimited.clear();
    this.speakersByCategoryCached.clear();
    this.teamsByCategoryCached.clear();
    this.winnersByCategory.clear();
    this.finalistsByCategory.clear();
    this.breakToSpeakerCategoryMap.clear();
    this.sanitizedMotions.clear();
  }

  validateTabbyData(data: any): data is TabbyData {
    return data &&
      typeof data.tournamentName === 'string' &&
      Array.isArray(data.speakers) &&
      Array.isArray(data.teams) &&
      Array.isArray(data.rounds) &&
      Array.isArray(data.adjudicators);
  }

  sortData(): void {
    if (!this.data) return;

    if (this.data.teams) {
      this.data.teams = [...this.data.teams].sort(
        (a, b) => (a.name ?? '').toLowerCase().localeCompare((b.name ?? '').toLowerCase())
      );
    }

    if (this.data.adjudicators) {
      this.data.adjudicators = [...this.data.adjudicators].sort(
        (a, b) => (a.name ?? '').toLowerCase().localeCompare((b.name ?? '').toLowerCase())
      );
    }

    if (this.data.speakers) {
      this.data.speakers = [...this.data.speakers].sort(
        (a, b) => (a.name ?? '').toLowerCase().localeCompare((b.name ?? '').toLowerCase())
      );
    }
  }

  // ==========================================================================
  // SAFE ACCESSORS
  // ==========================================================================

  getSpeakerSps(id: string): SpeakerStats | null {
    return this.sps[id] ?? null;
  }

  getTeamPoints(id: string): TeamStats | null {
    return this.points[id] ?? null;
  }

  getSpeakerAverage(id: string): string {
    return this.sps[id]?.average?.toFixed(2) ?? '-';
  }

  getSpeakerSd(id: string): string {
    return this.sps[id]?.sd?.toFixed(2) ?? '-';
  }

  getSpeakerRoundSps(id: string, roundAbbr: string): string {
    const value = this.sps[id]?.[roundAbbr];
    return value !== undefined ? String(value) : '-';
  }

  getTeamTotal(id: string): number {
    return this.points[id]?.total ?? 0;
  }

  getTeamFirsts(id: string): number {
    return this.points[id]?.firsts ?? 0;
  }

  getTeamSeconds(id: string): number {
    return this.points[id]?.seconds ?? 0;
  }

  getTeamRoundPoints(id: string, roundAbbr: string): string {
    const value = this.points[id]?.[roundAbbr];
    return value !== undefined ? String(value) : '-';
  }

  // ==========================================================================
  // RANKINGS
  // ==========================================================================

  getTopSpeakersOpen(): Speaker[] {
    if (!this.data?.speakers) return [];

    return [...this.data.speakers]
      .filter(s => this.sps[s.id])
      .sort((a, b) => {
        const avgA = this.sps[a.id]?.average ?? 0;
        const avgB = this.sps[b.id]?.average ?? 0;
        if (avgB !== avgA) return avgB - avgA;

        const sdA = this.sps[a.id]?.sd ?? 0;
        const sdB = this.sps[b.id]?.sd ?? 0;
        return sdA - sdB;
      });
  }

  getTopSpeakersNovice(): Speaker[] {
    return this.getTopSpeakersOpen().filter((speaker) =>
      speaker.speakerCategories?.some(cat =>
        ['Novice', 'Novices', 'Iniciado', 'Iniciados'].includes(cat)
      )
    );
  }

  getTeamStandingsOpen(): Team[] {
    if (!this.data?.teams) return [];

    return [...this.data.teams]
      .filter(t => this.points[t.id])
      .sort((a, b) => {
        const totalA = this.points[a.id]?.total ?? 0;
        const totalB = this.points[b.id]?.total ?? 0;
        if (totalB !== totalA) return totalB - totalA;

        const firstsA = this.points[a.id]?.firsts ?? 0;
        const firstsB = this.points[b.id]?.firsts ?? 0;
        if (firstsB !== firstsA) return firstsB - firstsA;

        const secondsA = this.points[a.id]?.seconds ?? 0;
        const secondsB = this.points[b.id]?.seconds ?? 0;
        return secondsB - secondsA;
      });
  }

  // ==========================================================================
  // COMPUTED VALUES (called once when data loads, results cached)
  // ==========================================================================

  private computeSpeakerCategories(): string[] {
    if (!this.data?.speakerCategories) return [];
    return this.data.speakerCategories.map(c => c.speakerCategory);
  }

  getTopSpeakers(limit?: number): Speaker[] {
    const speakers = this.getTopSpeakersOpen();
    return limit ? speakers.slice(0, limit) : speakers;
  }

  getTopTeams(limit?: number): Team[] {
    const teams = this.getTeamStandingsOpen();
    return limit ? teams.slice(0, limit) : teams;
  }

  private computeTopSpeakersByCategory(category: string, limit?: number): Speaker[] {
    const normalizedCategory = category.toLowerCase();
    const speakers = this.getTopSpeakersOpen().filter(speaker =>
      speaker.speakerCategories?.some(cat =>
        cat.toLowerCase().includes(normalizedCategory)
      )
    );
    return limit ? speakers.slice(0, limit) : speakers;
  }

  private computeSpeakersForCategory(category: string): Speaker[] {
    // Returns all speakers (sorted by ranking) who have this category
    return this.getTopSpeakersOpen().filter(speaker =>
      speaker.speakerCategories?.includes(category)
    );
  }

  private computeTeamsForCategory(category: string): Team[] {
    // Returns all teams (sorted by ranking) where at least one speaker has this category
    return this.getTeamStandingsOpen().filter(team =>
      team.speakers?.some(speaker =>
        speaker.speakerCategories?.includes(category)
      )
    );
  }

  private computeEliminationRounds(): Round[] {
    return this.data?.rounds?.filter(round => round.isEliminationRound) ?? [];
  }

  private getFinalRound(): Round | null {
    if (this.eliminationRounds.length === 0) return null;
    // Final is typically the last elimination round
    return this.eliminationRounds[this.eliminationRounds.length - 1] ?? null;
  }

  private computeTournamentWinner(): { team: Team | null; speakers: string[] } {
    // Note: eliminationRounds must be computed first
    const elimRounds = this.data?.rounds?.filter(round => round.isEliminationRound) ?? [];
    if (elimRounds.length === 0) return { team: null, speakers: [] };

    const finalRound = elimRounds[elimRounds.length - 1];
    if (!finalRound?.debates?.[0]?.debateSides) {
      return { team: null, speakers: [] };
    }

    const debate = finalRound.debates[0];
    const winningSide = debate.debateSides.find(side => side?.sideRank === '1');

    if (!winningSide?.sideTeam) {
      return { team: null, speakers: [] };
    }

    const team = this.data?.teams?.find(t => t.id === winningSide.sideTeam.id) ?? null;
    const speakers = winningSide.sideSpeakers?.map(s => s.speechSpeaker?.name).filter(Boolean) as string[] ?? [];

    return { team, speakers };
  }

  private computeBreakToSpeakerCategoryMap(): Map<string, string> {
    const map = new Map<string, string>();
    const breakCats = this.data?.breakCategories ?? [];
    const speakerCats = this.speakerCategories;

    // Map by index: BC1 → speakerCategories[0], BC2 → speakerCategories[1], etc.
    for (let i = 0; i < Math.min(breakCats.length, speakerCats.length); i++) {
      map.set(breakCats[i].id, speakerCats[i]);
    }
    return map;
  }

  private computeWinnerByCategory(breakCategoryId: string): { team: Team | null; speakers: string[] } {
    // Find all elimination rounds for this break category
    const categoryRounds = (this.data?.rounds ?? [])
      .filter(r => r.isEliminationRound && r.breakCategory === breakCategoryId);

    if (categoryRounds.length === 0) return { team: null, speakers: [] };

    // Get the last round (the final for this category)
    const finalRound = categoryRounds[categoryRounds.length - 1];
    const debate = finalRound.debates?.[0];

    if (!debate?.debateSides) return { team: null, speakers: [] };

    // Find winning side (rank = 1)
    const winningSide = debate.debateSides.find(side => side?.sideRank === '1');
    if (!winningSide?.sideTeam) return { team: null, speakers: [] };

    const team = this.data?.teams?.find(t => t.id === winningSide.sideTeam.id) ?? null;
    const speakers = winningSide.sideSpeakers?.map(s => s.speechSpeaker?.name).filter(Boolean) as string[] ?? [];

    return { team, speakers };
  }

  private computeFinalistsByCategory(breakCategoryId: string): Team[] {
    // Find all elimination rounds for this break category
    const categoryRounds = (this.data?.rounds ?? [])
      .filter(r => r.isEliminationRound && r.breakCategory === breakCategoryId);

    if (categoryRounds.length === 0) return [];

    // Get the last round (the final for this category)
    const finalRound = categoryRounds[categoryRounds.length - 1];
    const debate = finalRound.debates?.[0];

    if (!debate?.debateSides) return [];

    // Get all teams that participated in the final
    const teamIds = debate.debateSides
      .filter(side => side?.sideTeam)
      .map(side => side.sideTeam.id);

    return this.data?.teams?.filter(t => teamIds.includes(t.id)) ?? [];
  }

  private computeFinalists(): Team[] {
    // Note: eliminationRounds must be computed first
    const elimRounds = this.data?.rounds?.filter(round => round.isEliminationRound) ?? [];
    if (elimRounds.length === 0) return [];

    const finalRound = elimRounds[elimRounds.length - 1];
    if (!finalRound?.debates?.[0]?.debateSides) return [];

    const debate = finalRound.debates[0];
    const teamIds = debate.debateSides
      .filter(side => side?.sideTeam)
      .map(side => side.sideTeam.id);

    return this.data?.teams?.filter(t => teamIds.includes(t.id)) ?? [];
  }

  private computeMotionsByRound(): { round: Round; motion: string }[] {
    if (!this.data?.rounds) return [];

    return this.data.rounds.map(round => {
      // Get motion from first debate of the round
      const motion = round.debates?.[0]?.debateMotion ?? '';
      return { round, motion };
    });
  }

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  // Sanitize motion HTML for safe rendering
  getSafeMotionHtml(motion: string): SafeHtml {
    if (!motion) return '';
    if (!this.sanitizedMotions.has(motion)) {
      this.sanitizedMotions.set(motion, this.sanitizer.bypassSecurityTrustHtml(motion));
    }
    return this.sanitizedMotions.get(motion)!;
  }

  // Get speakers filtered by category
  getSpeakersForCategory(category: string): Speaker[] {
    return this.speakersByCategoryCached.get(category) ?? [];
  }

  // Get teams filtered by category (team has at least one speaker with the category)
  getTeamsForCategory(category: string): Team[] {
    return this.teamsByCategoryCached.get(category) ?? [];
  }

  // Get finalists for a specific category
  getFinalistsForCategory(category: string): Team[] {
    return this.finalistsByCategory.get(category) ?? [];
  }

  getSideTitle(index: number): string {
    const titles = ['Primeiro Governo', 'Primeira Oposição', 'Segundo Governo', 'Segunda Oposição'];
    return titles[index] ?? `Lado ${index + 1}`;
  }

  getSideRank(rank: string): string {
    const ranks: { [key: string]: string } = {
      '1': '1º',
      '2': '2º',
      '3': '3º',
      '4': '4º'
    };
    return ranks[rank] ?? rank;
  }

  getSideRankFull(rank: string): string {
    const ranks: { [key: string]: string } = {
      '1': 'Primeirou',
      '2': 'Segundou',
      '3': 'Terceirou',
      '4': 'Quartou'
    };
    return ranks[rank] ?? '';
  }

  getTeamSpeakerNames(team: Team): string {
    if (!team.speakers?.length) return '';
    if (team.speakers.length === 1) return team.speakers[0]?.name ?? '';
    if (team.speakers.length >= 2) {
      return `${team.speakers[0]?.name ?? ''} e ${team.speakers[1]?.name ?? ''}`;
    }
    return '';
  }

  getNonEliminationRounds(): Round[] {
    return this.data?.rounds?.filter((round) => !round.isEliminationRound) ?? [];
  }

  getAllRounds(): Round[] {
    return this.data?.rounds ?? [];
  }

  goToLandingPage(): void {
    this.router.navigate(['']);
  }

  // ==========================================================================
  // STATISTICS CALCULATION
  // ==========================================================================

  calculateStatistics(): void {
    if (!this.data) return;

    this.sps = {};
    this.points = {};

    // Initialize speaker stats
    this.data.speakers?.forEach((speaker) => {
      if (speaker?.id) {
        this.sps[speaker.id] = { average: 0, sd: 0 };
      }
    });

    // Initialize team stats
    this.data.teams?.forEach((team) => {
      if (team?.id) {
        this.points[team.id] = { total: 0, firsts: 0, seconds: 0 };
      }
    });

    const totalSps: { [id: string]: number } = {};
    this.data.speakers?.forEach((speaker) => {
      if (speaker?.id) totalSps[speaker.id] = 0;
    });

    const nonEliminationRounds = this.data.rounds?.filter(r => !r.isEliminationRound) ?? [];
    const roundCount = nonEliminationRounds.length || 1;

    // Calculate SPs and points per round
    this.data.rounds?.forEach((round) => {
      if (!round || round.isEliminationRound) return;

      round.debates?.forEach((debate) => {
        debate.debateSides?.forEach((debateSide) => {
          if (!debateSide) return;

          // Team points
          const teamId = debateSide.sideTeam?.id;
          if (teamId && this.points[teamId]) {
            const pts = 4 - Number(debateSide.sideRank || 4);
            this.points[teamId].total += pts;
            this.points[teamId].firsts += (pts === 3 ? 1 : 0);
            this.points[teamId].seconds += (pts === 2 ? 1 : 0);
            this.points[teamId][round.roundAbbreviation] = pts;
          }

          // Speaker points
          const sideSpeakers = debateSide.sideSpeakers ?? [];
          if (sideSpeakers.length === 0) return;

          const uniqueSpeakerIds = [...new Set(sideSpeakers.map(s => s?.speechSpeaker?.id).filter(Boolean))];
          const hasDuplicateSpeaker = uniqueSpeakerIds.length !== sideSpeakers.length;

          if (hasDuplicateSpeaker && sideSpeakers.length >= 2) {
            // Iron person: take max of both speeches
            const speakerId = sideSpeakers[0]?.speechSpeaker?.id;
            if (speakerId && this.sps[speakerId]) {
              const sp1 = Number(sideSpeakers[0]?.speechSps) || 0;
              const sp2 = Number(sideSpeakers[1]?.speechSps) || 0;
              const maxSps = Math.max(sp1, sp2);
              this.sps[speakerId][round.roundAbbreviation] = maxSps;
              totalSps[speakerId] = (totalSps[speakerId] || 0) + maxSps;
            }
          } else {
            // Normal case: each speaker gets their own points
            sideSpeakers.forEach((sideSpeaker) => {
              const speakerId = sideSpeaker?.speechSpeaker?.id;
              if (speakerId && this.sps[speakerId]) {
                const sps = Number(sideSpeaker.speechSps) || 0;
                this.sps[speakerId][round.roundAbbreviation] = sps;
                totalSps[speakerId] = (totalSps[speakerId] || 0) + sps;
              }
            });
          }
        });
      });
    });

    // Calculate averages
    this.data.speakers?.forEach((speaker) => {
      if (speaker?.id && this.sps[speaker.id]) {
        this.sps[speaker.id].average = Number((totalSps[speaker.id] / roundCount).toFixed(2));
      }
    });

    // Calculate standard deviations
    nonEliminationRounds.forEach((round) => {
      this.data?.speakers?.forEach((speaker) => {
        if (speaker?.id && this.sps[speaker.id]) {
          const roundSps = this.sps[speaker.id][round.roundAbbreviation] ?? 0;
          const avg = this.sps[speaker.id].average ?? 0;
          this.sps[speaker.id].sd += Math.pow(avg - roundSps, 2);
        }
      });
    });

    this.data.speakers?.forEach((speaker) => {
      if (speaker?.id && this.sps[speaker.id]) {
        this.sps[speaker.id].sd = Number(Math.sqrt(this.sps[speaker.id].sd / roundCount).toFixed(2));
      }
    });
  }
}
