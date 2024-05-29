import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../utils/constants';

const ENDPOINTS = {
  getTournametTabbyData: (tournament: string) => `/tournament/${tournament}`,
}

@Injectable({
  providedIn: 'root'
})
export class TournamentService {

  constructor(private httpClient: HttpClient) { }

  public getTournamentTabbyData(tournament: string) {
    return this.httpClient.get<any>(BASE_URL + ENDPOINTS.getTournametTabbyData(tournament));
  }
}
