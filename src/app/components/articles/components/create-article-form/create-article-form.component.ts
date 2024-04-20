import { Component, ElementRef, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as removeAccents from 'remove-accents';
import { firstValueFrom } from 'rxjs';
import { ConfirmModalComponent } from 'src/app/components/members/components/confirm-modal/confirm-modal.component';
import { Article } from 'src/app/models/types/article';
import { SelectOption } from 'src/app/models/types/select-option';
import { ArticleService } from 'src/app/services/article.service';
import { MemberService } from 'src/app/services/member.service';
import { getState, setState } from 'src/app/utils/state';

@Component({
  selector: 'app-create-article-form',
  templateUrl: './create-article-form.component.html',
  styleUrls: ['./create-article-form.component.scss']
})
export class CreateArticleFormComponent implements OnInit {
  @Input()
  public isEditing: boolean;

  @Input()
  public article: Article;

  public form: FormGroup;

  public tagOptions: SelectOption[] = [];

  public authorOptions: SelectOption[] = [];

  public filteredAuthorOptions: SelectOption[] = [];

  public loading: boolean = false;

  public get title() {
    return this.form ? this.form.controls['title'].value : '';
  }

  public get markdown() {
    return this.form ? this.form.controls['content'].value : '';
  }

  public constructor(
    private formBuilder: FormBuilder,
    private articleService: ArticleService,
    private memberService: MemberService,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {}

  public async ngOnInit(): Promise<void> {
    this.initForm();
    await this.initOptions();
  }

  public initForm() {
    this.form = this.formBuilder.group({
      title: ['Esse é um exemplo de título', Validators.required],
      content: ['Esse é um exemplo de conteúdo', Validators.required],
      tag: ['', Validators.required],
      newTag: [''],
      authorId: ['', Validators.required],
      memberFilter: ['']
    });

    const state = getState();

    if (this.isEditing) {
      this.form.controls['title'].patchValue(this.article.title);
      this.form.controls['content'].patchValue(this.article.content);
      this.form.controls['tag'].patchValue(this.article.tag);
      this.form.controls['authorId'].patchValue(this.article.authorId);

      if (state[this.article.id] && state[this.article.id].title)
        this.form.controls['title'].patchValue(state[this.article.id].title);
      if (state[this.article.id] && state[this.article.id].content)
        this.form.controls['content'].patchValue(state[this.article.id].content);
      if (state[this.article.id] && state[this.article.id].tag)
        this.form.controls['tag'].patchValue(state[this.article.id].tag);
      if (state[this.article.id] && state[this.article.id].authorId)
        this.form.controls['authorId'].patchValue(state[this.article.id].authorId);
    } else if (state['article']) {
      const article = state['article'];

      this.form.controls['title'].patchValue(article.title);
      this.form.controls['content'].patchValue(article.content);
      this.form.controls['tag'].patchValue(article.tag);
      this.form.controls['authorId'].patchValue(article.authorId);
    }

    this.form.controls['memberFilter'].valueChanges.subscribe((name: string) =>
      this.filteredAuthorOptions = this.authorOptions.filter((option) => removeAccents(option.viewValue.toLowerCase()).includes(removeAccents(name.toLowerCase())))
    );
  }

  public getButtonText(): string {
    if (this.isEditing) return 'Atualizar';

    return 'Criar';
  }

  public async initOptions() {
    const articles = await firstValueFrom(this.articleService.getAllArticles());

    this.tagOptions = [].map((tag: string) => ({
      value: tag,
      viewValue: tag
    }));

    this.tagOptions = [... new Set(articles.map((article) => article.tag)), 'Nova Tag']
      .filter((tag): tag is string => tag !== null)
      .map((tag) => {
        return {
          value: tag,
          viewValue: tag
        }
      });

    const members = await firstValueFrom(this.memberService.getAllMembers());

    this.authorOptions = members.map((member) => ({
      value: member.id,
      viewValue: member.name
    }));

    this.filteredAuthorOptions = this.authorOptions;
  }

  public showNewTagFormField() {
    return this.form.controls['tag'].value === 'Nova Tag';
  }

  public close() {
    this.dialog.open(ConfirmModalComponent, { data: {
      text: `Você <b>poderá perder</b> qualquer mudança <b>não salva</b>! Tem certeza que quer continuar?`,
      callback: () => {
        const state = getState();

        if (this.isEditing) {
          state[this.article.id] = {
            title: this.form.controls['title'].value !== this.article.title ? this.form.controls['title'].value : '',
            content:  this.form.controls['content'].value !== this.article.content ? this.form.controls['content'].value : '',
            tag: this.form.controls['tag'].value !== this.article.tag ?
              this.showNewTagFormField() ?
              this.form.controls['newTag'].value :
              this.form.controls['tag'].value :
              '',
            authorId: this.form.controls['authorId'].value !== this.article.authorId ? this.form.controls['authorId'].value : '',
          }
        } else {
          state['article'] = {
            title: this.form.controls['title'].value,
            content: this.form.controls['content'].value,
            tag: this.showNewTagFormField() ?
            this.form.controls['newTag'].value :
            this.form.controls['tag'].value,
            authorId: this.form.controls['authorId'].value,
          }
        }

        setState(state);
        this.dialog.closeAll();
      }
    }});
  }

  public async submit() {
    if (!this.form.valid) return;

    const title = this.form.controls['title'].value;
    const content = this.form.controls['content'].value;
    const tag =
      this.showNewTagFormField() ?
      this.form.controls['newTag'].value :
      this.form.controls['tag'].value;
    const authorId = this.form.controls['authorId'].value;


    this.loading = true;
    if (this.isEditing)
      await this.articleService.updateArticle(this.article.id, title, content, tag, authorId);
    else {
      await this.articleService.createArticle(title, content, tag, authorId);
    }
    this.loading = false;

    const state = getState();

    if (this.isEditing)
      delete state[this.article.id];
    else
      delete state['article'];

    setState(state);

    this.dialog.closeAll();
  }
}
