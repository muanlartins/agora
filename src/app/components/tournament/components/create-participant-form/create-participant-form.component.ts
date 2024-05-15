import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { Participant } from 'src/app/models/types/participant';
import { SelectOption } from 'src/app/models/types/select-option';
import { ParticipantService } from 'src/app/services/participant.service';
import { getState, setState } from 'src/app/utils/state';
import { CreateParticipantModalComponent } from '../create-participant-modal/create-participant-modal.component';
import * as moment from 'moment';

@Component({
  selector: 'app-create-participant-form',
  templateUrl: './create-participant-form.component.html',
  styleUrls: ['./create-participant-form.component.scss']
})
export class CreateParticipantFormComponent implements OnInit {
  @Input()
  public participant: Participant;

  @Input()
  public isEditing: boolean = false;

  public societyOptions: SelectOption[] = [];

  public form: FormGroup;

  public constructor(
    private formBuilder: FormBuilder,
    private participantService: ParticipantService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateParticipantModalComponent>
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: [''],
      society: [''],
      newSociety: ['']
    });

    this.initOptions();

    const state = getState();

    if (this.isEditing) {
      this.form.controls['name'].patchValue(this.participant.name);
      this.form.controls['society'].patchValue(this.participant.society);

      if (state[this.participant.id] && state[this.participant.id].name)
        this.form.controls['name'].patchValue(state[this.participant.id].name);
      if (state[this.participant.id] && state[this.participant.id].society)
        this.form.controls['society'].patchValue(state[this.participant.id].society);
    } else if (state['participant']) {
      const participant = state['participant'];

      this.form.controls['name'].patchValue(participant.name);
      this.form.controls['society'].patchValue(participant.society);
    }
  }

  public initOptions() {
    this.participantService.getAllParticipants().subscribe((participants: Participant[]) => {
      this.societyOptions = [...new Set(participants.map((participant) => participant.society))].map((society: string) => ({
        value: society,
        viewValue: society
      })).sort((a, b) => a.viewValue.toLowerCase().localeCompare(b.viewValue.toLowerCase()));
    });
  }

  public async onSubmit() {
    const name = this.form.controls['name'].value;
    const society =
      this.showNewSocietyFormField() ?
      this.form.controls['newSociety'].value :
      this.form.controls['society'].value;

    let id: string;
    if (this.isEditing) {
      const hasPfp = this.participant.hasPfp;
      id = this.participant.id;

      const participant: Participant = {
        id: id,
        tournament: 'metadebate',
        name: name,
        society: society,
        subscribedAt: this.participant.subscribedAt,
        hasPfp: hasPfp,
      };

      await this.participantService.updateParticipant(participant);
    } else {

      const participant: Participant = {
        id: '',
        tournament: 'metadebate',
        name: name,
        society: society,
        subscribedAt: moment().locale('pt-br').format("DD/MM/YYYY HH:mm"),
        hasPfp: false,
      };

      const createdParticipant: Participant = await this.participantService.createParticipant(participant);

      id = createdParticipant.id;
    }

    const state = getState();

    if (this.isEditing)
      delete state[this.participant.id];
    else
      delete state['participant'];

    setState(state);

    this.dialog.closeAll();
  }

  public getButtonText(): string {
    if (this.isEditing) return 'Atualizar';

    return 'Adicionar';
  }

  public showNewSocietyFormField() {
    return this.form.controls['society'].value === 'Nova Sociedade';
  }

  public close() {
    this.dialog.open(ConfirmModalComponent, {
      data: {
        text: `Você <b>poderá perder</b> qualquer mudança <b>não salva</b>! Tem certeza que quer continuar?`,
        positiveCallback: () => {
          const state = getState();

          const hasChanged = (property: keyof Participant) =>
            this.form.controls[property].value !== this.participant[property];
          const change = (property: keyof Participant) =>
            hasChanged(property) ?
            this.form.controls[property].value :
            '';

          if (this.isEditing) {
            state[this.participant.id] = {
              name: change('name'),
              society: hasChanged('society') ?
                this.showNewSocietyFormField() ?
                this.form.controls['newSociety'].value :
                this.form.controls['society'].value :
                '',
            }
          } else {
            state['participant'] = {
              name: this.form.controls['name'].value,
              society:
                this.showNewSocietyFormField() ?
                this.form.controls['newSociety'].value :
                this.form.controls['society'].value,
            }
          }

          setState(state);

          this.dialogRef.close();
        }
      },
    });
  }
}
