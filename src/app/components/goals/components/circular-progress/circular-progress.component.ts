import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circular-progress',
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.scss']
})
export class CircularProgressComponent {
  @Input() current: number = 0;
  @Input() total: number = 1;
  @Input() size: number = 100;
  @Input() strokeWidth: number = 8;

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get percentage(): number {
    if (this.total === 0) return 0;
    return Math.min(Math.round((this.current / this.total) * 100), 100);
  }

  get dashOffset(): number {
    const progress = this.total === 0 ? 0 : this.current / this.total;
    return this.circumference * (1 - Math.min(progress, 1));
  }

  get isAchieved(): boolean {
    return this.current >= this.total && this.total > 0;
  }

  get center(): number {
    return this.size / 2;
  }
}
