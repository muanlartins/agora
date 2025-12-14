import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as removeAccents from 'remove-accents';
import { Article } from 'src/app/models/types/article';
import { SelectOption } from 'src/app/models/types/select-option';
import { ArticleService } from 'src/app/services/article.service';
import { MemberService } from 'src/app/services/member.service';
import { HasUnsavedChanges } from 'src/app/guards/unsaved-changes.guard';

@Component({
  selector: 'app-article-editor',
  templateUrl: './article-editor.component.html',
  styleUrls: ['./article-editor.component.scss']
})
export class ArticleEditorComponent implements OnInit, OnDestroy, HasUnsavedChanges {
  form: FormGroup;
  isEditing = false;
  articleId: string | null = null;
  originalArticle: Article | null = null;
  saving = false;
  loading = true;

  tagOptions: SelectOption[] = [];
  authorOptions: SelectOption[] = [];
  filteredAuthorOptions: SelectOption[] = [];

  private destroy$ = new Subject<void>();
  private formDirty = false;

  get title(): string {
    return this.form?.get('title')?.value || '';
  }

  get content(): string {
    return this.form?.get('content')?.value || '';
  }

  get selectedTag(): string {
    const tag = this.form?.get('tag')?.value;
    if (tag === 'Nova Tag') {
      return this.form?.get('newTag')?.value || '';
    }
    return tag || '';
  }

  get authorName(): string {
    const authorId = this.form?.get('authorId')?.value;
    const author = this.authorOptions.find(a => a.value === authorId);
    return author?.viewValue || '';
  }

  get showNewTagField(): boolean {
    return this.form?.get('tag')?.value === 'Nova Tag';
  }

  get isFormValid(): boolean {
    if (!this.form?.valid) return false;
    if (this.showNewTagField && !this.form?.get('newTag')?.value?.trim()) {
      return false;
    }
    return true;
  }

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ArticleService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  hasUnsavedChanges(): boolean {
    return this.formDirty && !this.saving;
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      tag: ['', Validators.required],
      newTag: [''],
      authorId: ['', Validators.required],
      memberFilter: ['']
    });

    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formDirty = true;
      });

    this.form.get('memberFilter')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((name: string) => {
        this.filteredAuthorOptions = this.authorOptions.filter(option =>
          removeAccents(option.viewValue.toLowerCase()).includes(removeAccents((name || '').toLowerCase()))
        );
      });
  }

  private async loadData(): Promise<void> {
    this.loading = true;

    const articleId = this.route.snapshot.paramMap.get('id');
    this.isEditing = !!articleId;
    this.articleId = articleId;

    await this.loadOptions();

    if (this.isEditing && articleId) {
      await this.loadArticle(articleId);
    } else {
      this.form.patchValue({
        title: '',
        content: ''
      });
    }

    this.loading = false;
    this.formDirty = false;
  }

  private async loadOptions(): Promise<void> {
    const [articles, members] = await Promise.all([
      firstValueFrom(this.articleService.getAllArticles()),
      firstValueFrom(this.memberService.getAllMembers())
    ]);

    const existingTags = [...new Set(articles.map(a => a.tag))].filter(Boolean);
    this.tagOptions = [
      ...existingTags.map(tag => ({ value: tag, viewValue: tag })),
      { value: 'Nova Tag', viewValue: 'Nova Tag' }
    ];

    this.authorOptions = members
      .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
      .map(member => ({ value: member.id, viewValue: member.name }));

    this.filteredAuthorOptions = this.authorOptions;
  }

  private async loadArticle(id: string): Promise<void> {
    try {
      const article = await this.articleService.getArticle(id);
      this.originalArticle = article;

      this.form.patchValue({
        title: article.title,
        content: article.content,
        tag: article.tag,
        authorId: article.authorId
      });
    } catch (error) {
      console.error('Error loading article:', error);
      this.router.navigate(['/articles']);
    }
  }

  async save(): Promise<void> {
    if (!this.isFormValid || this.saving) return;

    this.saving = true;

    const title = this.form.get('title')?.value?.trim();
    const content = this.form.get('content')?.value;
    const tag = this.showNewTagField
      ? this.form.get('newTag')?.value?.trim()
      : this.form.get('tag')?.value;
    const authorId = this.form.get('authorId')?.value;

    try {
      if (this.isEditing && this.articleId) {
        await this.articleService.updateArticle(this.articleId, title, content, tag, authorId);
      } else {
        await this.articleService.createArticle(title, content, tag, authorId);
      }

      this.formDirty = false;
      this.router.navigate(['/articles']);
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      this.saving = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}
