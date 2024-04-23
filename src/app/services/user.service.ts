import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../models/types/user";
import { BASE_URL } from "../utils/constants";

const ENDPOINTS = {
  signup: '/user',
  getUser: '/user',
  updateUser: '/user/update',
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpClient: HttpClient) { }

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
