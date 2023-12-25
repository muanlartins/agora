import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { sha256 } from 'js-sha256';
import { NgxSpinnerService } from 'ngx-spinner';
import { Token } from 'src/app/models/token';
import { TabdebService } from 'src/app/services/tabdeb.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;

  public loading: boolean;

  constructor(
    private tabdebService: TabdebService,
    private router: Router,
    private spinner: NgxSpinnerService,
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.initForm();
    this.spinner.show();
  }

  public initForm() {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  public onSubmit() {
    if (!this.form.valid) {

      return;
    }

    const login = this.form.controls['login'].value;
    const encryptedPassword = sha256(this.form.controls['password'].value);

    this.login(login, encryptedPassword);
  }

  public login(login: string, password: string) {
    this.loading = true;
    this.tabdebService.login(login, password).subscribe({
      next: (token: Token) => {
        localStorage.setItem("token", token);
        this.checkLogin();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
      }
    });
  }

  public checkLogin() {
    if (localStorage.getItem("token")) this.router.navigate(["/dashboard"]);
  }
}
