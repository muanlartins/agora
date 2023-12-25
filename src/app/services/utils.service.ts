import { Injectable } from '@angular/core';
import { DashboardItem } from '../models/dashboard-item';
import { Duo } from '../models/duo';

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
      // {
      //   src: 'assets/profile.png',
      //   title: 'Perfil',
      //   route: "/profile"
      // },
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
    ];
  }

  public getItems(): DashboardItem[] {
    return this.items;
  }

  public getDuoName(duo: Duo): string {
    return `${duo.a.name} e ${duo.b.name}`;
  }
}
