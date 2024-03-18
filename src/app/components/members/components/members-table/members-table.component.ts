import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
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
import { combineLatest } from 'rxjs';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-members-table',
  templateUrl: './members-table.component.html',
  styleUrls: ['./members-table.component.scss']
})
export class MembersTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  public sort: MatSort;

  public members: Member[] = [];

  public filteredMembers: Member[] = [];

  public debates: Debate[] = [];

  public form: FormGroup;

  public dataSource: MatTableDataSource<Member> = new MatTableDataSource<Member>();

  public columns: string[] = [];

  public expandedElement?: Member;

  public label: { [column: string]: string } = {
    name: 'Nome',
    society: 'Sociedade',
    debates: 'Debates Participados'
  }

  public debatesParticipations: { [id: string]: number } = {};

  public loading: boolean = false;

  public constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
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

    this.getData();
  }

  public setDataSource() {
    if (!this.filteredMembers) return;

    this.dataSource.data = this.filteredMembers;

    this.changeDetectorRef.detectChanges();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: [''],
      active: [false],
      trainee: [false]
    });

    this.subscribeToValueChanges();
  }

  public subscribeToValueChanges() {
    this.form.controls['name'].valueChanges.subscribe((name) => {
      this.dataSource.filter = name;
    });

    this.form.controls['active'].valueChanges.subscribe(() => {
      this.setFilters();
    });

    this.form.controls['trainee'].valueChanges.subscribe(() => {
      this.setFilters();
    });
  }

  public initColumns() {
    this.columns = [
      'name',
      'society',
      'debates',
      'edit',
      'delete'
    ];
  }

  public getData() {
    this.loading = true;

    combineLatest([
      this.debateService.getAllDebates(),
      this.memberService.getAllMembers()
    ]).subscribe(([debates, members]) => {
      this.loading = false;
      this.debates = debates;
      this.members = members;
      this.members.forEach((member) => {
        const debatesParticipations = this.debates.filter((debate) =>
          debate.chair.id === member.id ||
          debate.wings?.some((wing) => wing.id === member.id) ||
          debate.debaters?.some((debater) => debater.id === member.id)
        ).length;

        this.debatesParticipations[member.id] = debatesParticipations;
      });
      this.filteredMembers = members;

      this.setDataSource();
    });
  }

  public openCreateMemberModal() {
    this.dialog.open(CreateMemberModalComponent, { width: '70%' });
  }

  public getColumnData(element: Member, column: string) {
    if (column === 'name') return element.name;
    if (column === 'society') return Society[element.society];
    if (column === 'debates') return this.debatesParticipations[element.id];

    return '';
  }

  public editMember(id: string) {
    this.dialog.open(CreateMemberModalComponent, { width: '70%', data: {
      isEditing: true,
      member: this.members.find((member) => member.id === id)
    }});
  }

  public deleteMember(id: string) {
    const member = this.members.find((member) => member.id === id)!;

    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você tem certeza que quer deletar o membro <b>${member.name} (${Society[member.society]})</b>?`,
      callback: async () => {
        this.loading = true;
        await this.memberService.deleteMember(id);
        this.loading = false;
      }
    } })
  }

  public setFilters() {
    const active = this.form.controls['active'].value;
    const trainee = this.form.controls['trainee'].value;

    this.filteredMembers = this.members;

    if (active)
      this.filteredMembers = this.filteredMembers.filter((member) =>
        this.debates.some((debate) =>
          debate.chair.id === member.id ||
          debate.wings?.some((wing) => wing.id === member.id) ||
          debate.debaters?.some((debater) => debater.id === member.id)
        )
      );

    if (trainee)
      this.filteredMembers = this.filteredMembers.filter((member) => member.isTrainee);

    this.setDataSource();
  }
}
