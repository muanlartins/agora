import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';
import { HasUnsavedChanges } from 'src/app/guards/unsaved-changes.guard';

@Component({
  selector: 'app-debate-editor',
  templateUrl: './debate-editor.component.html',
  styleUrls: ['./debate-editor.component.scss']
})
export class DebateEditorComponent implements OnInit, HasUnsavedChanges {
  isEditing = false;
  debate: Debate | null = null;
  loading = true;
  private formDirty = false;
  private saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private debateService: DebateService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  hasUnsavedChanges(): boolean {
    return this.formDirty && !this.saving;
  }

  private async loadData(): Promise<void> {
    this.loading = true;

    const debateId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!debateId;

    if (this.isEditing && debateId) {
      try {
        const debate = await this.debateService.getDebate(debateId);
        if (!debate) {
          this.router.navigate(['/debates']);
          return;
        }
        this.debate = debate;
      } catch (error) {
        console.error('Error loading debate:', error);
        this.router.navigate(['/debates']);
        return;
      }
    }

    this.loading = false;
  }

  onFormDirtyChange(dirty: boolean): void {
    this.formDirty = dirty;
  }

  onSaveStart(): void {
    this.saving = true;
  }

  onSaveComplete(): void {
    this.saving = false;
    this.formDirty = false;
    this.router.navigate(['/debates']);
  }

  onCancel(): void {
    this.router.navigate(['/debates']);
  }

  goBack(): void {
    this.router.navigate(['/debates']);
  }

  get pageTitle(): string {
    return this.isEditing ? 'Editar Debate' : 'Novo Debate';
  }
}
