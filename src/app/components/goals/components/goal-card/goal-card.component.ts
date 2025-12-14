import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Goal } from 'src/app/models/types/goal';

@Component({
  selector: 'app-goal-card',
  templateUrl: './goal-card.component.html',
  styleUrls: ['./goal-card.component.scss']
})
export class GoalCardComponent {
  @Input() goal!: Goal;
  @Input() showActions = false;

  @Output() cardClick = new EventEmitter<Goal>();
  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  get isAchieved(): boolean {
    return this.goal.currentCount >= this.goal.totalCount;
  }

  get typeBadgeText(): string {
    return this.goal.type === 'competition' ? 'Competição' : 'Gestão';
  }

  onCardClick(): void {
    this.cardClick.emit(this.goal);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.goal.id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.goal.id);
  }
}
