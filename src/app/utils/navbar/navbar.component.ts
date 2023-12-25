import { Component, OnInit } from '@angular/core';
import { DashboardItem } from 'src/app/models/dashboard-item';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  public items: DashboardItem[];

  constructor(private utilsService: UtilsService) { }

  ngOnInit(): void {
    this.getItems();
  }

  public getItems() {
    this.items = this.utilsService.getItems();
  }
}
