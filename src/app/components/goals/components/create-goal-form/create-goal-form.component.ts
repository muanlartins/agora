import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Goal } from 'src/app/models/types/goal';
import { getState, setState } from 'src/app/utils/state';
import { CreateGoalModalComponent } from '../create-goal-modal/create-goal-modal.component';
import { GoalService } from 'src/app/services/goal.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-create-goal-form',
  templateUrl: './create-goal-form.component.html',
  styleUrls: ['./create-goal-form.component.scss']
})
export class CreateGoalFormComponent implements OnInit {
  @Input()
  public isEditing: boolean;

  @Input()
  public goal: Goal;

  public form: FormGroup;
  public showPreview: boolean = false;

  public get description() {
    if (this.form.controls['description']) return this.form.controls['description'].value;
    return '';
  }

  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<CreateGoalModalComponent>,
    private goalService: GoalService
  ) {}

  public ngOnInit(): void {
    this.initForm();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      currentCount: [0, [Validators.required, Validators.min(0)]],
      totalCount: [1, [Validators.required, Validators.min(1)]],
      type: ['', Validators.required],
      description: ['']
    });

    const state = getState();

    if (this.isEditing) {
      this.form.controls['title'].patchValue(this.goal.title);
      this.form.controls['currentCount'].patchValue(this.goal.currentCount);
      this.form.controls['totalCount'].patchValue(this.goal.totalCount);
      this.form.controls['type'].patchValue(this.goal.type);
      this.form.controls['description'].patchValue(this.goal.description);

      if (state[this.goal.id] && state[this.goal.id].title)
        this.form.controls['title'].patchValue(state[this.goal.id].title);
      if (state[this.goal.id] && state[this.goal.id].currentCount)
        this.form.controls['currentCount'].patchValue(state[this.goal.id].currentCount);
      if (state[this.goal.id] && state[this.goal.id].totalCount)
        this.form.controls['totalCount'].patchValue(state[this.goal.id].totalCount);
      if (state[this.goal.id] && state[this.goal.id].type)
        this.form.controls['type'].patchValue(state[this.goal.id].type);
      if (state[this.goal.id] && state[this.goal.id].description)
        this.form.controls['description'].patchValue(state[this.goal.id].description);
    } else if (state['goal']) {
      const goal = state['goal'];

      this.form.controls['title'].patchValue(goal.title);
      this.form.controls['currentCount'].patchValue(goal.currentCount);
      this.form.controls['totalCount'].patchValue(goal.totalCount);
      this.form.controls['type'].patchValue(goal.type);
      this.form.controls['description'].patchValue(goal.description);
    }
  }

  public async submit() {
    if (!this.form.valid) return;

    const title = this.form.controls['title'].value;
    const currentCount = this.form.controls['currentCount'].value;
    const totalCount = this.form.controls['totalCount'].value;
    const type = this.form.controls['type'].value;
    const description = this.form.controls['description'].value;

    if (this.isEditing)
      await this.goalService.updateGoal(this.goal.id, title, currentCount, totalCount, type, description);
    else
      await this.goalService.createGoal(title, currentCount, totalCount, type, description);

    const state = getState();

    if (this.isEditing)
      delete state[this.goal.id];
    else
      delete state['goal'];

    setState(state);

    this.dialogRef.close();
  }

  public close() {
    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você <b>poderá perder</b> qualquer mudança <b>não salva</b>! Tem certeza que quer continuar?`,
      positiveCallback: () => {
        const state = getState();

        if (this.isEditing) {
          state[this.goal.id] = {
            title: this.form.controls['title'].value !== this.goal.title ? this.form.controls['title'].value : '',
            currentCount: this.form.controls['currentCount'].value !== this.goal.currentCount ? this.form.controls['currentCount'].value : '',
            totalCount: this.form.controls['totalCount'].value !== this.goal.totalCount ? this.form.controls['totalCount'].value : '',
            type: this.form.controls['type'].value !== this.goal.type ? this.form.controls['type'].value : '',
            description: this.form.controls['description'].value !== this.goal.description ? this.form.controls['description'].value : '',
          }
        } else {
          state['goal'] = {
            title: this.form.controls['title'].value,
            currentCount: this.form.controls['currentCount'].value,
            totalCount: this.form.controls['totalCount'].value,
            type: this.form.controls['type'].value,
            description: this.form.controls['description'].value,
          }
        }

        setState(state);
        this.dialog.closeAll();
      },
    }});
  }

  public getButtonText(): string {
    if (this.isEditing) return 'Atualizar';
    return 'Criar';
  }
}
