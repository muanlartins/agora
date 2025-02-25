import { Component, Input, OnInit } from '@angular/core';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { CreateDebateModalComponent } from '../create-debate-modal/create-debate-modal.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { isAdmin } from 'src/app/utils/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-debates-table',
  templateUrl: './debates-table.component.html',
  styleUrls: ['./debates-table.component.scss'],
})
export class DebatesTableComponent implements OnInit {
  @Input()
  public debates: Debate[];

  @Input()
  public display: boolean = false;

  public constructor(
    private debateService: DebateService,
    private dialog: MatDialog,
    private router: Router
  ) {
  }

  public ngOnInit(): void {}

  public getDate(date: string, time: string) {
    let datetime = moment(date);

    datetime = datetime.hour(Number(time.split(':')[0]));
    datetime = datetime.minute(Number(time.split(':')[1]));

    return datetime.locale('pt-br').format(`DD MMM, YYYY`);
  }

  public editDebate(id: string, event: any) {
    this.dialog.open(CreateDebateModalComponent, {
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      disableClose: true,
      data: {
        isEditing: true,
        debate: this.debates.find((debate) => debate.id === id)
      }
    });

    event.stopPropagation();
  }

  public deleteDebate(id: string, event: any) {
    const debate = this.debates.find((debate) => debate.id === id)!;

    this.dialog.open(ConfirmModalComponent, { 
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      data: {
        text: `Você tem certeza que quer deletar o debate de data <b>${moment(debate.date)
          .hour(Number(debate.time.split(':')[0]))
          .minute(Number(debate.time.split(':')[1]))
          .locale('pt-br')
          .format(`LLL`)}</b>, moção <b>${debate.motion}
          (${debate.motionTheme})</b>, chair <b>${debate.chair.name} (${debate.chair.society})</b> e debatedores
          <b>${debate.debaters.map((member) => `${member.name} (${member.society})`).join(', ')}</b>?`,
        positiveCallback: async () => {
          await this.debateService.deleteDebate(id);
        },
        negativeCallback: () => {}
      }
    });

    event.stopPropagation();
  }

  public goToDebatePage(id: string) {
    this.router.navigate([`/debate/${id}`]);
  }

  public isAdmin() {
    return isAdmin();
  }

  public showEdit() {
    return isAdmin();
  }

  public showDelete() {
    return isAdmin();
  }
}
