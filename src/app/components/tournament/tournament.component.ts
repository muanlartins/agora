import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as moment from 'moment';
import { Participant } from 'src/app/models/types/participant';
import { SelectOption } from 'src/app/models/types/select-option';
import { ParticipantService } from 'src/app/services/participant.service';
import { isAdmin } from 'src/app/utils/auth';
import { CreateParticipantModalComponent } from './components/create-participant-modal/create-participant-modal.component';
import { ConfirmModalComponent } from '../members/components/confirm-modal/confirm-modal.component';
import * as removeAccents from 'remove-accents';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.scss']
})
export class TournamentComponent implements OnInit {
  public participants: Participant[] = [];

  public filteredParticipants: Participant[] = [];

  public participantsFile: File;

  public imageSources: { [id: string]: string } = {};

  public files: { [id: string]: any } = {};

  public avatarIconUrl: string = '/assets/user.png';

  public form: FormGroup;

  public societyOptions: SelectOption[];

  @ViewChild('participantsUpload')
  public participantsUploadInputRef: ElementRef<HTMLInputElement>;

  constructor (
    private participantService: ParticipantService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {}

  public ngOnInit(): void {
    this.initForm();
    this.getAllParticipants();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: [''],
      society: ['']
    });

    this.subscribeToValueChanges();
  }

  public initOptions() {
    this.societyOptions = [... new Set(this.participants.map((participant) => participant.society))]
      .map((society) => ({
        value: society,
        viewValue: society
      }));
  }

  public subscribeToValueChanges() {
    this.form.valueChanges.subscribe(() => this.filterParticipants());
  }

  public filterParticipants() {
    this.filteredParticipants = [...this.participants];

    const name = this.form.controls['name'].value;
    const society = this.form.controls['society'].value;

    if (name)
      this.filteredParticipants = this.filteredParticipants.filter(
        (participant: Participant) => removeAccents(participant.name).toLowerCase().includes(removeAccents(name).toLowerCase())
      );
    if (society)
      this.filteredParticipants = this.filteredParticipants.filter(
        (participant: Participant) => participant.society === society
      );
  }

  public openCreateParticipantModal() {
    this.dialog.open(CreateParticipantModalComponent, {
      autoFocus: false,
      disableClose: true
    });
  }

  public editParticipant(id: string) {
    this.dialog.open(CreateParticipantModalComponent, { data: {
      isEditing: true,
      participant: this.participants.find((participant) => participant.id === id)
    }, disableClose: true });
  }

  public deleteParticipant(id: string) {
    const participant = this.participants.find((participant) => participant.id === id)!;

    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você tem certeza que quer deletar o membro <b>${participant.name} (${participant.society})</b>?`,
      positiveCallback: async () => {
        await this.participantService.deleteParticipant(id);
      },
      disableClose: true
    } })
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
      this.participants = participants.sort((a, b) =>
        moment(b.subscribedAt, "DD/MM/YYYY HH:mm").toDate().getTime() - moment(a.subscribedAt, "DD/MM/YYYY HH:mm").toDate().getTime()
      );

      this.filteredParticipants = [...this.participants];

      this.initOptions();
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
    if (!this.imageSources[participant.id] && participant.hasPfp)
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
