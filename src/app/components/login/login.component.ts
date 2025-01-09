import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Token } from 'src/app/models/types/token';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { getToken, setToken } from 'src/app/utils/token';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  public form: FormGroup;

  public wrongLogin: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.checkLogin();
    this.initForm();
  }

  public initForm() {
    this.form = new FormGroup({
      login: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  public onSubmit() {
    if (!this.form.valid) return;

    const login = this.form.controls['login'].value;
    const password = this.form.controls['password'].value;

    this.login(login, password);
  }

  public login(login: string, password: string) {
    this.authService.login(login, password).subscribe({
      next: (token: Token) => {
        setToken(token);
        this.checkLogin();
      },
      error: (response: HttpErrorResponse) => {
        this.notificationService.createErrorNotification(response.error);
      }
    });
  }

  public checkLogin() {
    if (getToken()) this.router.navigate(["/dashboard"]);
  }
}
