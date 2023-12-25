import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TabdebService } from 'src/app/services/tabdeb.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-debates',
  templateUrl: './debates.component.html',
  styleUrls: ['./debates.component.scss']
})
export class DebatesComponent implements OnInit {
  public form: FormGroup;

  constructor(
    private tabdebService: TabdebService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  public initForm() {
    this.form = this.formBuilder.group({});
  }
}
