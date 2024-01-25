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
    style: DebateStyle,
    venue: DebateVenue,
    motionType: MotionType,
    motionTheme: MotionTheme,
    motion: string,
    infoSlides: string[],
    debaters: Member[],
    sps: number[],
    points: number[],
    chair: Member,
    wings: Member[]
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
      wings
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    this.debates$.next([...this.debates$.value, debate]);
  }
}
