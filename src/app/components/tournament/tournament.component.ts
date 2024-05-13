import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { Participant } from 'src/app/models/types/participant';
import { ParticipantService } from 'src/app/services/participant.service';
import { isAdmin } from 'src/app/utils/auth';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {
  public participants: Participant[] = [];

  public participantsFile: File;

  public imageSources: { [id: string]: string } = {};

  public files: { [id: string]: any } = {};

  public avatarIconUrl: string = '/assets/user.png';

  @ViewChild('participantsUpload')
  public participantsUploadInputRef: ElementRef<HTMLInputElement>;

  constructor (private participantService: ParticipantService) {}

  public ngOnInit(): void {
    this.getAllParticipants();
  }

  public uploadParticipants() {
    const formData: FormData = new FormData();
    formData.append('file', this.participantsFile, 'tournament.csv');

    this.participantService.uploadParticipants(formData, 'metadebate').subscribe((participants) => {
      this.participants = participants;
    });
  }

  public getAllParticipants() {
    this.participantService.getAllParticipants().subscribe((participants) => {
      this.participants = participants;
    });
  }

  public onFileSelected(event: any) {
    if(event.target.files.length > 0) {
      this.participantsFile = event.target.files[0];

      this.uploadParticipants();
    }
  }

  public onPfpFileSelected(event: any, participant: Participant) {
    if(event.target.files.length > 0) {
      this.files[participant.id] = event.target.files[0];

      this.imageSources[participant.id] = URL.createObjectURL(event.target.files[0]);

      const formData: FormData = new FormData();
      formData.append('file', event.target.files[0], participant.id);

      this.participantService.uploadParticipantPfp(formData, 'metadebate');
    }
  }

  public getDate(date: string) {
    return moment(date, "DD/MM/YYYY HH:mm").locale('pt-br').format('LLL');
  }

  public getSrc(participant: Participant) {
    if (participant.hasPfp)
      return this.participantService.getParticipantPfpUrl(participant.tournament, participant.id);

    return this.imageSources[participant.id] ?? this.avatarIconUrl;
  }

  public isAdmin() {
    return isAdmin();
  }

  public participantsFileUpload() {
    this.participantsUploadInputRef.nativeElement.click();
  }
}
