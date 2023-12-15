import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Token } from 'src/app/models/token';
import { Observable } from 'rxjs';
import { User } from 'src/app/models/user';

const BASE_URL = "https://bvgmvdgrcvnpvu5ho3y2ttxbpe0txcfp.lambda-url.sa-east-1.on.aws";

const ENDPOINTS = {
  login: '/auth/login',
  signup: '/user',
  getUser: '/user',
  updateUser: '/user/update',
  refresh: '/auth/refresh'
}

@Injectable({
  providedIn: 'root'
})
export class TabdebService {

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

  public signup(login: string, password: string): Observable<boolean> {
    return this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.signup, {
      login,
      password
    });
  }

  public getUser(token: string): Observable<User> {
    return this.httpClient.get<User>(BASE_URL + ENDPOINTS.getUser, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }

  public updateUser(token: string, nickname: string, fullName: string): Observable<boolean> {
    return this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.updateUser, {
      nickname,
      fullName
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    });
  }
}
