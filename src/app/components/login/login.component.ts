import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { sha256 } from 'js-sha256';
import { FormMode } from 'src/app/models/form-mode';
import { FormModeText } from 'src/app/models/form-mode-text';
import { Token } from 'src/app/models/token';
import { TabdebService } from 'src/app/services/tabdeb/tabdeb.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;

  public showWarnings = {
    login: false,
    password: false
  };

  public formMode: FormMode = FormMode.signin;

  public formModeText: FormModeText = FormModeText.signin;

  public changeFormModeText: FormModeText = FormModeText.signup;

  constructor(private tabdebService: TabdebService, private router: Router) {}

  ngOnInit(): void {
    this.checkLogin();
    this.initForm();
    this.subscribeToValueChanges();
  }

  public initForm() {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  public subscribeToValueChanges() {
    this.form.controls['login'].valueChanges.subscribe((login: string) => {
      this.showWarnings.login = !this.form.controls['login'].valid;
    });

    this.form.controls['password'].valueChanges.subscribe((password: string) => {
      this.showWarnings.password = !this.form.controls['password'].valid;
    });
  }

  public onSubmit() {
    if (!this.form.valid) {
      this.showWarnings.login = !this.form.controls['login'].valid;
      this.showWarnings.password = !this.form.controls['password'].valid;

      return;
    }

    const login = this.form.controls['login'].value;
    const encryptedPassword = sha256(this.form.controls['password'].value);

    if (this.formMode === FormMode.signup) {
      this.tabdebService.signup(login, encryptedPassword).subscribe((success: boolean) => {
        if (success) this.login(login, encryptedPassword);
      });
    } else {
      this.login(login, encryptedPassword);
    }
  }

  public login(login: string, password: string) {
    this.tabdebService.login(login, password).subscribe((token: Token) => {
      localStorage.setItem("token", token);
      this.checkLogin();
    });
  }

  public checkLogin() {
    if (localStorage.getItem("token")) this.router.navigate(["/dashboard"]);
  }

  public changeFormMode() {
    if (this.formMode === FormMode.signin) this.formMode = FormMode.signup;
    else this.formMode = FormMode.signin;

    this.getChangeFormModeText();
    this.getFormModeText();
  }

  public getChangeFormModeText() {
    if (this.formMode === FormMode.signin) this.changeFormModeText = FormModeText.signup;
    else this.changeFormModeText = FormModeText.signin;
  }

  public getFormModeText() {
    if (this.formMode === FormMode.signin) this.formModeText = FormModeText.signin;
    else this.formModeText = FormModeText.signup;
  }
}
