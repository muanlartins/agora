import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Token } from 'src/app/models/types/token';
import { Observable, tap } from 'rxjs';
import { BASE_URL } from '../utils/constants';
import { Router } from '@angular/router';

const ENDPOINTS = {
  login: '/public/auth/login',
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private httpClient: HttpClient,
    private router: Router
  ) { }

  public login(login: string, password: string): Observable<Token> {
    return this.httpClient.post<string>(BASE_URL + ENDPOINTS.login, {
      login,
      password
    });
  }
}
