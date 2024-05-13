import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Participant } from '../models/types/participant';
import { BASE_URL } from '../utils/constants';
import { firstValueFrom } from 'rxjs';

const ENDPOINTS = {
  getAllParticipants: '/participants',
  uploadParticipants: (tournament: string) => `/participants/${tournament}`,
  uploadParticipantPfp: (tournament: string) => `/participant/${tournament}/pfp`,
}

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {


  constructor(private httpClient: HttpClient) { }

  public getAllParticipants() {
    return this.httpClient.get<Participant[]>(BASE_URL + ENDPOINTS.getAllParticipants);
  }

  public uploadParticipants(formData: FormData, tournament: string) {
    return this.httpClient.post<Participant[]>(BASE_URL + ENDPOINTS.uploadParticipants(tournament), formData);
  }

  public async uploadParticipantPfp(formData: FormData, tournament: string) {
    await firstValueFrom(this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.uploadParticipantPfp(tournament), formData));
  }

  public getParticipantPfpUrl(tournament: string, id: string) {
    return `https://www.agoradebates.com/assets/participants/${tournament}/${id}`;
  }
}
