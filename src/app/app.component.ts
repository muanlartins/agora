import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { LoadingService } from './services/loading.service';

Chart.register(...registerables);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public title: string = 'Ágora';

  public loading: boolean = false;

  constructor(private loadingService: LoadingService, private cdr: ChangeDetectorRef) {}

  public ngOnInit(): void {
    this.loadingService.loadingChanges().subscribe((loading: boolean) => {
      this.loading = loading;
      this.cdr.detectChanges();
    });
  }
}
