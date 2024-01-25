import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from 'src/app/models/types/token';
import { Observable } from 'rxjs';
import { BASE_URL } from '../utils/constants';

const ENDPOINTS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) { }

  public login(login: string, password: string): Observable<Token> {
    return this.httpClient.post<string>(BASE_URL + ENDPOINTS.login, {
      login,
      password
    });
  }

  public refresh(token: string) {
    return this.httpClient.get<Token>(BASE_URL + ENDPOINTS.refresh, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }
}
