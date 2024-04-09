import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Article } from 'src/app/models/types/article';

@Component({
  selector: 'app-create-article-modal',
  templateUrl: './create-article-modal.component.html',
  styleUrls: ['./create-article-modal.component.scss']
})
export class CreateArticleModalComponent {
  public isEditing: boolean;

  public article: Article;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { isEditing: boolean, article: Article }) {
    if (data) {
      this.isEditing = data.isEditing;
      this.article = data.article;
    }
  }
}
