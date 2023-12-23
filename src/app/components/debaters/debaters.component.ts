import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Debater } from 'src/app/models/debater';
import { TabdebService } from 'src/app/services/tabdeb.service';

@Component({
  selector: 'app-debaters',
  templateUrl: './debaters.component.html',
  styleUrls: ['./debaters.component.scss']
})
export class DebatersComponent implements OnInit {
  public ths: any[];

  public trs: any[];

  public debaters: Debater[];

  public form: FormGroup;

  constructor(private tabdebService: TabdebService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.getAllDebaters();
    this.initForm();
  }

  public getAllDebaters() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDebaters(token).subscribe((debaters: Debater[]) => {
      this.debaters = debaters.sort((a: Debater, b: Debater) => a.name.localeCompare(b.name));;
      this.initThs();
      this.initTrs();
    });
  }

  public initThs() {
    this.ths = ['Nome'];
  }

  public initTrs() {
    this.trs = this.debaters.map((debater: Debater) => [debater.name]);
  }

  public updateTrs(name: string) {
    this.trs.push([name]);
  }

  public initForm() {
    this.form = this.formBuilder.group({
      name: ['']
    });
  }

  public createDebater() {
    const { name } = this.form.value;

    this.updateTrs(name);

    this.form.controls['name'].patchValue("");

    const token = localStorage.getItem('token')!;

    this.tabdebService.createDebater(token, name).subscribe(() => {});
  }
}
