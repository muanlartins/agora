import { trigger, state, style, transition, animate } from '@angular/animations';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
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
import { ArticleModalComponent } from '../article-modal/article-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class ArticlesTableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  public sort: MatSort;

  public form: FormGroup;

  public tagOptions: SelectOption[];

  public members: Member[] = [];

  public articles: Article[] = [];

  public filteredArticles: Article[] = [];

  public dataSource: MatTableDataSource<Article> = new MatTableDataSource<Article>();

  public columns: string[] = [];

  public expandedElement?: Article;

  public label: { [column: string]: string } = {
    createdAt: 'Criado em',
    title: 'Título',
    author: 'Autor'
  }

  public loading: boolean = false;

  public constructor(
    private formBuilder: FormBuilder,
    private articleService: ArticleService,
    private memberService: MemberService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.initForm();
    this.initColumns();
  }

  public ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.getData();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      tag: ['']
    });

    this.subscribeToValueChanges();
  }

  public initColumns() {
    this.columns = [
      'createdAt',
      'title',
      'author',
      'edit',
      'delete'
    ];
  }

  public setDataSource() {
    if (!this.filteredArticles) return;

    this.dataSource.data = this.filteredArticles;

    this.changeDetectorRef.detectChanges();
  }

  public getData() {
    this.loading = true;

    combineLatest([
      this.articleService.getAllArticles(),
      this.memberService.getAllMembers()
    ]).subscribe(([articles, members]) => {
      if (articles && articles.length && members && members.length) {
        this.loading = false;
        this.articles = articles;
        this.members = members;
        this.filteredArticles = articles;

        this.initOptions();
        this.setDataSource();
      }
    });
  }

  public initOptions() {
    this.tagOptions = [... new Set(this.articles.map((article) => article.tag))].map((tag: string) => ({
      value: tag,
      viewValue: tag
    }));
  }

  public subscribeToValueChanges() {
    this.form.controls['tag'].valueChanges.subscribe((tag) => {
      this.dataSource.filter = tag;
    });
  }

  public openCreateArticleModal() {
    this.dialog.open(CreateArticleModalComponent, { width: '70vw', maxHeight: '80vh', autoFocus: false, disableClose: true });
  }

  public getColumnData(element: Article, column: string) {
    if (column === 'createdAt') return moment(element.createdAt).locale('pt-br').format(`LLL`);
    if (column === 'title') return element.title;
    if (column === 'author') {
      const member = this.getAuthor(element.authorId);

      if (!member) return;

      return member.name;
    }

    return '';
  }

  public getAuthor(id: string) {
    return this.members.find((member) => member.id === id);
  }

  public editArticle(id: string, event: Event) {
    event.stopPropagation();

    this.dialog.open(CreateArticleModalComponent, { width: '70vw', maxHeight: '80vh', autoFocus: false, disableClose: true, data: {
      isEditing: true,
      article: this.articles.find((article) => article.id === id)
    }});
  }

  public deleteArticle(id: string, event: Event) {
    event.stopPropagation();

    const article = this.articles.find((article) => article.id === id)!;

    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você tem certeza que quer deletar o artigo <b>${article.title}</b>?`,
      callback: async () => {
        this.loading = true;
        await this.articleService.deleteArticle(id);
        this.loading = false;
      }
    } });
  }

  public getArticle(element: Article): Article {
    return element;
  }

  public isAdmin() {
    return isAdmin();
  }

  public openArticleModal(id: string) {
    const article = this.articles.find((article) => article.id === id)!;
    const member = this.members.find((member) => member.id === article.authorId)!;

    this.dialog.open(ArticleModalComponent, { width: '70vw', maxHeight: '80vh', autoFocus: false, data: {
      article: article,
      member: member,
    } });
  }

  public showEdit(column: string) {
    return column === 'edit' && isAdmin();
  }

  public showDelete(column: string) {
    return column === 'delete' && isAdmin();
  }
}
