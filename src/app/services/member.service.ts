import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, firstValueFrom } from "rxjs";
import { BASE_URL } from "../utils/constants";
import { Member } from "../models/types/member";

const ENDPOINTS = {
  getAllMembers: '/members',
  getMember: (id: string) => `/member/${id}`,
  checkHashedId: (id: string, hashedId: string) => `/member/${id}/private/${hashedId}`,
  getHashedId: (id: string) => `/member/private/${id}`,
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

    this.httpClient.get<Member[]>(BASE_URL + ENDPOINTS.getAllMembers)
      .subscribe((members) => {
        this.members$.next(members);
      }
    );

    return this.members$.asObservable();
  }

  public async createMember(
    name: string,
    society: string,
    isTrainee: boolean,
    hasPfp: boolean,
    blocked: boolean,
    description: string
  ) {

    const member = await firstValueFrom(this.httpClient.post<Member>(BASE_URL + ENDPOINTS.createMember, {
      name,
      society,
      isTrainee,
      hasPfp,
      blocked,
      description
    }));

    this.members$.next([...this.members$.value, member]);

    return member;
  }

  public async updateMember(
    id: string,
    name: string,
    society: string,
    isTrainee: boolean,
    hasPfp: boolean,
    blocked: boolean,
    description: string
  ) {

    await firstValueFrom(this.httpClient.put<boolean>(BASE_URL + ENDPOINTS.editMember, {
      id,
      name,
      society,
      isTrainee,
      hasPfp,
      blocked,
      description
    }));

    const members = [...this.members$.value];
    members.splice(members.findIndex((member) => member.id === id), 1);
    members.push({id, name, society, isTrainee, hasPfp, blocked, description});

    this.members$.next(members);
  }

  public async uploadMemberPfp(formData: FormData) {
    await firstValueFrom(this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.updatePfp, formData));
  }

  public async deleteMember(id: string) {
    await firstValueFrom(this.httpClient.delete<boolean>(BASE_URL + ENDPOINTS.deleteMember(id)));

    const members = [...this.members$.value];
    members.splice(members.findIndex((member) => member.id === id), 1);

    this.members$.next(members);
  }

  public async getMember(id: string) {
    return await firstValueFrom(this.httpClient.get<Member>(BASE_URL + ENDPOINTS.getMember(id)));
  }

  public async checkHashedId(id: string, hashedId: string) {
    return await firstValueFrom(this.httpClient.get<boolean>(BASE_URL + ENDPOINTS.checkHashedId(id, hashedId)));
  }

  public async getHashedId(id: string) {
    return await firstValueFrom(this.httpClient.post<string>(BASE_URL + ENDPOINTS.getHashedId(id), {}));
  }
}
