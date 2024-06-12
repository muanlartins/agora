import { trigger, state, style, transition, animate } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { CreateDebateModalComponent } from '../create-debate-modal/create-debate-modal.component';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { DebateStyle } from 'src/app/models/enums/debate-style';
import { DebateVenue } from 'src/app/models/enums/debate-venue';
import { DebatePosition } from 'src/app/models/enums/debate-position';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { isAdmin } from 'src/app/utils/auth';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-debates-table',
  templateUrl: './debates-table.component.html',
  styleUrls: ['./debates-table.component.scss'],
  animations: [
    trigger('expandDetail', [
      state('collapsed', style({height: '0', margin: '0'})),
      state('expanded', style({height: '*', margin: '1rem 0'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class DebatesTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  public sort: MatSort;

  public debates: Debate[];

  public form: FormGroup;

  public dataSource: MatTableDataSource<Debate> = new MatTableDataSource();

  public columns: string[] = [];

  public expandedElement?: Debate;

  public label: { [column: string]: string } = {
    'Data': 'Data',
    'Moção': 'Moção',
    'Chair': 'Chair',
  };

  public get DebateStyle() {
    return DebateStyle;
  }

  public get DebateVenue() {
    return DebateVenue;
  }

  public constructor(
    private formBuilder: FormBuilder,
    private debateService: DebateService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {
  }

  public ngOnInit(): void {
    this.initColumns();
    this.initForm();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.getAllDebates();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      year: ['']
    });

    this.subscribeToValueChanges();
  }

  public subscribeToValueChanges() {
    this.form.controls['year'].valueChanges.subscribe((year) => {
      this.dataSource.filter = year;
    })
  }

  public setDataSource() {
    if (!this.debates || !this.debates.length) return;

    this.dataSource.data = this.debates;

    this.changeDetectorRef.detectChanges();
  }

  public initColumns() {
    this.columns = [
      'Data',
      'Moção',
      'Chair',
      'edit',
      'delete'
    ];
  }

  public getColumnData(element: Debate, column: string) {
    if (column === 'Chair') return element.chair.name;
    if (column === 'Moção') return element.motion;
    if (column === 'Data') {
      return this.getDatetimeMoment(element.date, element.time).locale('pt-br').format(`LLL`);
    }

    return '';
  }

  public getAllDebates() {
    this.debateService.getAllDebates().subscribe({
      next: (debates: Debate[]) => {
        this.debates = debates.sort((a, b) =>
          this.getDatetimeMoment(b.date, b.time).toDate().getTime() - this.getDatetimeMoment(a.date, a.time).toDate().getTime()
        );

        this.setDataSource();
      },
    });
  }

  public openCreateDebateModal() {
    this.dialog.open(CreateDebateModalComponent, { height : '90%', disableClose: true });
  }

  public getDatetimeMoment(date: string, time: string) {
    let datetime = moment(date);

    datetime = datetime.hour(Number(time.split(':')[0]));
    datetime = datetime.minute(Number(time.split(':')[1]));

    return datetime;
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

  public getDebate(element: Debate): Debate {
    return element;
  }

  public editDebate(id: string, event: any) {
    this.dialog.open(CreateDebateModalComponent, {
      height: '90%',
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

    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você tem certeza que quer deletar o debate de data <b>${moment(debate.date)
        .hour(Number(debate.time.split(':')[0]))
        .minute(Number(debate.time.split(':')[1]))
        .locale('pt-br')
        .format(`LLL`)}</b>, moção <b>${debate.motion}
        (${debate.motionTheme})</b>, chair <b>${debate.chair.name} (${debate.chair.society})</b> e debatedores
        <b>${debate.debaters.map((member) => `${member.name} (${member.society})`).join(', ')}</b>?`,
      positiveCallback: async () => {
        await this.debateService.deleteDebate(id);
      }
    }});

    event.stopPropagation();
  }

  public isAdmin() {
    return isAdmin();
  }

  public showEdit(column: string) {
    return column === 'edit' && isAdmin();
  }

  public showDelete(column: string) {
    return column === 'delete' && isAdmin();
  }
}
