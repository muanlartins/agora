import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { isAdmin } from 'src/app/utils/auth';
import { CreateDebateModalComponent } from './components/create-debate-modal/create-debate-modal.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-debates',
  templateUrl: './debates.component.html',
  styleUrls: ['./debates.component.scss'],
})
export class DebatesComponent implements OnInit {
  public debates: Debate[];

  public form: FormGroup;

  public dataSource: MatTableDataSource<Debate> = new MatTableDataSource();

  constructor(
    private debateService: DebateService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getAllDebates();
    this.initForm();
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

  public getDatetimeMoment(date: string, time: string) {
    let datetime = moment(date);

    datetime = datetime.hour(Number(time.split(':')[0]));
    datetime = datetime.minute(Number(time.split(':')[1]));

    return datetime;
  }

  public isAdmin() {
    return isAdmin();
  }

  public openCreateDebateModal() {
    this.dialog.open(CreateDebateModalComponent, { height : '90%', disableClose: true });
  }
}
