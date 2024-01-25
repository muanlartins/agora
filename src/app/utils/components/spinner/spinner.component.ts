import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit, OnChanges {
  @Input()
  public loading: boolean = false;

  @Input()
  public fullscreen: boolean = false;

  constructor(private spinner: NgxSpinnerService) {
    this.spinner.show();
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading']) {
      this.loading ? this.spinner.show() : this.spinner.hide();
    }
  }

}
