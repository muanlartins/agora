import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { DebatePosition } from 'src/app/models/enums/debate-position';
import { DebateStyle } from 'src/app/models/enums/debate-style';
import { DebateVenue } from 'src/app/models/enums/debate-venue';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { isUser, isAdmin } from 'src/app/utils/auth';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-debate',
  templateUrl: './debate.component.html',
  styleUrls: ['./debate.component.scss']
})
export class DebateComponent implements OnInit {
  public debate: Debate;

  public get DebateStyle() {
    return DebateStyle;
  }

  public get DebateVenue() {
    return DebateVenue;
  }

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private debateService: DebateService,
    private dialog: MatDialog
  ) {}

  public ngOnInit() {
    this.route.params.subscribe(async (params: any) => {
      if (params && params.id) {
        const debateId = params.id;
        const debate = await this.debateService.getDebate(debateId);

        if (!debate) {
          this.goToDebatesPage();
          return;
        }

        this.debate = debate;
      }
    });
  }

  public getDate(date: string, time: string): string {
    let datetime = moment(date);
    datetime = datetime.hour(Number(time.split(':')[0]));
    datetime = datetime.minute(Number(time.split(':')[1]));
    return datetime.locale('pt-br').format('LLL');
  }

  public goToDebatesPage(): void {
    this.router.navigate(['/debates']);
  }

  public isUser(): boolean {
    return isUser();
  }

  public isAdmin(): boolean {
    return isAdmin();
  }

  public editDebate(): void {
    this.router.navigate([`/debates/edit/${this.debate.id}`]);
  }

  public deleteDebate(): void {
    this.dialog.open(ConfirmModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {
        text: `Você tem certeza que quer deletar este debate?`,
        positiveCallback: async () => {
          await this.debateService.deleteDebate(this.debate.id);
          this.goToDebatesPage();
        },
        negativeCallback: () => {}
      }
    });
  }

  public getHouses(debate: Debate) {
    const houses = [];

    if (debate.debaters && debate.debaters.length >= 4) {
      houses.push(
        {
          debaters: [
            {
              position: DebatePosition.pm,
              debater: debate.debaters[0],
              sps: debate.sps?.[0]
            },
            {
              position: DebatePosition.dpm,
              debater: debate.debaters[2],
              sps: debate.sps?.[2]
            }
          ],
          title: 'Primeiro Governo (1G)',
          index: 0
        }
      );

      houses.push(
        {
          debaters: [
            {
              position: DebatePosition.lo,
              debater: debate.debaters[1],
              sps: debate.sps?.[1]
            },
            {
              position: DebatePosition.dlo,
              debater: debate.debaters[3],
              sps: debate.sps?.[3]
            }
          ],
          title: 'Primeira Oposição (1O)',
          index: 1
        }
      );
    }

    if (debate.debaters && debate.debaters.length >= 8) {
      houses.push(
        {
          debaters: [
            {
              position: DebatePosition.mg,
              debater: debate.debaters[4],
              sps: debate.sps?.[4]
            },
            {
              position: DebatePosition.gw,
              debater: debate.debaters[6],
              sps: debate.sps?.[6]
            }
          ],
          title: 'Segundo Governo (2G)',
          index: 2
        }
      );

      houses.push(
        {
          debaters: [
            {
              position: DebatePosition.mo,
              debater: debate.debaters[5],
              sps: debate.sps?.[5]
            },
            {
              position: DebatePosition.ow,
              debater: debate.debaters[7],
              sps: debate.sps?.[7]
            }
          ],
          title: 'Segunda Oposição (2O)',
          index: 3
        }
      );
    }

    houses.sort((a, b) => debate.points[b.index] - debate.points[a.index]);

    return houses;
  }
}
