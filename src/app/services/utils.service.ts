import { Injectable } from '@angular/core';
import { DashboardItem } from '../models/dashboard-item';
import { Duo } from '../models/duo';
import { Debate } from '../models/debate';
import { Debater } from '../models/debater';

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
        src: 'assets/profile.png',
        title: 'Perfil',
        route: "/profile"
      },
      {
        src: 'assets/debate.png',
        title: 'Debates',
        route: "/debates"
      },
      {
        src: 'assets/debater.png',
        title: 'Debatedores',
        route: "/debaters"
      },
      {
        src: 'assets/judge.png',
        title: 'Juízes',
        route: "/judges"
      },
      {
        src: 'assets/duo.png',
        title: 'Duplas',
        route: "/duos"
      },
      {
        src: 'assets/graph.png',
        title: 'Gráficos',
        route: "/graphs"
      }
    ];
  }

  public getDashboardItems(): DashboardItem[] {
    return this.items;
  }

  public getSidebarItems(): DashboardItem[] {
    return [{
      src: 'assets/dashboard.png',
      title: 'Menu',
      route: "/dashboard"
    }].concat(this.items);
  }

  public getDuoName(duo: Duo): string {
    return `${duo.a.name} e ${duo.b.name}`;
  }
}
