import { Component, OnInit } from '@angular/core';
import { DashboardItem } from 'src/app/models/types/dashboard-item';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public items: DashboardItem[];

  constructor(private utilsService: UtilsService) { }

  ngOnInit(): void {
    this.items = this.utilsService.getItems();
  }
}
