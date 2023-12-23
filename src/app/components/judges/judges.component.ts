import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Judge } from 'src/app/models/judge';
import { TabdebService } from 'src/app/services/tabdeb.service';

@Component({
  selector: 'app-judges',
  templateUrl: './judges.component.html',
  styleUrls: ['./judges.component.scss']
})
export class JudgesComponent implements OnInit {
  public ths: any[];

  public trs: any[];

  public judges: Judge[];

  public form: FormGroup;

  constructor(private tabdebService: TabdebService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getAllJudges();
    this.initForm();
  }

  public getAllJudges() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllJudges(token).subscribe((judges: Judge[]) => {
      this.judges = judges.sort((a: Judge, b: Judge) => a.name.localeCompare(b.name));
      this.initThs();
      this.initTrs();
    });

  }

  public initThs() {
    this.ths = ['Nome'];
  }

  public initTrs() {
    this.trs = this.judges.map((judge: Judge) => [judge.name]);
  }

  public updateTrs(name: string) {
    this.trs.push([name]);
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: ['']
    });
  }

  public createJudge() {
    const { name } = this.form.value;

    this.updateTrs(name);

    this.form.controls['name'].patchValue("");

    const token = localStorage.getItem('token')!;

    this.tabdebService.createJudge(token, name).subscribe(() => {});
  }
}
