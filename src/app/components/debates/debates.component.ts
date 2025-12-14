import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { isAdmin } from 'src/app/utils/auth';

@Component({
  selector: 'app-debates',
  templateUrl: './debates.component.html',
  styleUrls: ['./debates.component.scss'],
})
export class DebatesComponent implements OnInit {
  public debates: Debate[] = [];

  constructor(
    private debateService: DebateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDebates();
  }

  public getAllDebates() {
    this.debateService.getAllDebates().subscribe({
      next: (debates: Debate[]) => {
        this.debates = debates.sort((a, b) =>
          this.getDatetimeMoment(b.date, b.time).toDate().getTime() - this.getDatetimeMoment(a.date, a.time).toDate().getTime()
        );
      },
    });
  }

  private getDatetimeMoment(date: string, time: string) {
    let datetime = moment(date);
    datetime = datetime.hour(Number(time.split(':')[0]));
    datetime = datetime.minute(Number(time.split(':')[1]));
    return datetime;
  }

  public get debateCount(): number {
    return this.debates?.length || 0;
  }

  public isAdmin() {
    return isAdmin();
  }

  public navigateToCreateDebate() {
    this.router.navigate(['/debates/create']);
  }
}
