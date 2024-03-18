import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, firstValueFrom } from "rxjs";
import { BASE_URL } from "../utils/constants";
import { Debate } from "../models/types/debate";
import { getToken } from "../utils/token";
import { DebateStyle } from "../models/enums/debate-style";
import { DebateVenue } from "../models/enums/debate-venue";
import { MotionType } from "../models/enums/motion-type";
import { MotionTheme } from "../models/enums/motion-theme";
import { Member } from "../models/types/member";

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

  constructor(private httpClient: HttpClient) { }

  public getAllDebates(): Observable<Debate[]> {
    if (this.debates$.value && this.debates$.value.length)
      return this.debates$.asObservable();

    const token = getToken();

    this.httpClient.get<Debate[]>(BASE_URL + ENDPOINTS.getAllDebates, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }).subscribe((debates) => this.debates$.next(debates));

    return this.debates$.asObservable();
  }

  public async createDebate(
    date: string,
    time: string,
    style: keyof typeof DebateStyle,
    venue: keyof typeof DebateVenue,
    motionType: keyof typeof MotionType,
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
    motionType: keyof typeof MotionType,
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
