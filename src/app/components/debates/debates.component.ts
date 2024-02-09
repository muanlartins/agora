import { Component, OnInit } from '@angular/core';
import { Debate } from 'src/app/models/types/debate';

@Component({
  selector: 'app-debates',
  templateUrl: './debates.component.html',
  styleUrls: ['./debates.component.scss'],
})
export class DebatesComponent implements OnInit {
  public debates: Debate[] = [];

  constructor() { }

  ngOnInit(): void {}
}
