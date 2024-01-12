import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from 'src/app/models/select-option';
import { Society } from 'src/app/models/society';

@Component({
  selector: 'app-create-member-form',
  templateUrl: './create-member-form.component.html',
  styleUrls: ['./create-member-form.component.scss']
})
export class CreateMemberFormComponent implements OnInit {
  public form: FormGroup;

  public societyOptions: SelectOption[] = [];

  constructor(private formBuilder: FormBuilder) {
    this.initForm();
    this.initOptions();
  }

  ngOnInit(): void {
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: [''],
      society: ['']
    });
  }

  public initOptions() {
    const society = Object.entries(Society);

    this.societyOptions = society.map(([value, viewValue]) => ({ value, viewValue }))
      .sort((a, b) => a.viewValue.toLowerCase().localeCompare(b.viewValue.toLowerCase()));
  }

  public onSubmit() {
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
