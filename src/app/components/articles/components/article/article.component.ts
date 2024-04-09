import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { Article } from 'src/app/models/types/article';
import { Member } from 'src/app/models/types/member';
import { MemberService } from 'src/app/services/member.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent {
  @Input()
  public article: Article;

  @Input()
  public member: Member;

  public constructor() {}

  public getDate(date: string) {
    return moment(date).locale('pt-br').format(`LLL`);
  }
}
