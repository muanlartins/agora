import { trigger, state, style, transition, animate } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Article } from 'src/app/models/types/article';
import { SelectOption } from 'src/app/models/types/select-option';
import { isAdmin } from 'src/app/utils/auth';
import { ArticleService } from 'src/app/services/article.service';
import { MemberService } from 'src/app/services/member.service';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';
import { Member } from 'src/app/models/types/member';
import * as moment from 'moment';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { CreateArticleModalComponent } from '../create-article-modal/create-article-modal.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-articles-table',
  templateUrl: './articles-table.component.html',
  styleUrls: ['./articles-table.component.scss'],
  animations: [
    trigger('expandDetail', [
      state('collapsed', style({height: '0', margin: '0'})),
      state('expanded', style({height: '*', margin: '1rem 0'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ArticlesTableComponent implements OnInit {
  public form: FormGroup;

  public tagOptions: SelectOption[];

  public members: Member[] = [];

  public articles: Article[] = [];

  public filteredArticles: Article[] = [];

  public constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private articleService: ArticleService,
    private memberService: MemberService,
    private dialog: MatDialog,
  ) {}

  public ngOnInit(): void {
    this.initForm();
    this.getData();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      tag: ['']
    });

    this.subscribeToValueChanges();
  }

  public getData() {
    combineLatest([
      this.articleService.getAllArticles(),
      this.memberService.getAllMembers()
    ]).subscribe(([articles, members]) => {
      if (articles && articles.length && members && members.length) {
        this.articles = articles;
        this.members = members;
        this.filteredArticles = articles;

        this.initOptions();
      }
    });
  }

  public getDate(date: string) {
    return moment(date).locale('pt-br').format(`DD MMM, YYYY`);
  }

  public initOptions() {
    this.tagOptions = [... new Set(this.articles.map((article) => article.tag))].map((tag: string) => ({
      value: tag,
      viewValue: tag
    }));
  }

  public subscribeToValueChanges() {
    this.form.controls['tag'].valueChanges.subscribe((tag) => {
    });
  }

  public openCreateArticleModal() {
    this.dialog.open(CreateArticleModalComponent, {
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)', autoFocus: false, disableClose: true });
  }

  public getAuthor(id: string) {
    return this.members.find((member) => member.id === id);
  }

  public getAuthorName(id: string) {
    const author = this.getAuthor(id);

    if (!author) return '';

    const authorFullName = author.name;

    const authorNames = authorFullName.split(' ');

    if (authorNames.length === 1) return authorNames[0];

    let finalName = `${authorNames[0]}`;

    for (let i=1;i<authorNames.length;i++) {
      finalName += ` ${authorNames[i][0]}.`;
    }

    return finalName;
  }

  public editArticle(id: string, event: Event) {
    event.stopPropagation();

    this.dialog.open(CreateArticleModalComponent, {
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
      maxWidth: 'calc(100vw - 2rem)',
      autoFocus: false,
      disableClose: true,
      data: {
        isEditing: true,
        article: this.articles.find((article) => article.id === id)
      }
    });
  }

  public deleteArticle(id: string, event: Event) {
    event.stopPropagation();

    const article = this.articles.find((article) => article.id === id)!;

    this.dialog.open(ConfirmModalComponent, {
      minWidth: 'calc(100vw - 2rem)',
      minHeight: 'calc(100vh - 2rem)',
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

  public getArticle(element: Article): Article {
    return element;
  }

  public isAdmin() {
    return isAdmin();
  }

  public goToArticlePage(id: string) {
    this.router.navigate([`/article/${id}`]);
  }

  public showEdit() {
    return isAdmin();
  }

  public showDelete() {
    return isAdmin();
  }
}
