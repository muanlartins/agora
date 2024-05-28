import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Participant } from '../models/types/participant';
import { BASE_URL } from '../utils/constants';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

const ENDPOINTS = {
  getAllParticipants: '/participants',
  uploadParticipants: (tournament: string) => `/participants/${tournament}`,
  uploadParticipantPfp: (tournament: string) => `/participant/${tournament}/pfp`,
  createParticipant: '/participant',
  updateParticipant: '/participant',
  deleteParticipant: (id: string) => `/participant/${id}`,
  registerDuos: '/participants/duos'
}

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  public participants$: BehaviorSubject<Participant[]> = new BehaviorSubject<Participant[]>([]);

  constructor(private httpClient: HttpClient) { }

  public getAllParticipants() {
    if (this.participants$.value && this.participants$.value.length)
      return this.participants$.asObservable();

    this.httpClient.get<Participant[]>(BASE_URL + ENDPOINTS.getAllParticipants)
      .subscribe((participants) => {
        this.participants$.next(participants);
      }
    );

    return this.participants$.asObservable();
  }

  public refreshAllParticipants() {
    this.httpClient.get<Participant[]>(BASE_URL + ENDPOINTS.getAllParticipants)
      .subscribe((participants) => {
        this.participants$.next(participants);
      }
    );

    return this.participants$.asObservable();
  }


  public uploadParticipants(formData: FormData, tournament: string) {
    this.httpClient.post<Participant[]>(BASE_URL + ENDPOINTS.uploadParticipants(tournament), formData)
      .subscribe((participants: Participant[]) => {
        this.participants$.next(participants)
      });

    return this.participants$.asObservable();
  }

  public async createParticipant(participant: Participant) {
    const createdParticipant =
      await firstValueFrom(this.httpClient.post<Participant>(BASE_URL + ENDPOINTS.createParticipant, participant));

    const participants = [...this.participants$.value];

    participants.push(createdParticipant);

    this.participants$.next(participants);

    return createdParticipant;
  }

  public async updateParticipant(updatedParticipant: Participant) {
    await firstValueFrom(this.httpClient.put(BASE_URL + ENDPOINTS.updateParticipant, updatedParticipant));

    this.refreshAllParticipants();
  }

  public async registerDuos(participantsOne: Participant[], participantsTwo: Participant[]) {
    const duos = [];

    for (let i=0;i<participantsOne.length;i++) {
      duos.push([participantsOne[i].id, participantsTwo[i].id]);
    }

    await firstValueFrom(this.httpClient.post(BASE_URL + ENDPOINTS.registerDuos, duos));

    this.refreshAllParticipants();
  }

  public async deleteParticipant(id: string) {
    await firstValueFrom(this.httpClient.delete<Participant[]>(BASE_URL + ENDPOINTS.deleteParticipant(id)));

    const participants = [...this.participants$.value];
    participants.splice(participants.findIndex((participant) => participant.id === id), 1);

    this.participants$.next(participants);
  }

  public async uploadParticipantPfp(formData: FormData, tournament: string) {
    await firstValueFrom(this.httpClient.post<boolean>(BASE_URL + ENDPOINTS.uploadParticipantPfp(tournament), formData));
  }

  public getParticipantPfpUrl(tournament: string, id: string) {
    return `https://www.agoradebates.com/assets/participants/${tournament}/${id}`;
  }
}
