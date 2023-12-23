import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Debate } from 'src/app/models/debate';
import { Debater } from 'src/app/models/debater';
import { Duo } from 'src/app/models/duo';
import { Judge } from 'src/app/models/judge';
import { SelectOption } from 'src/app/models/select-option';
import { TabdebService } from 'src/app/services/tabdeb.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-debates',
  templateUrl: './debates.component.html',
  styleUrls: ['./debates.component.scss']
})
export class DebatesComponent implements OnInit {
  public ths: any[];

  public trs: any[];

  public debates: Debate[];

  public judges: Judge[];

  public judgesOptions: SelectOption[] = [];

  public debaters: Debater[];

  public debatersOptions: SelectOption[] = [];

  public duos: Duo[];

  public duosOptions: SelectOption[] = [];

  public motionsOptions: SelectOption[] = [];

  public thematicsOptions: SelectOption[] = [];

  public prefixesOptions: SelectOption[] = [];

  public tournamentsOptions: SelectOption[] = [];

  public infoSlidesOptions: SelectOption[] = [];

  public form: FormGroup;

  constructor(
    private tabdebService: TabdebService,
    private formBuilder: FormBuilder,
    private utilsService: UtilsService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.getAllDebates();
    this.getAllDebaters();
    this.getAllJudges();
    this.getAllDuos();
    this.subscribeToValueChanges();
  }

