import { Injectable } from '@angular/core';
import { DashboardItem } from '../models/dashboard-item';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  public items: DashboardItem[];

  constructor() {
    this.initItems();
  }

  public initItems() {
    this.items = [
      {
        src: 'assets/dashboard.png',
        title: 'Dashboard',
        route: "/dashboard"
      },
      {
        src: 'assets/debate.png',
        title: 'Debates',
        route: "/debates"
      },
      {
        src: 'assets/member.png',
        title: 'Membros',
        route: "/members"
      },
    ];
  }

  public getItems(): DashboardItem[] {
    return this.items;
  }
}
