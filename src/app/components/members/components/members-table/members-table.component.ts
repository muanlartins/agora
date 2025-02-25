import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Member } from 'src/app/models/types/member';
import { MemberService } from 'src/app/services/member.service';
import { CreateMemberModalComponent } from '../create-member-modal/create-member-modal.component';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { combineLatest } from 'rxjs';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { isAdmin } from 'src/app/utils/auth';
import { Clipboard } from '@angular/cdk/clipboard';
import { NotificationService } from 'src/app/services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-members-table',
  templateUrl: './members-table.component.html',
  styleUrls: ['./members-table.component.scss'],
})
export class MembersTableComponent implements OnInit {
  public members: Member[] = [];

  public filteredMembers: Member[] = [];

  public debates: Debate[] = [];

  public form: FormGroup;

  public debatesParticipations: { [id: string]: number } = {};

  public constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private debateService: DebateService,
    private dialog: MatDialog,
    private clipboard: Clipboard,
    private notificationService: NotificationService,
    private router: Router,
  ) {

  }

  public ngOnInit(): void {
    this.initForm();
    this.getData();
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
    this.form.controls['name'].valueChanges.subscribe(() => {
      this.setFilters();
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
      }
    });
  }

  public openCreateMemberModal() {
    this.dialog.open(CreateMemberModalComponent, { 
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      disableClose: true  
    });
  }

  public async copyPublicUrl(id: string, event: Event) {
    event.stopPropagation();

    this.clipboard.copy(`https://agoradebates.com/member/${id}`);
    this.notificationService.createSuccessNotification('A <b>URL Pública</b> foi copiada com sucesso.');
  }

  public async copyPrivateUrl(id: string, event: Event) {
    event.stopPropagation();

    const hashedId = (await this.memberService.getHashedId(id));

    this.clipboard.copy(`https://agoradebates.com/member/${id}/private/${hashedId}`);
    this.notificationService.createSuccessNotification('A <b>URL Privada</b> foi copiada com sucesso.');
  }

  public editMember(id: string, event: Event) {
    event.stopPropagation();

    this.dialog.open(CreateMemberModalComponent, { 
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      data: {
        isEditing: true,
        member: this.members.find((member) => member.id === id)
      }, 
      disableClose: true 
    });
  }

  public deleteMember(id: string, event: Event) {
    event.stopPropagation();

    const member = this.members.find((member) => member.id === id)!;

    this.dialog.open(ConfirmModalComponent, { 
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      data: {
        text: `Você tem certeza que quer deletar o membro <b>${member.name} (${member.society})</b>?`,
        positiveCallback: async () => {
          await this.memberService.deleteMember(id);
        },
        negativeCallback: () => {}
      }, 
    })
  }

  public setFilters() {
    const name = this.form.controls['name'].value;
    const active = this.form.controls['active'].value;
    const trainee = this.form.controls['trainee'].value;
    const inactive = this.form.controls['inactive'].value;

    this.filteredMembers = this.members;

    if (name)

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
  }

  public isAdmin() {
    return isAdmin();
  }

  public getMember(element: Member): Member {
    return element;
  }

  public showEdit() {
    return isAdmin();
  }

  public showDelete(id: string) {
    return this.debatesParticipations[id] === 0 && isAdmin();
  }

  public showPrivateUrlCopy() {
    return isAdmin();
  }

  public goToMemberPage(id: string) {
    this.router.navigate([`/member/${id}`]);
  }
}
