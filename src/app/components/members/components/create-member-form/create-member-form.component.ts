import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SelectOption } from 'src/app/models/types/select-option';
import { Society } from 'src/app/models/enums/society';
import { MemberService } from 'src/app/services/member.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-create-member-form',
  templateUrl: './create-member-form.component.html',
  styleUrls: ['./create-member-form.component.scss']
})
export class CreateMemberFormComponent implements OnInit {
  public form: FormGroup;

  public societyOptions: SelectOption[] = [];

  public loading: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private memberService: MemberService,
    private dialog: MatDialog
  ) {
    this.initForm();
    this.initOptions();
  }

  ngOnInit(): void {
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      society: ['', Validators.required]
    });
  }

  public initOptions() {
    const society = Object.entries(Society);

    this.societyOptions = society.map(([value, viewValue]) => ({ value, viewValue }))
      .sort((a, b) => a.viewValue.toLowerCase().localeCompare(b.viewValue.toLowerCase()));
  }

  public async onSubmit() {
    const name = this.form.controls['name'].value;
    const society = this.form.controls['society'].value;
    this.loading = true;

    await this.memberService.createMember(name, society);

    this.loading = false;
    this.dialog.closeAll();

    this.form.controls['name'].patchValue('');
    this.form.controls['society'].patchValue('');
  }

  public clearControlValue(control: string, event?: Event) {
    if (event) event.stopPropagation();
    this.form.controls[control].patchValue('');
  }

  public showClearControlValueIcon(control: string) {
    return this.form.controls[control].value;
  }
}
;
