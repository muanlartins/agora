import { Component, Input } from '@angular/core';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { isAdmin } from 'src/app/utils/auth';
import { Router } from '@angular/router';
import { DebateStyle } from 'src/app/models/enums/debate-style';
import { DebateVenue } from 'src/app/models/enums/debate-venue';

@Component({
  selector: 'app-debates-table',
  templateUrl: './debates-table.component.html',
  styleUrls: ['./debates-table.component.scss'],
})
export class DebatesTableComponent {
  @Input() public debates: Debate[] = [];

  public constructor(
    private debateService: DebateService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  public getDate(date: string, time: string): string {
    let datetime = moment(date);
    datetime = datetime.hour(Number(time.split(':')[0]));
    datetime = datetime.minute(Number(time.split(':')[1]));
    return datetime.locale('pt-br').format('DD MMM, YYYY');
  }

  public getStyleLabel(style: keyof typeof DebateStyle): string {
    return style === 'bp' ? 'BP' : 'Fund.';
  }

  public getVenueLabel(venue: keyof typeof DebateVenue): string {
    return DebateVenue[venue];
  }

  public editDebate(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate([`/debates/edit/${id}`]);
  }

  public deleteDebate(id: string, event: Event): void {
    event.stopPropagation();
    const debate = this.debates.find((d) => d.id === id);
    if (!debate) return;

    this.dialog.open(ConfirmModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        text: `Você tem certeza que quer deletar o debate de <b>${this.getDate(debate.date, debate.time)}</b>?`,
        positiveCallback: async () => {
          await this.debateService.deleteDebate(id);
        },
        negativeCallback: () => {}
      }
    });
  }

  public goToDebatePage(id: string): void {
    this.router.navigate([`/debate/${id}`]);
  }

  public isAdmin(): boolean {
    return isAdmin();
  }
}
