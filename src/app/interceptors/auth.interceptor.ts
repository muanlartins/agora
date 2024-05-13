import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpStatusCode
} from '@angular/common/http';
import { EMPTY, Observable, catchError, of, tap, throwError } from 'rxjs';
import { deleteToken, getToken } from '../utils/token';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = getToken();

    if (!token) return next.handle(req);

    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next.handle(authReq).pipe(tap({
      error: (e: any) => {
        if (
          e instanceof HttpErrorResponse &&
          (
            e.status === HttpStatusCode.Unauthorized ||
            !e.status
          )
        ) {
          deleteToken();
          this.router.navigate(['/login']);
        }
      }
    }));
  }
}
