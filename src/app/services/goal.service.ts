import { Injectable } from '@angular/core';
import { Goal } from '../models/types/goal';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { BASE_URL } from '../utils/constants';

const ENDPOINTS = {
  getAllGoals: '/goals',
  createGoal: '/goal',
  editGoal: '/goal',
  deleteGoal: (id: string) => `/goal/${id}`
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  public goals$: BehaviorSubject<Goal[]> = new BehaviorSubject<Goal[]>([]);

  constructor(private httpClient: HttpClient) { }

  public getAllGoals(): Observable<Goal[]> {
    if (this.goals$.value && this.goals$.value.length)
      return this.goals$.asObservable();

    this.httpClient.get<Goal[]>(BASE_URL + ENDPOINTS.getAllGoals)
      .subscribe((goals) => {
        this.goals$.next(goals);
      });

    return this.goals$.asObservable();
  }

  public async createGoal(title: string, currentCount: number, totalCount: number, type: string, description: string) {
    const goal = await firstValueFrom(this.httpClient.post<Goal>(BASE_URL + ENDPOINTS.createGoal, {
      title,
      currentCount,
      totalCount,
      type,
      description
    }));

    this.goals$.next([...this.goals$.value, goal]);

    return goal;
  }

  public async updateGoal(id: string, title: string, currentCount: number, totalCount: number, type: string, description: string) {
    await firstValueFrom(this.httpClient.put<boolean>(BASE_URL + ENDPOINTS.editGoal, {
      id,
      title,
      currentCount,
      totalCount,
      type,
      description
    }));

    const goals = [...this.goals$.value];
    goals.splice(goals.findIndex((goal) => goal.id === id), 1);
    goals.push({id, title, currentCount, totalCount, type, description});

    this.goals$.next(goals);
  }

  public async deleteGoal(id: string) {
    await firstValueFrom(this.httpClient.delete<boolean>(BASE_URL + ENDPOINTS.deleteGoal(id)));

    const goals = [...this.goals$.value];
    goals.splice(goals.findIndex((goal) => goal.id === id), 1);

    this.goals$.next(goals);
  }
}
