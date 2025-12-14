import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { Article } from 'src/app/models/types/article';
import { Member } from 'src/app/models/types/member';
import { ArticleService } from 'src/app/services/article.service';
import { MemberService } from 'src/app/services/member.service';
import { ArticlePdfService } from 'src/app/services/article-pdf.service';
import { isUser } from 'src/app/utils/auth';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  article: Article | null = null;
  member: Member | null = null;
  loading = true;
  linkCopied = false;
  generatingPdf = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private memberService: MemberService,
    private pdfService: ArticlePdfService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(async (params: any) => {
      if (params?.id) {
        this.loading = true;
        try {
          const article = await this.articleService.getArticle(params.id);
          if (!article) {
            this.goToArticlesPage();
            return;
          }
          this.article = article;
          this.member = await this.memberService.getMember(article.authorId);
        } catch (error) {
          console.error('Error loading article:', error);
          this.goToArticlesPage();
        } finally {
          this.loading = false;
        }
      }
    });
  }

  get formattedCreatedDate(): string {
    if (!this.article) return '';
    return moment(this.article.createdAt).locale('pt-br').format('DD [de] MMMM [de] YYYY');
  }

  get formattedUpdatedDate(): string {
    if (!this.article) return '';
    return moment(this.article.updatedAt).locale('pt-br').format('DD [de] MMMM [de] YYYY');
  }

  get showUpdatedDate(): boolean {
    if (!this.article) return false;
    return this.article.createdAt !== this.article.updatedAt;
  }

  goToArticlesPage(): void {
    this.router.navigate(['/articles']);
  }

  isUser(): boolean {
    return isUser();
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(window.location.href);
      this.linkCopied = true;
      setTimeout(() => {
        this.linkCopied = false;
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  }

  async downloadPdf(): Promise<void> {
    if (!this.article || !this.member || this.generatingPdf) return;

    this.generatingPdf = true;
    try {
      await this.pdfService.generatePdf(this.article, this.member);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      this.generatingPdf = false;
    }
  }
}
