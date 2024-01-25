import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, firstValueFrom } from "rxjs";
import { BASE_URL } from "../utils/constants";
import { getToken } from "../utils/token";
import { Member } from "../models/types/member";
import { Society } from "../models/enums/society";

const ENDPOINTS = {
  getAllMembers: '/members',
  createMember: '/member'
}

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  public members$: BehaviorSubject<Member[]> = new BehaviorSubject<Member[]>([]);

  constructor(private httpClient: HttpClient) { }

  public getAllMembers(): Observable<Member[]> {
    if (this.members$.value && this.members$.value.length)
      return this.members$.asObservable();

    const token = getToken();

    this.httpClient.get<Member[]>(BASE_URL + ENDPOINTS.getAllMembers, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }).subscribe((members) => this.members$.next(members));

    return this.members$.asObservable();
  }

  public async createMember(name: string, society: keyof typeof Society) {
    const token = getToken();

    const member = await firstValueFrom(this.httpClient.post<Member>(BASE_URL + ENDPOINTS.createMember, {
      name,
      society
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    this.members$.next([...this.members$.value, member]);
  }
}
