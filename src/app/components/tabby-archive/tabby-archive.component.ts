import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectOption } from 'src/app/models/types/select-option';
import { TournamentService } from 'src/app/services/tournament.service';

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
  debates: Debate[];
};

type TabbyData = {
  institutions: Institution[];
  adjudicators: Adjudicator[];
  speakers: Speaker[];
  participants: Participant[];
  teams: Team[];
  motions: Motion[];
  venues: Venue[];
  speakerCategories: SpeakerCategory[];
  breakCategories: BreakCategory[];
  tournamentName: string;
  rounds: Round[];
};

@Component({
  selector: 'app-tabby-archive',
  templateUrl: './tabby-archive.component.html',
  styleUrls: ['./tabby-archive.component.scss']
})
export class TabbyArchiveComponent implements OnInit {
  public form: FormGroup;

  public tournamentOptions: SelectOption[] = [];

  public data: TabbyData;

  public sps: { [id: string]: {
    average: number;
    sd: number;
    [round: string]: number;
  } } = {};

  public points: { [id: string]: {
    total: number;
    [round: string]: number;
    firsts: number;
    seconds: number;
  } } = {};

  @ViewChild('introduction')
  public introductionRef: ElementRef<HTMLElement>;

  @ViewChildren('round')
  public roundRefs: QueryList<ElementRef<HTMLElement>>;

  @ViewChildren('subtitle')
  public subtitleRefs: QueryList<ElementRef<HTMLElement>>;

