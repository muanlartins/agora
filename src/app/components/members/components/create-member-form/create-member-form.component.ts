import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectOption } from 'src/app/models/types/select-option';
import { Society } from 'src/app/models/enums/society';
import { MemberService } from 'src/app/services/member.service';
import { MatDialog } from '@angular/material/dialog';
import { Member } from 'src/app/models/types/member';

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

  public avatarIcon: string = 'user';

  public avatarIconUrl: string;

  public avatarFile: File;

  constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.initOptions();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      society: ['', Validators.required],
      isTrainee: [false]
    });

    if (this.isEditing) {
      this.form.controls['name'].patchValue(this.member.name);
      this.form.controls['society'].patchValue(this.member.society);
      this.form.controls['isTrainee'].patchValue(this.member.isTrainee);

      this.avatarIconUrl = this.memberService.getMemberPfpUrl(this.member.id);
    }
  }

  public initOptions() {
    const society = Object.entries(Society);

    this.societyOptions = society.map(([value, viewValue]) => ({ value, viewValue }))
      .sort((a, b) => a.viewValue.toLowerCase().localeCompare(b.viewValue.toLowerCase()));
  }

  public async onSubmit() {
    const name = this.form.controls['name'].value;
    const society = this.form.controls['society'].value;
    const isTrainee = this.form.controls['isTrainee'].value;

    this.loading = true;
    let id: string;
    if (this.isEditing) {
      id = this.member.id;
      await this.memberService.updateMember(id, name, society, isTrainee);
    } else {
      const member: Member = await this.memberService.createMember(name, society, isTrainee);
      id = member.id;
    }
    this.loading = false;

    if (this.avatarFile) {

      const formData: FormData = new FormData();
      formData.append('file', this.avatarFile, id);

      this.loading = true;
      await this.memberService.uploadMemberPfp(formData);
      this.loading = false;
    }

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

  onFileSelected(event: any) {
    if(event.target.files.length > 0) {
      this.avatarFile = event.target.files[0];

      this.avatarIconUrl = URL.createObjectURL(this.avatarFile);
    }
  }
}
