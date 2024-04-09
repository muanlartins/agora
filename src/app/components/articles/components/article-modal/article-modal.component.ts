import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Article } from 'src/app/models/types/article';
import { Member } from 'src/app/models/types/member';

@Component({
  selector: 'app-article-modal',
  templateUrl: './article-modal.component.html',
  styleUrls: ['./article-modal.component.scss']
})
export class ArticleModalComponent {
  public article: Article;

  public member: Member;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { article: Article, member: Member }) {
    if (data) {
      this.article = data.article;
      this.member = data.member;
    }
  }
}