  constructor(
    private router: Router,
    private tournamentService: TournamentService,
    private formBuilder: FormBuilder
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      tournament: ['']
    });

    this.initOptions();

    this.form.controls['tournament'].valueChanges.subscribe((tournament) => {
      if (tournament) this.getTournamentTabbyData(tournament);
    });
  }

  public initOptions() {
    this.tournamentService.getAllTournamentOptions().subscribe((options: string[]) => {
      this.tournamentOptions = options.map((option: string) => ({
        value: option.split('.')[0],
        viewValue: option.split('.')[0]
      }));
    });
  }

  public getTournamentTabbyData(tournament: string) {
    this.tournamentService.getTournamentTabbyData(tournament).subscribe((data: any) => {
      this.data = data;

      this.calculateStatistics();

      this.data.teams = this.data.teams.sort(
        (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      this.data.adjudicators = this.data.adjudicators.sort(
        (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );

      this.data.speakers = this.data.speakers.sort(
        (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    });
  }

  public getTopSpeakersOpen() {
    return this.data.speakers.sort((a, b) => {
      if (this.sps[a.id].average > this.sps[b.id].average) return -1;
      else if (this.sps[a.id].average < this.sps[b.id].average) return 1;
      else {
        if (this.sps[a.id].sd > this.sps[b.id].sd) return 1;
        else if (this.sps[a.id].sd < this.sps[b.id].sd) return -1;
        return 0;
      }
    });
  }

  public getTopSpeakersNovice() {
    return this.getTopSpeakersOpen().filter((speaker) =>
      speaker.speakerCategories &&
      (
        speaker.speakerCategories.includes('Novice') ||
        speaker.speakerCategories.includes('Novices') ||
        speaker.speakerCategories.includes('Iniciado') ||
        speaker.speakerCategories.includes('Iniciados')
      )
    );
  }

  public getTeamStandingsOpen() {
    return this.data.teams.sort((a, b) => {
      if (this.points[a.id].total > this.points[b.id].total) return -1;
      else if (this.points[a.id].total < this.points[b.id].total) return 1;
      else {
        if (this.points[a.id].firsts > this.points[b.id].firsts) return 1;
        else if (this.points[a.id].firsts < this.points[b.id].firsts) return -1;
        else {
          if (this.points[a.id].seconds > this.points[b.id].seconds) return 1;
          else if (this.points[a.id].seconds < this.points[b.id].seconds) return -1;
          return 0;
        }
      }
    });
  }

  public getSideTitle(index: number) {
    switch(index) {
      case 0:
        return 'Primeiro Governo';
      case 1:
        return 'Primeira Oposição';
      case 2:
        return 'Segundo Governo';
      case 3:
        return 'Segunda Oposição';
      default:
        return;
    }
  }

  public getSideRank(rank: string) {
    switch (rank) {
      case '1':
        return 'Primeirou';
      case '2':
        return 'Segundou';
      case '3':
        return 'Terceirou';
      case '4':
        return 'Quartou';
    }
    return;
  }

  public goToLandingPage() {
    this.router.navigate([""]);
  }

  public scrollToRound(index: number) {
    this.roundRefs.toArray()[index].nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  public scrollToSubtitle(index: number) {
    this.subtitleRefs.toArray()[index].nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  public scrollToIntroduction() {
    this.introductionRef.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  public calculateStatistics() {
    // Debaters SPs
    const totalSps: { [id: string]: number } = {};

    this.data.speakers.forEach((speaker) => {
      totalSps[speaker.id] = 0;
      this.sps[speaker.id] = { average: 0, sd: 0 };
    });

    let nonEliminationRounds = 0;
    this.data.rounds.forEach((round) => {
      if(!round.isEliminationRound) nonEliminationRounds++;
    });

    this.data.rounds.forEach((round) => {
      if (round.isEliminationRound) return;

      round.debates.forEach((debate) => {
        debate.debateSides.forEach((debateSide) => {
          if (
            [...new Set(debateSide.sideSpeakers.map((speaker) => speaker.speechSpeaker.id))].length ===
            debateSide.sideSpeakers.map((speaker) => speaker.speechSpeaker.id).length
          )
            debateSide.sideSpeakers.forEach((sideSpeaker) => {
              this.sps[sideSpeaker.speechSpeaker.id][round.roundAbbreviation] = Number(sideSpeaker.speechSps);
              totalSps[sideSpeaker.speechSpeaker.id] += Number(sideSpeaker.speechSps);
            });
          else {
            this.sps[debateSide.sideSpeakers[0].speechSpeaker.id][round.roundAbbreviation] =
              Math.max(Number(debateSide.sideSpeakers[0].speechSps), Number(debateSide.sideSpeakers[1].speechSps));
            totalSps[debateSide.sideSpeakers[0].speechSpeaker.id] +=
              Math.max(Number(debateSide.sideSpeakers[0].speechSps), Number(debateSide.sideSpeakers[1].speechSps));
          }
        });
      });
    });

    this.data.speakers.forEach((speaker) => {
      this.sps[speaker.id].average = Number((totalSps[speaker.id]/nonEliminationRounds).toFixed(2));
    });

    this.data.rounds.forEach((round) => {
      if (round.isEliminationRound) return;

      this.data.speakers.forEach((speaker) => {
        this.sps[speaker.id].sd +=
          (this.sps[speaker.id].average - this.sps[speaker.id][round.roundAbbreviation])**2;
      });
    });

    this.data.speakers.forEach((speaker) => {
      this.sps[speaker.id].sd /= nonEliminationRounds;
      this.sps[speaker.id].sd = Math.sqrt(this.sps[speaker.id].sd);
    });

    // Team Standings

    this.data.teams.forEach((team) => {
      this.points[team.id] = {
        total: 0,
        firsts: 0,
        seconds: 0,
      };
    });

    this.data.rounds.forEach((round) => {
      if (round.isEliminationRound) return;

      round.debates.forEach((debate) => {
        debate.debateSides.forEach((debateSide) => {
          const points = 4 - Number(debateSide.sideRank);

          this.points[debateSide.sideTeam.id].total += points;
          this.points[debateSide.sideTeam.id].firsts += (points === 3 ? 1 : 0);
          this.points[debateSide.sideTeam.id].seconds += (points === 2 ? 1 : 0);
          this.points[debateSide.sideTeam.id][round.roundAbbreviation] = points;
        });
      });
    });
  }

  public getNonElinimationRounds() {
    return this.data.rounds.filter((round) => !round.isEliminationRound);
  }
}
