import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardItem } from 'src/app/models/dashboard-item';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  public items: DashboardItem[];

  constructor(private utilsService: UtilsService, private router: Router) { }

  ngOnInit(): void {
    this.items = this.utilsService.getSidebarItems();
  }

  public logout() {
    localStorage.removeItem('token');

    this.router.navigate(["/login"]);
  }
}
