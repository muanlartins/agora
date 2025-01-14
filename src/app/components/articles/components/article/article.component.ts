import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import { Article } from 'src/app/models/types/article';
import { Member } from 'src/app/models/types/member';
import { ArticleService } from 'src/app/services/article.service';
import { MemberService } from 'src/app/services/member.service';
import { isUser } from 'src/app/utils/auth';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  public article: Article;

  public member: Member;

  public constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private memberService: MemberService,
  ) {}

  public ngOnInit() {
    this.route.params.subscribe(async (params: any) => {
      if (params && params.id) {
        const articleId = params.id;

        const article = await this.articleService.getArticle(articleId);

        if (!article) {
          this.goToArticlesPage();
          return;
        }

        this.article = article;

        this.member = await this.memberService.getMember(article.authorId);
      }
    });
  }

  public getDate(date: string) {
    return moment(date).locale('pt-br').format(`LLL`);
  }

  public goToArticlesPage() {
    this.router.navigate(["/articles"]);
  }

  public isUser() {
    return isUser();
  }
}
