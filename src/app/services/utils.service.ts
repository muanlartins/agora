import { Injectable } from '@angular/core';
import { NavbarItem } from '../models/types/dashboard-item';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  public items: NavbarItem[];

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

  public getItems(): NavbarItem[] {
    return this.items;
  }
}
