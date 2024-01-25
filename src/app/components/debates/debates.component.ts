import { Component, OnInit } from '@angular/core';
import { Debate } from 'src/app/models/types/debate';
import { DebateService } from 'src/app/services/debate.service';

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
