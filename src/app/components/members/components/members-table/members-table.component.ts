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
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';

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

  public filteredMembers: Member[] = [];

  public debates: Debate[] = [];

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
    private debateService: DebateService,
    private dialog: MatDialog
  ) {
    this.getAllMembers();
    this.getAllDebates();
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

    this.dataSource = new MatTableDataSource<Member>(this.filteredMembers);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: [''],
      active: [false]
    });

    this.subscribeToValueChanges();
  }

  public subscribeToValueChanges() {
    this.form.controls['name'].valueChanges.subscribe((name) => {
      this.dataSource.filter = name;
    });

    this.form.controls['active'].valueChanges.subscribe((active) => {
      if (active) {
        this.filteredMembers = this.members.filter((member) =>
          this.debates.some((debate) =>
            debate.chair.id === member.id ||
            debate.wings?.some((wing) => wing.id === member.id) ||
            debate.debaters?.some((debater) => debater.id === member.id)
          )
        );
        this.setDataSource();
      } else {
        this.filteredMembers = this.members;
        this.setDataSource();
      }
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

    this.debateService.getAllDebates().subscribe({
      next: (debates: Debate[]) => {
        this.loading = false;
        this.debates = debates;
      },
    });
  }

  public getAllDebates() {
    this.loading = true;

    this.memberService.getAllMembers().subscribe({
      next: (members: Member[]) => {
        this.loading = false;
        this.members = members;
        this.filteredMembers = members;
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
