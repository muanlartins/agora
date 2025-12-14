import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';
import { Article } from 'src/app/models/types/article';
import { Member } from 'src/app/models/types/member';
import { SelectOption } from 'src/app/models/types/select-option';
import { ArticleService } from 'src/app/services/article.service';
import { MemberService } from 'src/app/services/member.service';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { isAdmin } from 'src/app/utils/auth';

@Component({
  selector: 'app-articles-grid',
  templateUrl: './articles-grid.component.html',
  styleUrls: ['./articles-grid.component.scss']
})
export class ArticlesGridComponent implements OnInit {
  form: FormGroup;
  tagOptions: SelectOption[] = [];
  members: Member[] = [];
  articles: Article[] = [];
  filteredArticles: Article[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private articleService: ArticleService,
    private memberService: MemberService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      tag: ['']
    });

    this.form.controls['tag'].valueChanges.subscribe((tag) => {
      this.filterArticles(tag);
    });
  }

  private getData(): void {
    combineLatest([
      this.articleService.getAllArticles(),
      this.memberService.getAllMembers()
    ]).subscribe(([articles, members]) => {
      if (articles?.length && members?.length) {
        this.articles = articles.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.members = members;
        this.filteredArticles = this.articles;
        this.initOptions();
      }
    });
  }

  private initOptions(): void {
    this.tagOptions = [...new Set(this.articles.map(a => a.tag))].map(tag => ({
      value: tag,
      viewValue: tag
    }));
  }

  private filterArticles(tag: string): void {
    if (!tag) {
      this.filteredArticles = this.articles;
    } else {
      this.filteredArticles = this.articles.filter(a => a.tag === tag);
    }
  }

  getAuthor(authorId: string): Member | undefined {
    return this.members.find(m => m.id === authorId);
  }

  get articleCount(): number {
    return this.filteredArticles.length;
  }

  isAdmin(): boolean {
    return isAdmin();
  }

  createArticle(): void {
    this.router.navigate(['/articles/new']);
  }

  editArticle(id: string): void {
    this.router.navigate(['/articles/edit', id]);
  }

  deleteArticle(id: string): void {
    const article = this.articles.find(a => a.id === id);
    if (!article) return;

    this.dialog.open(ConfirmModalComponent, {
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      data: {
        text: `Você tem certeza que quer deletar o artigo <b>${article.title}</b>?`,
        positiveCallback: async () => {
          await this.articleService.deleteArticle(id);
        },
        negativeCallback: async () => {}
      }
    });
  }
}
