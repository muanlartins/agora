import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormField } from 'src/app/models/form-field';
import { Token } from 'src/app/models/token';
import { User } from 'src/app/models/user';
import { TabdebService } from 'src/app/services/tabdeb.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public form: FormGroup;

  public fields: FormField[];

  public loading: boolean = true;

  public user: User;

  constructor(private router: Router, private tabdebService: TabdebService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.initForm();
    this.initFields();
    this.getUser();
    this.spinner.show();
  }

  public goToDashboard() {
    this.router.navigate(["/dashboard"]);
  }

  public initForm() {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required]),
      nickname: new FormControl('', [Validators.required]),
      fullName: new FormControl('', [Validators.required])
    });
  }

  public initFields() {
    this.fields = [
      {
        label: 'Login',
        placeholder: 'Login',
        disabled: true,
        formControlName: 'login',
        type: 'text',
      },
      {
        label: 'Apelido',
        placeholder: 'Apelido',
        disabled: true,
        formControlName: 'nickname',
        type: 'text'
      },
      {
        label: 'Nome completo',
        placeholder: 'Nome completo',
        disabled: true,
        formControlName: 'fullName',
        type: 'text'
      },
    ];
  }

  public getUser() {
    const token = localStorage.getItem('token')!;
    this.spinner.show();

    this.tabdebService.getUser(token).subscribe((user: User) => {
      this.form.controls['login'].patchValue(user.login);
      this.form.controls['nickname'].patchValue(user.nickname);
      this.form.controls['fullName'].patchValue(user.fullName);

      this.user = user;

      this.spinner.hide();
      this.loading = false;
    });
  }

  public edit(targetField: FormField) {
    const index = this.fields.findIndex((field) => field.formControlName === targetField.formControlName);
    this.fields[index].disabled = false;
  }

  public check(targetField: FormField) {
    const index = this.fields.findIndex((field) => field.formControlName === targetField.formControlName);
    this.fields[index].disabled = true;
  }

  public updateUser() {
    if (!this.form.controls['nickname'].value || !this.form.controls['fullName'].value) {
      window.alert('Você deve preencher o seu apelido e seu nome completo antes de atualizar');
      return;
    }

    const token = localStorage.getItem('token')!;
    this.spinner.show();

    const nickname = this.form.controls['nickname'].value;
    const fullName = this.form.controls['fullName'].value;

    this.tabdebService.updateUser(token, nickname, fullName).subscribe((updated: boolean) => {
      if (updated) this.tabdebService.refresh(token).subscribe((token: Token) => {
        localStorage.setItem('token', token);
      })
    });
  }

  public onSubmit() {}
}
