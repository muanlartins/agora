import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, firstValueFrom } from "rxjs";
import { BASE_URL } from "../utils/constants";
import { getToken } from "../utils/token";
import { Article } from "../models/types/article";
import * as moment from "moment";

const ENDPOINTS = {
  getAllArticles: '/articles',
  createArticle: '/article',
  editArticle: '/article',
  deleteArticle: (id: string) => `/article/${id}`
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  public articles$: BehaviorSubject<Article[]> = new BehaviorSubject<Article[]>([]);

  constructor(private httpClient: HttpClient) { }

  public getAllArticles(): Observable<Article[]> {
    if (this.articles$.value && this.articles$.value.length)
      return this.articles$.asObservable();

    const token = getToken();

    this.httpClient.get<Article[]>(BASE_URL + ENDPOINTS.getAllArticles, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }).subscribe((articles) => this.articles$.next(articles));

    return this.articles$.asObservable();
  }

  public async createArticle(title: string, content: string, tag: string, authorId: string) {
    const token = getToken();

    const article = await firstValueFrom(this.httpClient.post<Article>(BASE_URL + ENDPOINTS.createArticle, {
      title,
      content,
      tag,
      authorId
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    this.articles$.next([...this.articles$.value, article]);

    return article;
  }

  public async updateArticle(id: string, title: string, content: string, tag: string, authorId: string) {
    const token = getToken();

    await firstValueFrom(this.httpClient.put<boolean>(BASE_URL + ENDPOINTS.editArticle, {
      id,
      title,
      content,
      tag,
      authorId,
    }, {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    const articles = [...this.articles$.value];
    articles.splice(articles.findIndex((article) => article.id === id), 1);
    articles.push({id, title, content, tag, authorId, createdAt: moment(Date.now()).toISOString(), updatedAt: moment(Date.now()).toISOString()});

    this.articles$.next(articles);
  }

  public async deleteArticle(id: string) {
    const token = getToken();

    await firstValueFrom(this.httpClient.delete<boolean>(BASE_URL + ENDPOINTS.deleteArticle(id), {
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`),
    }));

    const articles = [...this.articles$.value];
    articles.splice(articles.findIndex((article) => article.id === id), 1);

    this.articles$.next(articles);
  }
}
