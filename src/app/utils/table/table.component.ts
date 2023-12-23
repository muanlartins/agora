import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input()
  public ths: any[];

  @Input()
  public trs: any[][];

  @Output()
  public rowClick = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  public output(index: number) {
    this.rowClick.emit(index);
  }
}
