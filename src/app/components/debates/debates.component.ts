import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Debater } from 'src/app/models/debater';
import { SelectOption } from 'src/app/models/select-option';
import { TabdebService } from 'src/app/services/tabdeb.service';
import { UtilsService } from 'src/app/services/utils.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DebatePositions } from 'src/app/models/debate-positions';
import { DebateHouses } from 'src/app/models/debate-houses';
import { Subscription } from 'rxjs';
import { Society } from 'src/app/models/society';
import { Judge } from 'src/app/models/judge';

@Component({
  selector: 'app-debates',
  templateUrl: './debates.component.html',
  styleUrls: ['./debates.component.scss'],
})
export class DebatesComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {}
}