  public getAllDebates() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDebates(token).subscribe((debates: Debate[]) => {
      this.debates = debates;
      this.initThs();
      this.initTrs();
      this.getMotionsOptions();
      this.getThematicsOptions();
      this.getPrefixesOptions();
      this.getTournamentsOptions();
      this.getInfoSlidesOptions();
    });
  }

  public initThs() {
    this.ths = ['Moção', '1G', '1O', '2G', '2O', 'Chair'];
  }

  public initTrs() {
    this.trs = this.debates.map((debate: Debate) => [
      debate.motion,
      this.utilsService.getDuoName(debate.og),
      this.utilsService.getDuoName(debate.oo),
      this.utilsService.getDuoName(debate.cg),
      this.utilsService.getDuoName(debate.co),
      debate.chair.name,
    ]);
  }

  public updateTrs(
    motion: string,
    og: string,
    oo: string,
    cg: string,
    co: string,
    chairName: string,
  ) {
    this.trs.push([
      motion,
      og,
      oo,
      cg,
      co,
      chairName,
    ]);
  }

  public initForm() {
    this.form = this.formBuilder.group({
      motion: [''],
      pm: [''],
      pmSp: [''],
      lo: [''],
      loSp: [''],
      dpm: [''],
      dpmSp: [''],
      dlo: [''],
      dloSp: [''],
      mg: [''],
      mgSp: [''],
      mo: [''],
      moSp: [''],
      gw: [''],
      gwSp: [''],
      ow: [''],
      owSp: [''],
      thematic: [''],
      prefix: [''],
      tournament: [''],
      infoSlideOne: [''],
      infoSlideTwo: [''],
      chair: [''],
      wingOne: [''],
      wingTwo: [''],
      wingThree: [''],
      og: [''],
      oo: [''],
      cg: [''],
      co: [''],
    });
  }

  public clearForm() {
    this.form.reset();
  }

  public createDebate() {
    const pm = this.debaters.find((debater: Debater) => debater.id === this.form.controls['pm'].value)!;
    const lo = this.debaters.find((debater: Debater) => debater.id === this.form.controls['lo'].value)!;
    const dpm = this.debaters.find((debater: Debater) => debater.id === this.form.controls['dpm'].value)!;
    const dlo = this.debaters.find((debater: Debater) => debater.id === this.form.controls['dlo'].value)!;
    const mg = this.debaters.find((debater: Debater) => debater.id === this.form.controls['mg'].value)!;
    const mo = this.debaters.find((debater: Debater) => debater.id === this.form.controls['mo'].value)!;
    const gw = this.debaters.find((debater: Debater) => debater.id === this.form.controls['gw'].value)!;
    const ow = this.debaters.find((debater: Debater) => debater.id === this.form.controls['ow'].value)!;
    const pmSp = Number(this.form.controls['pmSp'].value);
    const loSp = Number(this.form.controls['loSp'].value);
    const dpmSp = Number(this.form.controls['dpmSp'].value);
    const dloSp = Number(this.form.controls['dloSp'].value);
    const mgSp = Number(this.form.controls['mgSp'].value);
    const moSp = Number(this.form.controls['moSp'].value);
    const gwSp = Number(this.form.controls['gwSp'].value);
    const owSp = Number(this.form.controls['owSp'].value);
    const og = this.duos.find((duo: Duo) => duo.id === this.form.controls['og'].value)!;
    const oo = this.duos.find((duo: Duo) => duo.id === this.form.controls['oo'].value)!;
    const cg = this.duos.find((duo: Duo) => duo.id === this.form.controls['cg'].value)!;
    const co = this.duos.find((duo: Duo) => duo.id === this.form.controls['co'].value)!;
    const chair = this.judges.find((judge: Judge) => judge.id === this.form.controls['chair'].value)!;
    const wings: Judge[] = [];
    if (this.form.controls['wingOne'].value)
      wings.push(this.judges.find((judge: Judge) => judge.id === this.form.controls['wingOne'].value)!);
    if (this.form.controls['wingTwo'].value)
      wings.push(this.judges.find((judge: Judge) => judge.id === this.form.controls['wingTwo'].value)!);
    if (this.form.controls['wingThree'].value)
      wings.push(this.judges.find((judge: Judge) => judge.id === this.form.controls['wingThree'].value)!);
    const motion = this.form.controls['motion'].value;
    const infoSlides: string[] = [];
    if (this.form.controls['infoSlideOne'].value)
      infoSlides.push(this.form.controls['infoSlideOne'].value);
    if (this.form.controls['infoSlideTwo'].value)
      infoSlides.push(this.form.controls['infoSlideTwo'].value);
    const date = new Date().toISOString();
    const thematic = this.form.controls['thematic'].value;
    const prefix = this.form.controls['prefix'].value;
    const tournament = this.form.controls['tournament'].value;

    const token = localStorage.getItem('token')!;

    this.tabdebService.createDebate(
      token,
      pm,
      lo,
      dpm,
      dlo,
      mg,
      mo,
      gw,
      ow,
      pmSp,
      loSp,
      dpmSp,
      dloSp,
      mgSp,
      moSp,
      gwSp,
      owSp,
      og,
      oo,
      cg,
      co,
      chair,
      wings,
      motion,
      infoSlides,
      date,
      thematic,
      prefix,
      tournament
    ).subscribe(() => {});
    this.updateTrs(
      motion,
      this.utilsService.getDuoName(og),
      this.utilsService.getDuoName(oo),
      this.utilsService.getDuoName(cg),
      this.utilsService.getDuoName(co),
      chair.name,
    );

    this.clearForm();
  }

  public getAllDebaters() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDebaters(token).subscribe((debaters: Debater[]) => {
      this.debaters = debaters;
      this.getDebatersOptions();
    });
  }

  public getAllJudges() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllJudges(token).subscribe((judges: Judge[]) => {
      this.judges = judges;
      this.getJudgesOptions();
    });
  }

  public getAllDuos() {
    const token = localStorage.getItem('token')!;

    this.tabdebService.getAllDuos(token).subscribe((duos: Duo[]) => {
      this.duos = duos;
      this.getDuosOptions();
    });
  }

  public getDebatersOptions() {
    this.debatersOptions = this.debaters.map((debater: Debater) => ({
      id: debater.id,
      value: debater.name
    }));
  }

  public getJudgesOptions() {
    this.judgesOptions = this.judges.map((judge: Judge) => ({
      id: judge.id,
      value: judge.name
    }));
  }

  public getDuosOptions() {
    this.duosOptions = this.duos.map((duo: Duo) => ({
      id: duo.id,
      value: this.utilsService.getDuoName(duo)
    }))
  }

  public subscribeToValueChanges() {
    this.form.controls['og'].valueChanges.subscribe((id: string) => {
      if (!id) {
        this.form.controls['pm'].patchValue("");
        this.form.controls['dpm'].patchValue("");
        this.form.controls['pmSp'].patchValue("");
        this.form.controls['dpmSp'].patchValue("");
        return;
      }

      const duo: Duo = this.duos.find((duo: Duo) => duo.id === id)!;

      this.form.controls['pm'].patchValue(duo.a.id);
      this.form.controls['dpm'].patchValue(duo.b.id);
    });

    this.form.controls['oo'].valueChanges.subscribe((id: string) => {
      if (!id) {
        this.form.controls['lo'].patchValue("");
        this.form.controls['dlo'].patchValue("");
        this.form.controls['loSp'].patchValue("");
        this.form.controls['dloSp'].patchValue("");
        return;
      }

      const duo: Duo = this.duos.find((duo: Duo) => duo.id === id)!;

      this.form.controls['lo'].patchValue(duo.a.id);
      this.form.controls['dlo'].patchValue(duo.b.id);
    });

    this.form.controls['cg'].valueChanges.subscribe((id: string) => {
      if (!id) {
        this.form.controls['mg'].patchValue("");
        this.form.controls['gw'].patchValue("");
        this.form.controls['mgSp'].patchValue("");
        this.form.controls['gwSp'].patchValue("");
        return;
      }

      const duo: Duo = this.duos.find((duo: Duo) => duo.id === id)!;

      this.form.controls['mg'].patchValue(duo.a.id);
      this.form.controls['gw'].patchValue(duo.b.id);
    });

    this.form.controls['co'].valueChanges.subscribe((id: string) => {
      if (!id) {
        this.form.controls['mo'].patchValue("");
        this.form.controls['ow'].patchValue("");
        this.form.controls['moSp'].patchValue("");
        this.form.controls['owSp'].patchValue("");
        return;
      }

      const duo: Duo = this.duos.find((duo: Duo) => duo.id === id)!;

      this.form.controls['mo'].patchValue(duo.a.id);
      this.form.controls['ow'].patchValue(duo.b.id);
    });
  }

  public switchDuo(positionA: string, positionB: string) {
      const aId: string = this.form.controls[positionA].value;
      const bId: string = this.form.controls[positionB].value;
      const aSp: number = this.form.controls[positionA + 'Sp'].value;
      const bSp: number = this.form.controls[positionB + 'Sp'].value;

      this.form.controls[positionA].patchValue(bId);
      this.form.controls[positionB].patchValue(aId);
      this.form.controls[positionA + 'Sp'].patchValue(bSp);
      this.form.controls[positionB + 'Sp'].patchValue(aSp);
  }

  public getMotionsOptions() {
    this.motionsOptions = [...new Set(this.debates.map((debate: Debate) => debate.motion))]
      .map((motion: string) => ({
        id: motion,
        value: motion
      }));
  }
  public getThematicsOptions() {
    this.thematicsOptions = [...new Set(this.debates.map((debate: Debate) => debate.thematic))]
      .map((thematic: string) => ({
        id: thematic,
        value: thematic
      }));
  }
  public getPrefixesOptions() {
    this.prefixesOptions = [...new Set(this.debates.map((debate: Debate) => debate.prefix))]
      .map((prefix: string) => ({
        id: prefix,
        value: prefix
      }));
  }
  public getTournamentsOptions() {
    this.tournamentsOptions = [...new Set(this.debates.map((debate: Debate) => debate.tournament))]
      .map((tournament: string) => ({
        id: tournament,
        value: tournament
      }));
  }

  public getInfoSlidesOptions() {
    this.infoSlidesOptions = [...new Set(this.debates.map((debate: Debate) => debate.infoSlides).flat())]
      .map((infoSlide: string) => ({
        id: infoSlide,
        value: infoSlide
      }));
  }

  public selectDebate(index: number) {
    const debate: Debate = this.debates[index];

    this.form.controls['motion'].patchValue(debate.motion);
    this.form.controls['pm'].patchValue(debate.pm.id);
    this.form.controls['pmSp'].patchValue(debate.pmSp);
    this.form.controls['lo'].patchValue(debate.lo.id);
    this.form.controls['loSp'].patchValue(debate.loSp);
    this.form.controls['dpm'].patchValue(debate.dpm.id);
    this.form.controls['dpmSp'].patchValue(debate.dpmSp);
    this.form.controls['dlo'].patchValue(debate.dlo.id);
    this.form.controls['dloSp'].patchValue(debate.dloSp);
    this.form.controls['mg'].patchValue(debate.mg.id);
    this.form.controls['mgSp'].patchValue(debate.mgSp);
    this.form.controls['mo'].patchValue(debate.mo.id);
    this.form.controls['moSp'].patchValue(debate.moSp);
    this.form.controls['gw'].patchValue(debate.gw.id);
    this.form.controls['gwSp'].patchValue(debate.gwSp);
    this.form.controls['ow'].patchValue(debate.ow.id);
    this.form.controls['owSp'].patchValue(debate.owSp);
    this.form.controls['thematic'].patchValue(debate.thematic);
    this.form.controls['prefix'].patchValue(debate.prefix);
    this.form.controls['tournament'].patchValue(debate.tournament);
    const infoSlideOne = debate.infoSlides.length > 0 ? debate.infoSlides[0] : null;
    const infoSlideTwo = debate.infoSlides.length > 1 ? debate.infoSlides[1] : null;
    this.form.controls['infoSlideOne'].patchValue(infoSlideOne);
    this.form.controls['infoSlideTwo'].patchValue(infoSlideTwo);
    this.form.controls['chair'].patchValue(debate.chair.id);
    const wingOne = debate.wings.length > 0 ? debate.wings[0].id : null;
    const wingTwo = debate.wings.length > 1 ? debate.wings[1].id : null;
    const wingThree = debate.wings.length > 2 ? debate.wings[2].id : null;
    this.form.controls['wingOne'].patchValue(wingOne);
    this.form.controls['wingTwo'].patchValue(wingTwo);
    this.form.controls['wingThree'].patchValue(wingThree);
    this.form.controls['og'].patchValue(debate.og.id);
    this.form.controls['oo'].patchValue(debate.oo.id);
    this.form.controls['cg'].patchValue(debate.cg.id);
    this.form.controls['co'].patchValue(debate.co.id);
  }
}
