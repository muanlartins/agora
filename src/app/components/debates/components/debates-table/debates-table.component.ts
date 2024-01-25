import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { MotionType } from 'src/app/models/enums/motion-type';
import { MotionTheme } from 'src/app/models/enums/motion-theme';
import { DebatePosition } from 'src/app/models/enums/debate-position';
import { Society } from 'src/app/models/enums/society';

@Component({
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
export class DebatesTableComponent implements OnInit {

  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild(MatSort)
  public sort: MatSort;

  public debates: Debate[];

  public form: FormGroup;

  public dataSource: MatTableDataSource<Debate>;

  public columns: string[] = [];

  public expandedElement?: Debate;

  public loading: boolean = false;

  public constructor(
    private formBuilder: FormBuilder,
    private debateService: DebateService,
    private dialog: MatDialog
  ) {
    this.getAllDebates();
  }

  public ngOnInit(): void {
    this.initColumns();
    this.initForm();
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
    if (!this.debates) return;

    this.dataSource = new MatTableDataSource<Debate>(this.debates);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public initColumns() {
    this.columns = [
      'Data',
      'Moção',
      'Chair'
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
    this.loading = true;
    this.debateService.getAllDebates().subscribe((debates: Debate[]) => {
      this.loading = false;
      this.debates = debates.sort((a, b) =>
        this.getDatetimeMoment(b.date, b.time).toDate().getTime() - this.getDatetimeMoment(a.date, a.time).toDate().getTime()
      );

      this.setDataSource();
    });
  }

  public openCreateDebateModal() {
    this.dialog.open(CreateDebateModalComponent);
  }

  public getDatetimeMoment(date: string, time: string) {
    if (date.length === 10) {
      const day = date.split('/')[0];
      const month = date.split('/')[1];
      const year = date.split('/')[2];
      const hour = time.replace('h', '');

      const dateIsoString = `${year}-${month}-${day}T${hour}:00:00-0300`;

      const datetime = moment(dateIsoString);

      return datetime;
    } else {
      let datetime = moment(date);

      datetime = datetime.hour(Number(time.split(':')[0]));
      datetime = datetime.minute(Number(time.split(':')[1]));

      return datetime;
    }
  }

  public getDetails(element: Debate) {
    const details: {
      title: string,
      value: any,
      detail?: any
    }[] = [
      {
        title: 'Estilo',
        value: DebateStyle[element.style]
      },
      {
        title: 'Lugar',
        value: DebateVenue[element.venue]
      },
      {
        title: 'Tipo da Moção',
        value: MotionType[element.motionType]
      },
      {
        title: 'Tema da Moção',
        value: MotionTheme[element.motionTheme]
      },
    ];

    if (element.infoSlides) element.infoSlides.forEach((infoSlide, index) =>
      details.push({
        title: `InfoSlide ${index+1}`,
        value: infoSlide
      })
    );

    if (element.debaters) element.debaters.forEach((debater, index) => {
      const debatePositions = Object.entries(DebatePosition);

      details.push({
        title: debatePositions[index][1],
        value: `${debater.name} (${Society[debater.society]})`,
        detail: element.sps ? element.sps[index] : ''
      });
    });

    if (element.wings) element.wings.forEach((wing, index) =>
      details.push({
        title: `Wing ${index+1}`,
        value: `${wing.name} (${Society[wing.society]})`
      })
    );

    return details;
  }
}
