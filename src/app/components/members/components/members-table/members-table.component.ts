import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Member } from 'src/app/models/types/member';
import { MemberService } from 'src/app/services/member.service';
import { CreateMemberModalComponent } from '../create-member-modal/create-member-modal.component';
import { Society } from 'src/app/models/enums/society';

@Component({
  selector: 'app-members-table',
  templateUrl: './members-table.component.html',
  styleUrls: ['./members-table.component.scss']
})
export class MembersTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild(MatSort)
  public sort: MatSort;

  public members: Member[] = [];

  public form: FormGroup;

  public dataSource: MatTableDataSource<Member>;

  public columns: string[] = [];

  public expandedElement?: Member;

  public label: { [column: string]: string } = {
    name: 'Nome',
    society: 'Sociedade'
  }

  public loading: boolean = false;

  public constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private dialog: MatDialog
  ) {
    this.getAllMembers();
  }

  public ngOnInit(): void {
    this.initColumns();
    this.initForm();
  }

  public ngAfterViewInit(): void {
    if (this.members) this.setDataSource();
  }

  public setDataSource() {
    if (!this.members) return;

    this.dataSource = new MatTableDataSource<Member>(this.members);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: ['']
    });

    this.subscribeToValueChanges();
  }

  public subscribeToValueChanges() {
    this.form.controls['name'].valueChanges.subscribe((name) => {
      this.dataSource.filter = name;
    })
  }

  public initColumns() {
    this.columns = [
      'name',
      'society'
    ];
  }

  public getAllMembers() {
    this.loading = true;

    this.memberService.getAllMembers().subscribe({
      next: (members: Member[]) => {
        this.loading = false;
        this.members = members;
        this.setDataSource();
      },
    });
  }

  public openCreateMemberModal() {
    this.dialog.open(CreateMemberModalComponent, { width: '50%' });
  }

  public getColumnData(element: Member, column: string) {
    if (column === 'name') return element.name;
    if (column === 'society') return Society[element.society];

    return '';
  }
}
