import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Debater } from 'src/app/models/debater';
import { Duo } from 'src/app/models/duo';
import { SelectOption } from 'src/app/models/select-option';
import { TabdebService } from 'src/app/services/tabdeb.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-duos',
  templateUrl: './duos.component.html',
  styleUrls: ['./duos.component.scss']
})
export class DuosComponent implements OnInit {
  public ths: any[];

  public trs: any[];

  public duos: Duo[];

  public debaters: Debater[];

  public debatersOptions: SelectOption[];

  public form: FormGroup;

  constructor(
    private tabdebService: TabdebService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.getAllDuos();
    this.getAllDebaters();
    this.initForm();
  }

  public getAllDuos() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDuos(token).subscribe((duos: Duo[]) => {
      this.duos = duos;
      this.initThs();
      this.initTrs();
    });
  }

  public initThs() {
    this.ths = ['Nome'];
  }

  public initTrs() {
    this.trs = this.duos.map((duo: Duo) => [this.utilsService.getDuoName(duo)]);
  }

  public updateTrs(name: string) {
    this.trs.push([name]);
  }

  public initForm() {
    this.form = this.formBuilder.group({
      a: [''],
      b: ['']
    });
  }

  public createDuo() {
    const { a, b } = this.form.value;

    const debaterA: Debater = this.debaters.find((debater: Debater) => debater.id === a)!;
    const debaterB: Debater = this.debaters.find((debater: Debater) => debater.id === b)!;

    this.updateTrs(`${debaterA.name} e ${debaterB.name}`);

    this.form.controls['a'].patchValue("");
    this.form.controls['b'].patchValue("");

    const token = localStorage.getItem('token')!;

    this.tabdebService.createDuo(token, debaterA, debaterB).subscribe(() => {});
  }

  public getAllDebaters() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDebaters(token).subscribe((debaters: Debater[]) => {
      this.debaters = debaters;
      this.getDebatersOptions();
    })
  }

  public getDebatersOptions() {
    this.debatersOptions = this.debaters.map((debater: Debater) => ({
      id: debater.id,
      value: debater.name
    }));
  }
}
