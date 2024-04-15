import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, combineLatest, firstValueFrom } from "rxjs";
import { BASE_URL } from "../utils/constants";
import { Debate } from "../models/types/debate";
import { getToken } from "../utils/token";
import { DebateStyle } from "../models/enums/debate-style";
import { DebateVenue } from "../models/enums/debate-venue";
import { MotionTheme } from "../models/enums/motion-theme";
import { Member } from "../models/types/member";
import { MemberService } from "./member.service";

const ENDPOINTS = {
  getAllDebates: '/debates',
  createDebate: '/debate',
  updateDebate: '/debate',
  deleteDebate: (id: string) => `/debate/${id}`,
}

@Injectable({
  providedIn: 'root'
})
export class DebateService {
  public debates$: BehaviorSubject<Debate[]> = new BehaviorSubject<Debate[]>([]);

  constructor(private httpClient: HttpClient, private memberService: MemberService) { }

  public getAllDebates(): Observable<Debate[]> {
    if (this.debates$.value && this.debates$.value.length)
      return this.debates$.asObservable();

    const token = getToken();

    combineLatest([this.httpClient.get<Debate[]>(BASE_URL + ENDPOINTS.getAllDebates, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }), this.memberService.getAllMembers()]).subscribe(([debates, members]) => this.debates$.next(debates
      .map((debate) => ({
        ...debate,
        debaters: debate.debaters.map((debater) => members.find((member) => member.id === debater.id)!),
        chair: members.find((member) => member.id === debate.chair.id)!,
        wings: debate.wings?.map((wing) => members.find((member) => member.id === wing.id)!),
      }))
    ));

    return this.debates$.asObservable();
  }

  public async createDebate(
    date: string,
    time: string,
    style: keyof typeof DebateStyle,
    venue: keyof typeof DebateVenue,
    motionType: string,
    motionTheme: keyof typeof MotionTheme,
    motion: string,
    infoSlides: string[],
    debaters: Member[],
    sps: number[],
    points: number[],
    chair: Member,
    wings: Member[],
    tournament?: string
  ) {
    const token = getToken();

    const debate = await firstValueFrom(this.httpClient.post<Debate>(BASE_URL + ENDPOINTS.createDebate, {
      date,
      time,
      style,
      venue,
      motionType,
      motionTheme,
      motion,
      infoSlides,
      debaters,
      sps,
      points,
      chair,
      wings,
      tournament
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    this.debates$.next([...this.debates$.value, debate]);
  }

  public async updateDebate(
    id: string,
    date: string,
    time: string,
    style: keyof typeof DebateStyle,
    venue: keyof typeof DebateVenue,
    motionType: string,
    motionTheme: keyof typeof MotionTheme,
    motion: string,
    infoSlides: string[],
    debaters: Member[],
    sps: number[],
    points: number[],
    chair: Member,
    wings: Member[],
    tournament?: string
  ) {
    const token = getToken();

    await firstValueFrom(this.httpClient.put<boolean>(BASE_URL + ENDPOINTS.updateDebate, {
      id,
      date,
      time,
      style,
      venue,
      motionType,
      motionTheme,
      motion,
      infoSlides,
      debaters,
      sps,
      points,
      chair,
      wings,
      tournament
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    const debates = [...this.debates$.value];
    debates.splice(debates.findIndex((debate) => debate.id === id), 1);
    debates.push({id, date, time, style, venue, motionType, motionTheme, motion, infoSlides, debaters, sps, points, chair, wings});

    this.debates$.next(debates);
  }

  public async deleteDebate(id: string) {
    const token = getToken();

    await firstValueFrom(this.httpClient.delete<boolean>(BASE_URL + ENDPOINTS.deleteDebate(id), {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    const debates = [...this.debates$.value];
    debates.splice(debates.findIndex((debate) => debate.id === id), 1);

    this.debates$.next(debates);
  }
}
