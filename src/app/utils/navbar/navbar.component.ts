import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardItem } from 'src/app/models/dashboard-item';
import { RouteTitles } from 'src/app/models/route-titles';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public items: DashboardItem[];

  public title: string;

  constructor(private utilsService: UtilsService, private router: Router) { }

  ngOnInit(): void {
    this.getItems();
    this.getTitle();
  }

  public getItems() {
    this.items = this.utilsService.getItems();
  }

  public getTitle() {
    const route: any = this.router.url

    this.title = RouteTitles[route];
  }
}
