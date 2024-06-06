import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectOption } from 'src/app/models/types/select-option';
import { MemberService } from 'src/app/services/member.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Member } from 'src/app/models/types/member';
import { getState, setState } from 'src/app/utils/state';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal.component';
import { CreateMemberModalComponent } from '../create-member-modal/create-member-modal.component';

@Component({
  selector: 'app-create-member-form',
  templateUrl: './create-member-form.component.html',
  styleUrls: ['./create-member-form.component.scss']
})
export class CreateMemberFormComponent implements OnInit {
  @Input()
  public isEditing: boolean;

  @Input()
  public member: Member;

  public form: FormGroup;

  public societyOptions: SelectOption[] = [];

  public loading: boolean = false;

  public avatarIconUrl: string = '/assets/user.png';

  public avatarFile: File;

  public pfpUrl?: string;

  public get description() {
    if (this.form.controls['description']) return this.form.controls['description'].value;

    return '';
  }

  constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateMemberModalComponent>
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initOptions();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      society: ['', Validators.required],
      newSociety: [''],
      isTrainee: [false],
      blocked: [false],
      description: ['']
    });

    const state = getState();

    if (this.isEditing) {
      this.form.controls['name'].patchValue(this.member.name);
      this.form.controls['society'].patchValue(this.member.society);
      this.form.controls['isTrainee'].patchValue(this.member.isTrainee);
      this.form.controls['blocked'].patchValue(this.member.blocked);
      this.form.controls['description'].patchValue(this.member.description);

      this.pfpUrl = this.member.hasPfp ? `/assets/pfps/${this.member.id}` : this.avatarIconUrl;

      if (state[this.member.id] && state[this.member.id].name)
        this.form.controls['name'].patchValue(state[this.member.id].name);
      if (state[this.member.id] && state[this.member.id].society)
        this.form.controls['society'].patchValue(state[this.member.id].society);
      if (state[this.member.id] && state[this.member.id].isTrainee)
        this.form.controls['isTrainee'].patchValue(state[this.member.id].isTrainee);
      if (state[this.member.id] && state[this.member.id].blocked)
        this.form.controls['blocked'].patchValue(state[this.member.id].blocked);
      if (state[this.member.id] && state[this.member.id].description)
        this.form.controls['description'].patchValue(state[this.member.id].description);
    } else if (state['member']) {
      const member = state['member'];

      this.form.controls['name'].patchValue(member.name);
      this.form.controls['society'].patchValue(member.society);
      this.form.controls['isTrainee'].patchValue(member.isTrainee);
      this.form.controls['blocked'].patchValue(member.blocked);
      this.form.controls['description'].patchValue(member.description);
    }
  }

  public initOptions() {
    this.loading = true;

    this.memberService.getAllMembers().subscribe((members: Member[]) => {
      this.loading = false;

      this.societyOptions = [...new Set(members.map((member) => member.society))].map((society: string) => ({
        value: society,
        viewValue: society
      })).sort((a, b) => a.viewValue.toLowerCase().localeCompare(b.viewValue.toLowerCase()));
    });
  }

  public async onSubmit() {
    const name = this.form.controls['name'].value;
    const society =
      this.showNewSocietyFormField() ?
      this.form.controls['newSociety'].value :
      this.form.controls['society'].value;
    const isTrainee = this.form.controls['isTrainee'].value;
    const blocked = this.form.controls['blocked'].value;
    const description = this.form.controls['description'].value;

    let id: string;
    if (this.isEditing) {
      const hasPfp = this.member.hasPfp;
      id = this.member.id;
      await this.memberService.updateMember(id, name, society, isTrainee, hasPfp, blocked, description);
    } else {
      const hasPfp: boolean = !!this.avatarFile;
      const member: Member = await this.memberService.createMember(name, society, isTrainee, hasPfp, blocked, description);
      id = member.id;
    }

    if (this.avatarFile) {
      const formData: FormData = new FormData();
      formData.append('file', this.avatarFile, id);

      await this.memberService.uploadMemberPfp(formData);
    }

    const state = getState();

    if (this.isEditing)
      delete state[this.member.id];
    else
      delete state['member'];

    setState(state);

    this.dialog.closeAll();
  }

  public clearControlValue(control: string, event?: Event) {
    if (event) event.stopPropagation();
    this.form.controls[control].patchValue('');
  }

  public showClearControlValueIcon(control: string) {
    return this.form.controls[control].value;
  }

  public getButtonText(): string {
    if (this.isEditing) return 'Atualizar';

    return 'Adicionar';
  }

  public onFileSelected(event: any) {
    if(event.target.files.length > 0) {
      this.avatarFile = event.target.files[0];

      this.pfpUrl = URL.createObjectURL(this.avatarFile);
    }
  }

  public getSrc() {
    return this.pfpUrl ?? this.avatarIconUrl;
  }

  public showNewSocietyFormField() {
    return this.form.controls['society'].value === 'Nova Sociedade';
  }

  public close() {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        text: `Você <b>poderá perder</b> qualquer mudança <b>não salva</b>! Tem certeza que quer continuar?`,
        positiveCallback: () => {
          const state = getState();

          const hasChanged = (property: keyof Member) =>
            this.form.controls[property].value !== this.member[property];
          const change = (property: keyof Member) =>
            hasChanged(property) ?
            this.form.controls[property].value :
            '';

          if (this.isEditing) {
            state[this.member.id] = {
              name: change('name'),
              society: hasChanged('society') ?
                this.showNewSocietyFormField() ?
                this.form.controls['newSociety'].value :
                this.form.controls['society'].value :
                '',
              isTrainee: change('isTrainee'),
              blocked: change('blocked')
            }
          } else {
            state['member'] = {
              name: this.form.controls['name'].value,
              society:
                this.showNewSocietyFormField() ?
                this.form.controls['newSociety'].value :
                this.form.controls['society'].value,
              isTrainee: this.form.controls['isTrainee'].value,
              blocked: this.form.controls['blocked'].value
            }
          }

          setState(state);

          this.dialogRef.close();
        }
      },
    });
  }
}
