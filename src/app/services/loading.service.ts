import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  public loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public loadingAmount$: BehaviorSubject<number> = new BehaviorSubject<number>(0);

  constructor() { }

  public loadingChanges() {
    return this.loading$.asObservable();
  }

  public startLoading() {
    this.loadingAmount$.next(this.loadingAmount$.value + 1);

    this.loading$.next(true);
  }

  public finishLoading() {
    this.loadingAmount$.next(this.loadingAmount$.value - 1);

    if (this.loadingAmount$.value === 0) this.loading$.next(false);
  }
}
