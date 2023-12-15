import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardItem } from 'src/app/models/dashboard-item';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public items: DashboardItem[];

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.initItems();
  }

  public initItems() {
    this.items = [
      {
        src: 'assets/profile.png',
        title: 'Perfil',
        callback: () => { this.router.navigate(["/profile"]) }
      },
      {
        src: 'assets/pulpit.png',
        title: 'Debates',
        callback: () => { this.router.navigate(["/debates"]) }
      }
    ];
  }
}
