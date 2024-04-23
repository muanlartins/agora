import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Member } from 'src/app/models/types/member';
import { MemberService } from 'src/app/services/member.service';
import { CreateMemberModalComponent } from '../create-member-modal/create-member-modal.component';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { combineLatest } from 'rxjs';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { isAdmin } from 'src/app/utils/auth';
import { trigger, state, style, transition, animate } from '@angular/animations';
import * as removeAccents from 'remove-accents';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-members-table',
  templateUrl: './members-table.component.html',
  styleUrls: ['./members-table.component.scss'],
  animations: [
    trigger('expandDetail', [
      state('collapsed', style({height: '0', margin: '0'})),
      state('expanded', style({height: '*', margin: '1rem 0'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
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
    this.dataSource.filterPredicate = ((data: Member, filter: string) =>
      removeAccents(data.name).toLowerCase().includes(removeAccents(filter).toLowerCase()) ||
      removeAccents(data.society).toLowerCase().includes(removeAccents(filter).toLowerCase())
    );
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
      trainee: [false],
      inactive: [false]
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

    this.form.controls['inactive'].valueChanges.subscribe(() => {
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
    combineLatest([
      this.debateService.getAllDebates(),
      this.memberService.getAllMembers()
    ]).subscribe(([debates, members]) => {
      if (debates && debates.length && members && members.length) {
        this.debates = debates;
        this.members = members;
        this.members.forEach((member) => {
          const debatesParticipations = this.debates.filter((debate) =>
            debate.chair.id === member.id ||
            debate.wings?.some((wing) => wing.id === member.id) ||
            debate.debaters.some((debater) => debater.id === member.id)
          ).length;

          this.debatesParticipations[member.id] = debatesParticipations;
        });
        this.filteredMembers = members;

        this.setDataSource();
      }
    });
  }

  public openCreateMemberModal() {
    this.dialog.open(CreateMemberModalComponent, { width: '80vw', disableClose: true  });
  }

  public getColumnData(element: Member, column: string) {
    if (column === 'name') return element.name;
    if (column === 'society') return element.society;
    if (column === 'debates') return this.debatesParticipations[element.id];

    return '';
  }

  public editMember(id: string, event: Event) {
    event.stopPropagation();

    this.dialog.open(CreateMemberModalComponent, { width: '80vw', data: {
      isEditing: true,
      member: this.members.find((member) => member.id === id)
    }, disableClose: true });
  }

  public deleteMember(id: string, event: Event) {
    event.stopPropagation();

    const member = this.members.find((member) => member.id === id)!;

    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você tem certeza que quer deletar o membro <b>${member.name} (${member.society})</b>?`,
      positiveCallback: async () => {
        await this.memberService.deleteMember(id);
      },
      disableClose: true
    } })
  }

  public setFilters() {
    const active = this.form.controls['active'].value;
    const trainee = this.form.controls['trainee'].value;
    const inactive = this.form.controls['inactive'].value;

    this.filteredMembers = this.members;

    if (active)
      this.filteredMembers = this.filteredMembers.filter((member) =>
        this.debates.some((debate) =>
          debate.chair.id === member.id ||
          debate.wings?.some((wing) => wing.id === member.id) ||
          debate.debaters.some((debater) => debater.id === member.id)
        )
      );

    if (trainee)
      this.filteredMembers = this.filteredMembers.filter((member) => member.isTrainee);

    if (inactive)
      this.filteredMembers = this.filteredMembers.filter((member) =>
        !this.debates.some((debate) =>
          debate.chair.id === member.id ||
          debate.wings?.some((wing) => wing.id === member.id) ||
          debate.debaters.some((debater) => debater.id === member.id)
        )
      )

    this.setDataSource();
  }

  public isAdmin() {
    return isAdmin();
  }

  public getMember(element: Member): Member {
    return element;
  }

  public showEdit(column: string) {
    return column === 'edit' && isAdmin();
  }

  public showDelete(column: string, id: string) {
    return column === 'delete' && this.debatesParticipations[id] === 0 && isAdmin();
  }
}
