import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Article } from 'src/app/models/types/article';
import { Member } from 'src/app/models/types/member';
import * as moment from 'moment';

@Component({
  selector: 'app-article-card',
  templateUrl: './article-card.component.html',
  styleUrls: ['./article-card.component.scss']
})
export class ArticleCardComponent {
  @Input() article!: Article;
  @Input() author: Member | undefined;
  @Input() showActions = false;

  @Output() edit = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  constructor(private router: Router) {}

  get formattedDate(): string {
    return moment(this.article.createdAt).locale('pt-br').format('DD MMM YYYY');
  }

  get excerpt(): string {
    const content = this.article.content;
    const firstParagraph = content.split('\n').find(line => line.trim() && !line.startsWith('#'));
    if (!firstParagraph) return '';
    const plainText = firstParagraph.replace(/[*_`#\[\]()]/g, '').trim();
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }

  get authorName(): string {
    if (!this.author) return '';
    const names = this.author.name.split(' ');
    if (names.length === 1) return names[0];
    return `${names[0]} ${names[names.length - 1]}`;
  }

  get authorHasPfp(): boolean {
    return this.author?.hasPfp ?? false;
  }

  goToArticle(): void {
    this.router.navigate(['/article', this.article.id]);
  }

  onEdit(event: Event): void {
    event.stopPropagation();
    this.edit.emit(this.article.id);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.article.id);
  }
}
