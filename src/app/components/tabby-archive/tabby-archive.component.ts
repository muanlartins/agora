import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TournamentService } from 'src/app/services/tournament.service';

@Component({
  selector: 'app-tabby-archive',
  templateUrl: './tabby-archive.component.html',
  styleUrls: ['./tabby-archive.component.scss']
})
export class TabbyArchiveComponent implements OnInit {
  public form: FormGroup;

  public data: any;

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

    this.form.controls['tournament'].valueChanges.subscribe((tournament) => {
      if (tournament) this.getTournamentTabbyData(tournament);
    });
  }

  public getTournamentTabbyData(tournament: string) {
    this.tournamentService.getTournamentTabbyData(tournament).subscribe((data: any) => {
      this.data = data;
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

  public getSideRank(rank: '1' | '2' | '3' | '4') {
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
  }

  public goToLandingPage() {
    this.router.navigate([""]);
  }
}
