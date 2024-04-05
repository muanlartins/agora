import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, firstValueFrom } from "rxjs";
import { BASE_URL } from "../utils/constants";
import { getToken } from "../utils/token";
import { Member } from "../models/types/member";
import { Society } from "../models/enums/society";

const ENDPOINTS = {
  getAllMembers: '/members',
  createMember: '/member',
  editMember: '/member',
  deleteMember: (id: string) => `/member/${id}`,
  updatePfp: `/member/pfp`
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

  public async createMember(name: string, society: keyof typeof Society, isTrainee: boolean) {
    const token = getToken();

    const member = await firstValueFrom(this.httpClient.post<Member>(BASE_URL + ENDPOINTS.createMember, {
      name,
      society,
      isTrainee
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    this.members$.next([...this.members$.value, member]);

    return member;
  }

  public async updateMember(id: string, name: string, society: keyof typeof Society, isTrainee: boolean) {
    const token = getToken();

    await firstValueFrom(this.httpClient.put<boolean>(BASE_URL + ENDPOINTS.editMember, {
      id,
      name,
      society,
      isTrainee
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    const members = [...this.members$.value];
    members.splice(members.findIndex((member) => member.id === id), 1);
    members.push({id, name, society, isTrainee});

    this.members$.next(members);
  }

  public async uploadMemberPfp(formData: FormData) {
    const token = getToken();

    await firstValueFrom(this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.updatePfp, formData, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    }));
  }

  public getMemberPfpUrl(id: string) {
    return `/assets/pfps/${id}`;
  }

  public async memberHasPfp(id: string) {
    return await fetch(this.getMemberPfpUrl(id)).then((r) => r.ok);
  }

  public async deleteMember(id: string) {
    const token = getToken();

    await firstValueFrom(this.httpClient.delete<boolean>(BASE_URL + ENDPOINTS.deleteMember(id), {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    const members = [...this.members$.value];
    members.splice(members.findIndex((member) => member.id === id), 1);

    this.members$.next(members);
  }
}
